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

export const loadPokemonData = async (dbContext: PGliteWithLive, generationToLoad: DateData[], batchSize: number) => {
    for (const gen of generationToLoad) {
        console.log(`Gen ${gen.generation_id} identified for update.`);
        // TODO: logInfoWithAttention(`Gen ${gen.generation_id} identified for update.`);

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

const loadPokemon = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon[], batchSize: number) => {
    // TODO: I still want to to try to be loading multiple pokemon at once...
    for (const pkmn of pokemonToLoad) {
        // TODO: logInfo(`Loading data for ${pkmn.name}.`)
        console.log(`${batchSize} - Loading data for ${pkmn.name}.`);
        await startLoad(dbContext, pkmn, (new Date().toISOString()));
    }
}

const startLoad  = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, loadStartTime: string ) => {
    // TODO: maybe add some timing...better logging
    // TODO: logInfoVerbose(`Loading base data for: ${pokemonToLoad.name}...`);
    console.log(`Loading base data for: ${pokemonToLoad.name}...`);

    const parsedBaseData = await loadBasePokemonData(dbContext, pokemonToLoad, loadStartTime);

    const pokemonSpeciesToLoad: Pokemon = { name: parsedBaseData.name, url: parsedBaseData.species_url };
    
    const imagesToGet = {
        id: parsedBaseData.id,
        name: parsedBaseData.name,
        male_sprite: parsedBaseData.male_sprite_url,
        female_sprite: parsedBaseData.female_sprite_url
    };
    
    // TODO: logInfoVerbose(`Loading species data for: ${pokemonToLoad.name}...`);
    console.log(`Loading species data for: ${pokemonToLoad.name}...`);
    const varietiesToGet = await loadSpeciesPokemonData(dbContext, pokemonSpeciesToLoad, loadStartTime);
    
    await loadPokemonImages(dbContext, imagesToGet);
    
    if (varietiesToGet.length > 0) {
        for (const variety of varietiesToGet) {
            // TODO: logInfoVerbose(`Loading remaining special forms for: ${variety.name}...`);
            console.log(`Loading remaining special forms for: ${variety.name}...`);
            const varietiesImagesLeftToGet = await loadBasePokemonData(dbContext, variety, loadStartTime);
            
            const imagesToGet = {
                id: varietiesImagesLeftToGet.id,
                name: varietiesImagesLeftToGet.name,
                male_sprite: varietiesImagesLeftToGet.male_sprite_url,
                female_sprite: varietiesImagesLeftToGet.female_sprite_url
            };
            
            // TODO: logInfoVerbose(`Loading remaining special forms image for: ${variety.name}...`);
            console.log(`Loading remaining special forms image for: ${variety.name}...`);
            await loadPokemonImages(dbContext, imagesToGet);
        }
    }
}

const loadSpeciesPokemonData = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, loadStartTime: string ): Promise<Pokemon[]> => {
    // TODO: logInfoVerbose(`fetching species data: ${pokemonToLoad.name}`);
    console.log(`${loadStartTime} - fetching species data: ${pokemonToLoad.name}`);
    const pokemonSpeciesData = await fetchPokeApiData(pokemonToLoad.url)
    
    // TODO: logInfoVerbose(`parsing species data: ${pokemonToLoad.name}`);
    console.log(`${loadStartTime} - parsing species data: ${pokemonToLoad.name}`);
    const [parsedData, varieties] = await parsePokemonSpeciesData(pokemonSpeciesData);

    // TODO: logInfoVerbose(`storing species data: ${pokemonToLoad.name}`);
    console.log(`${loadStartTime} - storing species data: ${pokemonToLoad.name}`);
    await upsertPokemonSpeciesData(dbContext, parsedData);
    await upsertPokedexData(dbContext, parsedData);

    return varieties.map(v => v.pokemon);
}

const loadBasePokemonData = async ( dbContext: PGliteWithLive, pokemonToLoad: Pokemon, loadStartTime: string ) => {
    // TODO: logInfoVerbose(`fetching base data: ${pokemonToLoad.name}`);
    console.log(`${loadStartTime} - fetching base data: ${pokemonToLoad.name}`);
    const fetchedData = await fetchPokeApiData(pokemonToLoad.url);

    // TODO: logInfoVerbose(`parsing base data: ${pokemonToLoad.name}`);
    console.log(`${loadStartTime} - parsing base data: ${pokemonToLoad.name}`);
    const parsedData = await parsePokemonBaseData(fetchedData);

    // TODO: logInfoVerbose(`storing base data: ${pokemonToLoad.name}`);
    console.log(`${loadStartTime} - storing base data: ${pokemonToLoad.name}`);
    await upsertPokemonBaseData(dbContext, parsedData);

    return parsedData;
}

const loadPokemonImages = async (dbContext: PGliteWithLive, pkmnImgdata: PokemonImageData ) => {
    pkmnImgdata.male_sprite = await fetchPokeApiImage(pkmnImgdata.male_sprite as string);
    if (pkmnImgdata.female_sprite) pkmnImgdata.female_sprite = await fetchPokeApiImage(pkmnImgdata.female_sprite as string);

    upsertPokemonImage(dbContext, pkmnImgdata);
}
