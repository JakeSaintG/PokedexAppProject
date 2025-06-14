import { 
    getPokemonSpeciesToLoad,
    upsertPokemonImage,
    upsertPokedexData,
    upsertPokemonBaseData,
    upsertPokemonSpeciesData 
} from "../data/pokemonData";
import { Pokemon } from "../types/pokemon";
import { PokemonBaseData } from "../types/pokemonData";
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
    for (const pkmn of pokemonToLoad) {
        await startLoad(pkmn, (new Date().toISOString()))
    }
}

const startLoad  = async ( pokemonToLoad: Pokemon, loadStartTime: string ) => {
    // TODO: maybe add some timing...better logging
    console.log(`Loading base data for: ${pokemonToLoad.name}...`);
    const parsedBaseData = await loadBasePokemonData(pokemonToLoad, loadStartTime);
    
    // TODO: throw out getPokemonSpeciesToLoad function
    const pokemonSpeciesToLoad: Pokemon = { name: parsedBaseData.name, url: parsedBaseData.species_url };
    
    const imagesToGet = {
        id: parsedBaseData.id,
        name: parsedBaseData.name,
        male_sprite: parsedBaseData.male_sprite_url,
        female_sprite: parsedBaseData.female_sprite_url
    };
    
    console.log(`Loading species data for: ${pokemonToLoad.name}...`);
    const varietiesToGet = await loadSpeciesPokemonData(pokemonSpeciesToLoad, loadStartTime);
    
    await loadPokemonImages(imagesToGet);
    
    if (varietiesToGet.length > 0) {
        for (const variety of varietiesToGet) {
            console.log(`Loading remaining special forms for: ${variety.name}...`);
            const varietiesImagesLeftToGet = await loadBasePokemonData(variety, loadStartTime);
            
            const imagesToGet = {
                id: varietiesImagesLeftToGet.id,
                name: varietiesImagesLeftToGet.name,
                male_sprite: varietiesImagesLeftToGet.male_sprite_url,
                female_sprite: varietiesImagesLeftToGet.female_sprite_url
            };
            
            console.log(`Loading remaining special forms image for: ${variety.name}...`);
            await loadPokemonImages(imagesToGet);
        }
    }
}

const loadSpeciesPokemonData = async ( pokemonToLoad: Pokemon, loadStartTime: string ): Promise<Pokemon[]> => {
    // TODO: verbose logging
    // console.log(`fetching species data: ${pokemonToLoad.name}`);
    const pokemonSpeciesData = await fetchPokeApiData(pokemonToLoad.url)
    
    // console.log(`parsing species data: ${pokemonToLoad.name}`);
    const [parsedData, varieties] = parsePokemonSpeciesData(pokemonSpeciesData);

    // console.log(`storing species data: ${pokemonToLoad.name}`);
    upsertPokemonSpeciesData(parsedData);
    upsertPokedexData(parsedData);

    return varieties.map(v => v.pokemon);
}

const loadBasePokemonData = async (  pokemonToLoad: Pokemon, loadStartTime: string ) => {
    // TODO: verbose logging
    // console.log(`fetching base data: ${pokemonToLoad.name}`)
    const fetchedData = await fetchPokeApiData(pokemonToLoad.url);
    
    // console.log(`parsing base data: ${pokemonToLoad.name}`)
    const parsedData = await parsePokemonBaseData(fetchedData);

    // console.log(`storing base data: ${pokemonToLoad.name}`);
    await upsertPokemonBaseData(parsedData);

    return parsedData;
}

const loadPokemonImages = async ( pkmnImgdata: PokemonImageData ) => {
    pkmnImgdata.male_sprite = await fetchPokeApiImage(pkmnImgdata.male_sprite);
    if (pkmnImgdata.female_sprite) pkmnImgdata.female_sprite = await fetchPokeApiImage(pkmnImgdata.female_sprite);

    upsertPokemonImage(pkmnImgdata)
}
