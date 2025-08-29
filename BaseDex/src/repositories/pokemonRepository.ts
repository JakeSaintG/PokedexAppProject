import { 
    upsertPokemonImage,
    upsertPokedexData,
    upsertPokemonBaseData,
    upsertPokemonSpeciesData 
} from "../postgres/data/pokemonData";
import type { DateData } from "../types/dateData";
import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { Pokemon } from "../types/pokemon";
import type { PokemonImageData } from "../types/pokemonImageData";
import { updateLocalLastModified, getGenerationCountOffset } from "./configurationRepository";
// import { logInfo, logInfoVerbose, logInfoWithAttention } from "./logRepository";
import { 
    fetchPokeApiData, 
    fetchPkmnToLoad, 
    parsePokemonBaseData, 
    parsePokemonSpeciesData, 
    fetchPokeApiImage
} from "./pokeApiRepository";
import { logInfo, logInfoVerbose, logInfoWithAttention } from "./logRepository";

export const loadPokemonData = async (dbContext: PGliteWithLive, generationToLoad: DateData[], batchSize: number) => {
    for (const gen of generationToLoad) {
        logInfoWithAttention(dbContext, `Gen ${gen.generation_id} identified for update.`);

        try {
            const [count, offset] = await getGenerationCountOffset(dbContext, gen.generation_id!);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));
            await loadPokemon(dbContext, fetchedPokemon, batchSize);

            updateLocalLastModified(dbContext, gen.generation_id!);
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

// I still want to do something with batch size
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadPokemon = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon[], batchSize: number) => {
    // TODO: I still want to to try to be loading multiple pokemon at once...
    for (const pkmn of pokemonToLoad) {
        logInfo(dbContext, `Loading data for ${pkmn.name}.`)
        await startLoad(dbContext, pkmn, new Date().toISOString());
    }
}

const startLoad  = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, loadStartTime: string ) => {
    // TODO: maybe add some timing...better logging
    logInfoVerbose(dbContext, `Loading base data for: ${pokemonToLoad.name}...`);

    const parsedBaseData = await loadBasePokemonData(dbContext, pokemonToLoad, loadStartTime);

    const pokemonSpeciesToLoad: Pokemon = { name: parsedBaseData.name, url: parsedBaseData.species_url };
    
    const imagesToGet = {
        id: parsedBaseData.id,
        name: parsedBaseData.name,
        male_sprite: parsedBaseData.male_sprite_url,
        female_sprite: parsedBaseData.female_sprite_url
    };
    
    logInfoVerbose(dbContext, `Loading species data for: ${pokemonToLoad.name}...`);
    const varietiesToGet = await loadSpeciesPokemonData(dbContext, pokemonSpeciesToLoad, loadStartTime);
    
    await loadPokemonImages(dbContext, imagesToGet);
    
    if (varietiesToGet.length > 0) {
        for (const variety of varietiesToGet) {
            logInfoVerbose(dbContext, `${loadStartTime} - Loading remaining special forms for: ${variety.name}...`);
            const varietiesImagesLeftToGet = await loadBasePokemonData(dbContext, variety, loadStartTime);
            
            const imagesToGet = {
                id: varietiesImagesLeftToGet.id,
                name: varietiesImagesLeftToGet.name,
                male_sprite: varietiesImagesLeftToGet.male_sprite_url,
                female_sprite: varietiesImagesLeftToGet.female_sprite_url
            };
            
            logInfoVerbose(dbContext, `${loadStartTime} - Loading remaining special forms image for: ${variety.name}...`);
            await loadPokemonImages(dbContext, imagesToGet);
        }
    }
}

const loadSpeciesPokemonData = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, loadStartTime: string ): Promise<Pokemon[]> => {
    logInfoVerbose(dbContext, `${loadStartTime} - fetching species data: ${pokemonToLoad.name}`);
    const pokemonSpeciesData = await fetchPokeApiData(pokemonToLoad.url)
    
    logInfoVerbose(dbContext, `${loadStartTime} - parsing species data: ${pokemonToLoad.name}`);
    const [parsedData, varieties] = await parsePokemonSpeciesData(pokemonSpeciesData);

    logInfoVerbose(dbContext, `${loadStartTime} - storing species data: ${pokemonToLoad.name}`);
    await upsertPokemonSpeciesData(dbContext, parsedData);
    await upsertPokedexData(dbContext, parsedData);

    return varieties.map(v => v.pokemon);
}

const loadBasePokemonData = async ( dbContext: PGliteWithLive, pokemonToLoad: Pokemon, loadStartTime: string ) => {
    logInfoVerbose(dbContext, `${loadStartTime} - fetching base data: ${pokemonToLoad.name}`);
    const fetchedData = await fetchPokeApiData(pokemonToLoad.url);

    logInfoVerbose(dbContext, `${loadStartTime} - parsing base data: ${pokemonToLoad.name}`);
    const parsedData = await parsePokemonBaseData(fetchedData);

    logInfoVerbose(dbContext, `${loadStartTime} - storing base data: ${pokemonToLoad.name}`);
    await upsertPokemonBaseData(dbContext, parsedData);

    return parsedData;
}

const loadPokemonImages = async (dbContext: PGliteWithLive, pkmnImgdata: PokemonImageData ) => {
    pkmnImgdata.male_sprite = await fetchPokeApiImage(pkmnImgdata.male_sprite as string);
    if (pkmnImgdata.female_sprite) pkmnImgdata.female_sprite = await fetchPokeApiImage(pkmnImgdata.female_sprite as string);

    upsertPokemonImage(dbContext, pkmnImgdata);
}
