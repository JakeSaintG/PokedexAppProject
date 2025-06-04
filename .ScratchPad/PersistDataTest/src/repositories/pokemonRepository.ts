import { 
    getPokemonSpeciesToLoad,
    upsertPokemonImage,
    upsertPokedexData,
    upsertPokemonBaseData,
    upsertPokemonSpeciesData 
} from "../data/pokemonData";
import { Pokemon } from "../types/pokemon";
import { PokemonImageData } from "../types/pokemonImageData";
import { Variety } from "../types/varieties";
import { batchArray } from "../utils/utils";
import { updateLocalLastModified,
    getGenerationCountOffset,
    getLastLocalGenerationUpdate
} from "./configurationRepository";
import { 
    fetchPokeApiData, 
    fetchPkmnToLoad, 
    parsePokemonBaseData, 
    parsePokemonSpeciesData, 
    fetchPokeApiImage
} from "./pokeApiRepository";

export const loadPokemonData = async (forceUpdate: boolean, batchSize: number) => {
    const generationsLastUpdatedLocally = getLastLocalGenerationUpdate();

    // TODO: When empty, load gen 1
    // TODO: Allow user to trigger all other gen fetching (using limit and offset)
    generationsLastUpdatedLocally.forEach( async (gen) => {
        if(gen.local_last_modified_dts === '' || forceUpdate) {
            console.log(`Gen ${gen.generation_id} identified for update.`);

            const [count, offset] = getGenerationCountOffset(gen.generation_id);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));
            await batchLoadPokemon(fetchedPokemon, batchSize);

            updateLocalLastModified(gen.generation_id);
        }
    });
};

const batchLoadPokemon = async ( pokemonToLoad: Pokemon[], batchSize: number) => {
    let batchCounter = 1;

    batchArray(pokemonToLoad, batchSize)
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
    let imagesToGet: PokemonImageData[] = [];
    
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
                male_sprite: parsedData.male_sprite_url,
                female_sprite: parsedData.female_sprite_url
            })

            return parsedData;
        })
    )
    .then(parsedData => 
        parsedData.map((p) => 
            upsertPokemonBaseData(p)
        )
    )

    return imagesToGet;
}

const loadPokemonImages = async ( loadPokemonImages: PokemonImageData[] ) => {
    await Promise.all(
        loadPokemonImages.map(async (p: PokemonImageData) => { 
            p.male_sprite = await fetchPokeApiImage(p.male_sprite);
            if (p.female_sprite) p.female_sprite = await fetchPokeApiImage(p.female_sprite);
            
            return p;
        })
    )
    .then(parsedData => 
        parsedData.map((p: PokemonImageData) => 
            upsertPokemonImage(p)
        )
    )
}
