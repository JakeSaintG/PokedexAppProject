import { 
    upsertPokemonImage,
    upsertPokedexData,
    upsertPokemonBaseData,
    upsertPokemonSpeciesData, 
    getRegionCountData,
    getPokedexList
} from "../postgres/data/pokemonData";
import type { DateData } from "../types/dateData";
import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { Pokemon } from "../types/pokemon";
import type { PokemonImageData } from "../types/pokemonImageData";
import { updateLocalLastModified, getGenerationCountOffset, getObtainableList } from "./configurationRepository";
import { 
    fetchPokeApiData, 
    fetchPkmnToLoad, 
    parsePokemonBaseData, 
    parsePokemonSpeciesData, 
    fetchPokeApiImage
} from "./pokeApiRepository";
import { logInfo, logInfoVerbose, logInfoWithAttention } from "./logRepository";
import type { PokedexPreviewData } from "../types/pokdexPreviewData";

export const loadPokemonData = async (dbContext: PGliteWithLive, generationToLoad: DateData[], batchSize: number) => {
    const blackList = await getObtainableList(dbContext, 'black');
    const whiteList = await getObtainableList(dbContext, 'white');
    
    for (const gen of generationToLoad) {
        logInfoWithAttention(dbContext, `Gen ${gen.generation_id} identified for update.`);

        try {
            const [count, offset] = await getGenerationCountOffset(dbContext, gen.generation_id!);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));
            await loadPokemon(dbContext, fetchedPokemon, whiteList, blackList, batchSize);

            updateLocalLastModified(dbContext, gen.generation_id!);
        } catch (error) {
            console.error(`Error updating gen ${gen.generation_id} due to: ${error}`)
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
const loadPokemon = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon[], whiteList: string[], blackList: string[], batchSize: number) => {
    // TODO: I still want to to try to be loading multiple pokemon at once...
    for (const pkmn of pokemonToLoad) {
        logInfo(dbContext, `Loading data for ${pkmn.name}.`)
        await startLoad(dbContext, pkmn, whiteList, blackList, new Date().toISOString());
    }
}

const startLoad  = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, whiteList: string[], blackList: string[], loadStartTime: string ) => {
    // TODO: maybe add some timing...better logging
    logInfoVerbose(dbContext, `Loading base data for: ${pokemonToLoad.name}...`);

    const parsedBaseData = await loadBasePokemonData(dbContext, pokemonToLoad, whiteList, loadStartTime);

    const pokemonSpeciesToLoad: Pokemon = { name: parsedBaseData.name, url: parsedBaseData.species_url };
    
    const imagesToGet = {
        id: parsedBaseData.id,
        name: parsedBaseData.name,
        default_sprite: parsedBaseData.male_sprite_url,
        female_sprite: parsedBaseData.female_sprite_url
    };
    
    logInfoVerbose(dbContext, `Loading species data for: ${pokemonToLoad.name}...`);
    const varietiesToGet = await loadSpeciesPokemonData(dbContext, pokemonSpeciesToLoad, blackList, loadStartTime);
    
    await loadPokemonImages(dbContext, imagesToGet);
    
    if (varietiesToGet.length > 0) {
        for (const variety of varietiesToGet) {
            logInfoVerbose(dbContext, `${loadStartTime} - Loading remaining special forms for: ${variety.name}...`);
            const varietiesImagesLeftToGet = await loadBasePokemonData(dbContext, variety, whiteList, loadStartTime);
            
            const imagesToGet = {
                id: varietiesImagesLeftToGet.id,
                name: varietiesImagesLeftToGet.name,
                default_sprite: varietiesImagesLeftToGet.male_sprite_url,
                female_sprite: varietiesImagesLeftToGet.female_sprite_url
            };
            
            logInfoVerbose(dbContext, `${loadStartTime} - Loading remaining special forms image for: ${variety.name}...`);
            await loadPokemonImages(dbContext, imagesToGet);
        }
    }
}

const loadSpeciesPokemonData = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, blackList: string[], loadStartTime: string ): Promise<Pokemon[]> => {
    logInfoVerbose(dbContext, `${loadStartTime} - fetching species data: ${pokemonToLoad.name}`);
    const pokemonSpeciesData = await fetchPokeApiData(pokemonToLoad.url)
    
    logInfoVerbose(dbContext, `${loadStartTime} - parsing species data: ${pokemonToLoad.name}`);
    const [parsedData, varieties] = await parsePokemonSpeciesData(pokemonSpeciesData, blackList);

    logInfoVerbose(dbContext, `${loadStartTime} - storing species data: ${pokemonToLoad.name}`);
    await upsertPokemonSpeciesData(dbContext, parsedData);
    await upsertPokedexData(dbContext, parsedData);

    return varieties.map(v => v.pokemon);
}

const loadBasePokemonData = async ( dbContext: PGliteWithLive, pokemonToLoad: Pokemon, whiteList: string[], loadStartTime: string ) => {
    logInfoVerbose(dbContext, `${loadStartTime} - fetching base data: ${pokemonToLoad.name}`);
    const fetchedData = await fetchPokeApiData(pokemonToLoad.url);

    logInfoVerbose(dbContext, `${loadStartTime} - parsing base data: ${pokemonToLoad.name}`);
    const parsedData = await parsePokemonBaseData(fetchedData, whiteList);

    logInfoVerbose(dbContext, `${loadStartTime} - storing base data: ${pokemonToLoad.name}`);
    await upsertPokemonBaseData(dbContext, parsedData);

    return parsedData;
}

const loadPokemonImages = async (dbContext: PGliteWithLive, pkmnImgdata: PokemonImageData ) => {
    pkmnImgdata.default_sprite = await fetchPokeApiImage(pkmnImgdata.default_sprite as string);
    if (pkmnImgdata.female_sprite) pkmnImgdata.female_sprite = await fetchPokeApiImage(pkmnImgdata.female_sprite as string);

    upsertPokemonImage(dbContext, pkmnImgdata);
}

export const getTallGrassPageData = async (dbContext: PGliteWithLive) => {
    await getRegionCountData(dbContext);
}

export const getPokedexPageData = async (dbContext: PGliteWithLive): Promise<PokedexPreviewData[]> => {
    // TODO: handle error

    return await getPokedexList(dbContext);
}
