// TODO: Route this through the config repo. This repo shouldn't be talking to the config interface
import { getGenerationCountAndOffset, getGenerationLastUpdatedLocally } from "../data/configurationData";
import { getPokemonSpeciesToLoad, upsertPokedexData, upsertPokemonBaseData, upsertPokemonSpeciesData } from "../data/pokemonData";
import { Pokemon } from "../types/pokemon";
import { Variety } from "../types/varieties";
import { batchArray } from "../utils/utils";
import { updateLocalLastModified } from "./configurationRepository";
import { fetchPokeApiData, fetchPkmnToLoad, parsePokemonBaseData, parsePokemonSpeciesData } from "./pokeApiRepository";

export const loadPokemonData = async (forceUpdate: boolean) => {
    const generationsLastUpdatedLocally = getGenerationLastUpdatedLocally();

    // TODO: When empty, load gen 1
    // TODO: Allow user to trigger all other gen fetching (using limit and offset)
    generationsLastUpdatedLocally.forEach( async (gen) => {
        if(gen.local_last_modified_dts === '' || forceUpdate) {
            console.log(`Gen ${gen.generation_id} identified for update.`);

            const [count, offset] = getGenerationCountAndOffset(gen.generation_id);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));
            await batchLoadPokemon(fetchedPokemon);

            updateLocalLastModified(gen.generation_id);
        }
    });
};

// TODO: make batch size configurable
const batchLoadPokemon = async ( pokemonToLoad: Pokemon[]) => {
    let batchCounter = 1;
    
    batchArray(pokemonToLoad, 3)
        .forEach( async (pokemonBatch: Pokemon[]) => {
            console.log(`\r\nStarting batch ${batchCounter++}: ${pokemonBatch.map((p: Pokemon) => p.name).join(', ')}`);
            await startLoad(pokemonBatch, (new Date().toISOString()))
        })
}

const startLoad  = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    console.log(`Loading base data for: ${pokemonToLoad.map((p: Pokemon) => p.name).join(', ')}`);
    let imagesLeftToGet = await loadBasePokemonData(pokemonToLoad, loadStartTime);

    const pokemonSpeciesToLoad = getPokemonSpeciesToLoad(pokemonToLoad);
    console.log(`Loading species data for: ${pokemonSpeciesToLoad.map((p: Pokemon) => p.name).join(', ')}`);
    const varietiesLeftToGet = await loadSpeciesPokemonData(pokemonSpeciesToLoad, loadStartTime);
    
    if (varietiesLeftToGet.length > 0) {
        console.log(`Loading remaining special forms: ${varietiesLeftToGet.map((p: Pokemon) => p.name).join(', ')} `);
        const varietiesImagesLeftToGet = await loadBasePokemonData(varietiesLeftToGet, loadStartTime);
        imagesLeftToGet = imagesLeftToGet.concat( varietiesImagesLeftToGet );
    }

    loadPokemonImages(imagesLeftToGet);
    console.log(imagesLeftToGet);
}

const loadSpeciesPokemonData = async (  pokemonToLoad: Pokemon[], loadStartTime: string ): Promise<Pokemon[]> => {
    let varietiesToGet: Variety[] = [];

    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) => 
            await fetchPokeApiData(p.url)
        )
    )
    .then((downloadedData) => 
        downloadedData.map((p) => {
            const [parsedData, varieties] = parsePokemonSpeciesData(p);
            varietiesToGet = varietiesToGet.concat(varieties);
            return parsedData;
        })
    )
    .then(parsedData => 
        parsedData.map((p) => {
            upsertPokemonSpeciesData(p);
            upsertPokedexData(p);
        })
    )

    return varietiesToGet.map(v => v.pokemon);
}

const loadBasePokemonData = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    let imagesToGet = [];
    
    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) => {
            const fetched = await fetchPokeApiData(p.url);
            return {data: fetched, url: p.url };
        })
    )
    .then((downloadedData) => 
        downloadedData.map((p) => {
            const parsedData = parsePokemonBaseData(p.data, p.url)

            imagesToGet.push({
                id: parsedData.id,
                name: parsedData.name,
                male_sprite_url: parsedData.male_sprite_url,
                female_sprite_url: parsedData.female_sprite_url
            })

            return parsedData;
        })
    )
    .then(parsedData => 
        parsedData.map((p) => 
            // TODO: maybe return a list of images to get here?
            upsertPokemonBaseData(p)
        )
    )

    return imagesToGet;
}

const loadPokemonImages = async ( loadPokemonImages ) => {
    await Promise.all(
        loadPokemonImages.map(async (p) => 
            console.log('fetch')
            // await fetchPokeApiData(p.url)
        )
    )
    .then((downloadedData) => 
    downloadedData.map((p) => 
        console.log('parse')
        // parsePokemonBaseData(p.data, p.url)
        )
    )
    .then(parsedData => 
        parsedData.map((p) => 
            console.log('save')
            // upsertPokemonBaseData(p)
        )
    )
}
