import { 
    upsertPokemonImage,
    upsertPokedexData,
    upsertPokemonBaseData,
    upsertPokemonSpeciesData 
} from "../data/pokemonData";
import { ConfigurationData, Obtainable } from "../types/configurationData";
import { DateData } from "../types/dateData";
import { Pokemon } from "../types/pokemon";
import { PokemonImageData } from "../types/pokemonImageData";
import { updateLocalLastModified, getGenerationCountOffset, getObtainableList } from "./configurationRepository";
import { logInfo, logInfoVerbose, logInfoWithAttention } from "./logRepository";
import { 
    fetchPokeApiData, 
    fetchPkmnToLoad, 
    parsePokemonBaseData, 
    parsePokemonSpeciesData, 
    fetchPokeApiImage
} from "./pokeApiRepository";

export const loadPokemonData = async ( generationToLoad: DateData[], batchSize: number) => {
    // GET CONFIG DATA FROM DB HERE
    const blackList = getObtainableList('black');
    const whiteList = getObtainableList('white');

    for (const gen of generationToLoad) {
        logInfoWithAttention(`Gen ${gen.generation_id} identified for update.`);

        try {
            const [count, offset] = getGenerationCountOffset(gen.generation_id);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));
            await loadPokemon(fetchedPokemon, whiteList, blackList, batchSize);

            updateLocalLastModified(gen.generation_id);
        } catch (error) {
            console.error(`Error updating ${gen.generation_id} due to: ${error}`)
        }
    }
};

export const checkIfUpdatesNeeded = (dateData: DateData[], forceUpdate: boolean): DateData[] => {
    return dateData.filter(d => {
        if((d.local_last_modified_dts === '' || forceUpdate) && d.active) {
            return d;
        }
    })
}

const loadPokemon = async ( pokemonToLoad: Pokemon[], whiteList: Obtainable[], blackList: Obtainable[], batchSize: number) => {
    // TODO: I still want to to try to be loading multiple pokemon at once...
    for (const pkmn of pokemonToLoad) {
        logInfo(`Loading data for ${pkmn.name}.`)
        await startLoad(pkmn, whiteList, blackList,(new Date().toISOString()))
    }
}

const startLoad  = async ( pokemonToLoad: Pokemon, whiteList: Obtainable[], blackList: Obtainable[], loadStartTime: string ) => {
    // TODO: maybe add some timing...better logging
    logInfoVerbose(`Loading base data for: ${pokemonToLoad.name}...`);
    const parsedBaseData = await loadBasePokemonData(pokemonToLoad, whiteList, loadStartTime);
    
    const pokemonSpeciesToLoad: Pokemon = { name: parsedBaseData.name, url: parsedBaseData.species_url };
    
    const imagesToGet = {
        id: parsedBaseData.id,
        name: parsedBaseData.name,
        male_sprite: parsedBaseData.male_sprite_url,
        female_sprite: parsedBaseData.female_sprite_url
    };
    
    logInfoVerbose(`Loading species data for: ${pokemonToLoad.name}...`);
    const varietiesToGet = await loadSpeciesPokemonData(pokemonSpeciesToLoad, blackList, loadStartTime);
    
    await loadPokemonImages(imagesToGet);
    
    if (varietiesToGet.length > 0) {
        for (const variety of varietiesToGet) {
            logInfoVerbose(`Loading remaining special forms for: ${variety.name}...`);
            const varietiesImagesLeftToGet = await loadBasePokemonData(variety, whiteList, loadStartTime);
            
            const imagesToGet = {
                id: varietiesImagesLeftToGet.id,
                name: varietiesImagesLeftToGet.name,
                male_sprite: varietiesImagesLeftToGet.male_sprite_url,
                female_sprite: varietiesImagesLeftToGet.female_sprite_url
            };
            
            logInfoVerbose(`Loading remaining special forms image for: ${variety.name}...`);
            await loadPokemonImages(imagesToGet);
        }
    }
}

const loadSpeciesPokemonData = async ( pokemonToLoad: Pokemon, blackList: Obtainable[], loadStartTime: string ): Promise<Pokemon[]> => {
    logInfoVerbose(`fetching species data: ${pokemonToLoad.name}`);
    const pokemonSpeciesData = await fetchPokeApiData(pokemonToLoad.url)
    
    logInfoVerbose(`parsing species data: ${pokemonToLoad.name}`);
    const [parsedData, varieties] = parsePokemonSpeciesData(pokemonSpeciesData, blackList);

    logInfoVerbose(`storing species data: ${pokemonToLoad.name}`);
    upsertPokemonSpeciesData(parsedData);
    upsertPokedexData(parsedData);

    return varieties.map(v => v.pokemon);
}

const loadBasePokemonData = async (  pokemonToLoad: Pokemon,  whiteList: Obtainable[], loadStartTime: string ) => {
    logInfoVerbose(`fetching base data: ${pokemonToLoad.name}`)
    const fetchedData = await fetchPokeApiData(pokemonToLoad.url);
    
    logInfoVerbose(`parsing base data: ${pokemonToLoad.name}`)
    const parsedData = await parsePokemonBaseData(fetchedData, whiteList);

    logInfoVerbose(`storing base data: ${pokemonToLoad.name}`);
    await upsertPokemonBaseData(parsedData);

    return parsedData;
}

const loadPokemonImages = async ( pkmnImgdata: PokemonImageData ) => {
    pkmnImgdata.male_sprite = await fetchPokeApiImage(pkmnImgdata.male_sprite);
    if (pkmnImgdata.female_sprite) pkmnImgdata.female_sprite = await fetchPokeApiImage(pkmnImgdata.female_sprite);

    upsertPokemonImage(pkmnImgdata)
}
