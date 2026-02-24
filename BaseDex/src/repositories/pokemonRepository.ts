import { 
    upsertPokemonImage,
    upsertPokedexData,
    upsertPokemonBaseData,
    upsertPokemonSpeciesData, 
    getRegionCountData,
    getPokedexList,
    getPokedexEntry,
    setPokedexRegistered,
    getHabitatData,
    updateAllPkmnRegistered
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
import type { PokedexEntryData } from "../types/pokedexEntryData";
import type { Habitat, RegionCountData } from "../types/regionCountData";

export const loadPokemonData = async (
    dbContext: PGliteWithLive,
    generationToLoad: DateData[],
    batchSize: number,
    setLoadingText: (txt:string) => void
) => {
    const blackList = await getObtainableList(dbContext, 'black');
    const whiteList = await getObtainableList(dbContext, 'white');
    
    for (const gen of generationToLoad) {
        logInfoWithAttention(dbContext, `Gen ${gen.generation_id} identified for update.`);
        setLoadingText(`Loading Gen ${gen.generation_id}`);

        try {
            const [count, offset] = await getGenerationCountOffset(dbContext, gen.generation_id!);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));

            if (gen.generation_id) {
                await loadPokemon(dbContext, fetchedPokemon, whiteList, blackList, batchSize, gen.generation_id, setLoadingText);
            }

            updateLocalLastModified(dbContext, gen.generation_id!);
        } catch (error) {
            console.error(`Error updating gen ${gen.generation_id} due to: ${error}`)
        }

        setLoadingText(`Done!`);
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
const loadPokemon = async (
    dbContext: PGliteWithLive,
    pokemonToLoad: Pokemon[],
    whiteList: string[],
    blackList: string[],
    batchSize: number,
    generationId: number,
    setLoadingText: (txt:string) => void
) => {
    // TODO: I still want to to try to be loading multiple pokemon at once...
    // TODO: actually use batchSize for something
    for (const pkmn of pokemonToLoad) {
        logInfo(dbContext, `${batchSize} - Loading data for ${pkmn.name}.`)
        setLoadingText(`Loading Gen ${generationId}: \r\n${pkmn.name}`);

        await startLoad(dbContext, pkmn, whiteList, blackList, new Date().toISOString());

        // TODO: handle errors and retry at least once. 
        // Move to next pkmn if there is a failure, increment a failure counter, and try the next pkmn
        // If the next pkmn fails, break out of loop and send a failure message up the stack
    }
}

const startLoad  = async (dbContext: PGliteWithLive, pokemonToLoad: Pokemon, whiteList: string[], blackList: string[], loadStartTime: string ) => {
    // TODO: maybe add some timing...better logging
    logInfoVerbose(dbContext, `Loading base data for: ${pokemonToLoad.name}...`);

    const parsedBaseData = await loadBasePokemonData(dbContext, pokemonToLoad, whiteList, loadStartTime);

    const pokemonSpeciesToLoad: Pokemon = { name: parsedBaseData.name, url: parsedBaseData.species_url };
    
    const imagesToGet: PokemonImageData = {
        id: parsedBaseData.id,
        name: parsedBaseData.name,
        default_sprite_size: 0,
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
                default_sprite_size: 0,
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

const blobToByteArray = async (blob: Blob): Promise<Uint8Array> => {
    try {
        return new Uint8Array(await blob.arrayBuffer()); 
    } catch (error) {
        console.error("Error converting blob to byte array:", error);
        throw error;
    }
}

const loadPokemonImages = async (dbContext: PGliteWithLive, pkmnImgData: PokemonImageData ) => {
    pkmnImgData.default_sprite = await fetchPokeApiImage(pkmnImgData.default_sprite as string);
    if (pkmnImgData.female_sprite) pkmnImgData.female_sprite = await fetchPokeApiImage(pkmnImgData.female_sprite as string);

    if (typeof(pkmnImgData.default_sprite) != 'string') {
        pkmnImgData.default_sprite_size = pkmnImgData.default_sprite.size;
        pkmnImgData.default_sprite = await blobToByteArray(pkmnImgData.default_sprite);
    }

    if (typeof(pkmnImgData.female_sprite) != 'string' && pkmnImgData.female_sprite != null) {
        pkmnImgData.female_sprite_size = pkmnImgData.female_sprite.size;
        pkmnImgData.female_sprite = await blobToByteArray(pkmnImgData.female_sprite);
    }

    upsertPokemonImage(dbContext, pkmnImgData);
}

export const getPokemonCountData = async (dbContext: PGliteWithLive): Promise<RegionCountData[]> => {
    const results = await getRegionCountData(dbContext);    

    if (Array.isArray(results)) {
        return results.filter((r) => {
            if (
                typeof r === 'object' 
                && r !== null
                && (
                    'id' in r
                    && typeof r['id'] === 'number'
                )
                && (
                    'generation' in r
                    && typeof r['generation'] === 'string'
                )
                && (
                    'region_name' in r
                    && typeof r['region_name'] === 'string'
                )
                && (
                    'total' in r
                    && typeof r['total'] === 'number'
                )
                && (
                    'registered' in r
                    && typeof r['registered'] === 'number'
                )
            ) {
                return r;
            }
        }) as RegionCountData[]
    }

    throw "Unable to parse data for tall grass region.";
}

export const getHabitatPageData = async (dbContext: PGliteWithLive, regionId: string) => {
    const results = await getHabitatData(dbContext, regionId);

    if (Array.isArray(results)) {
        return results.filter((r) => {
            if (
                typeof r === 'object' 
                && r !== null
                && (
                    'habitat' in r
                    && typeof r['habitat'] === 'string'
                )
            ) {
                return r;
            }
        }) as Habitat[]
    }

    throw "Unable to parse data for habitat."
}

export const getPokedexPageData = async (dbContext: PGliteWithLive): Promise<PokedexPreviewData[]> => {
    const results: unknown[] = await getPokedexList(dbContext);

    if (
        Array.isArray(results)
        && results !== null
    ) {
        const previewData = results.map(d => {
            if (
                    typeof d === 'object' 
                    && d !== null
                    && (
                        'id' in d
                        && typeof d['id'] === 'number'
                    )
                    && (
                        'dex_no' in d
                        && typeof d['dex_no'] === 'number'
                    )
                    && (
                        'name' in d
                        && typeof d['name'] === 'string'
                    )
                    && (
                        'type_1' in d
                        && typeof d['type_1'] === 'string'
                    )
                    && (
                        'type_2' in d
                        && (
                            typeof d['type_2'] === 'string' 
                            || d['type_2'] === null
                        )
                    )
                    && (
                        'male_sprite_url' in d
                        && typeof d['male_sprite_url'] === 'string'
                    )
                    && (
                        'is_registered' in d
                        && typeof d['is_registered'] === 'boolean'
                    )
                    && (
                        'default_img_data' in d
                        && typeof d['default_img_data'] === 'object'
                    )
            ) {
                return {
                    id: d.id,
                    name: d.name,
                    primary_type: d.type_1,
                    secondary_type: d.type_2,
                    dex_no: d.dex_no,
                    img_url: d.male_sprite_url,
                    is_registered: d.is_registered,
                    img_data: new Blob([d.default_img_data] as BlobPart[], {type: 'image/png'})
                }
            }
            else {
                console.log('Error parsing dex entry...returning missingno');
                
                return [{
                    name: 'MissingNo',
                    primary_type: 'none',
                    dex_no: 0,
                    secondary_type: undefined,
                    id: 0,
                    img_url: 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png',
                    img_data: new Blob(), //TODO: actually init something here
                    is_registered: true,
                }]
            }
        })

        return previewData as PokedexPreviewData[];
    } else {
        throw 'Unable to parse dex data.'
    }
}

export const getEntryPageData = async (dbContext: PGliteWithLive, id: string): Promise<PokedexEntryData>  => {
    const results: unknown = await getPokedexEntry(dbContext, id);

    if (
        typeof results === 'object' 
        && results !== null
        && (
            'id' in results
            && typeof results['id'] === 'number'
        )
        && (
            'name' in results
            && typeof results['name'] === 'string'
        )
        && (
            'dex_no' in results
            && typeof results['dex_no'] === 'number'
        )
        && (
            'weight' in results
            && typeof results['weight'] === 'number'
        )
        && (
            'height' in results
            && typeof results['height'] === 'number'
        )
        && (
            'habitat' in results
            && typeof results['habitat'] === 'string'
        )
        && (
            'has_gender_differences' in results
            && typeof results['has_gender_differences'] === 'boolean'
        )
        && (
            'generation' in results
            && typeof results['generation'] === 'string'
        )
        && (
            'genera' in results
            && typeof results['genera'] === 'string'
        )
        && (
            'is_default' in results
            && typeof results['is_default'] === 'boolean'
        )
        && (
            'type_1' in results
            && typeof results['type_1'] === 'string'
        )
        && (
            'type_2' in results
            && (
                typeof results['type_2'] === 'string'
                || results['type_2'] === null
            )
        )
        && (
            'has_forms' in results
            && typeof results['has_forms'] === 'boolean'
        )
        && (
            'is_registered' in results
            && typeof results['is_registered'] === 'boolean'
        )
        && (
            'default_img_data' in results
            && typeof results['default_img_data'] === 'object'
        )
        && (
            'female_img_data' in results
            && (
                typeof results['female_img_data'] === 'object'
                || results['female_img_data'] === null
            )
        )
    ) {
        results.default_img_data = new Blob([results.default_img_data] as BlobPart[], {type: 'image/png'});

        if (results.female_img_data !== null) {
            results.female_img_data = new Blob([results.female_img_data] as BlobPart[], {type: 'image/png'});
        }

        // Strip away some details in this "API Layer"
        if (!results.is_registered){
            results.height = -1;
            results.weight = -1;
            results.type_1 = "???";
            results.type_2 = undefined;
            results.genera = "??? Pokémon"
        }
    } else {
        console.log('Error parsing dex entry...returning missingno.')
        return {
            id: 0,
            name: "MissingNo",
            dex_no: 0,
            habitat: "Shoreline",
            has_gender_differences: false,
            generation: "i",
            genera: "UNIDENTIFIABLE",
            is_default: false,
            type_1: "Ň̷̨ȕ̷͕l̷͇̑l̸̠̏",
            height: 0,
            weight: 0,
            default_img_data: new Blob(), //TODO: actually init something here
            female_img_data: new Blob(), //TODO: actually init something here
            has_forms: false,
            is_registered: true,
        } as PokedexEntryData;
    }

    return results as PokedexEntryData;
}

export const registerPokemon = async (dbContext: PGliteWithLive, id: number) => {
    setPokedexRegistered(dbContext, id);
}

// TODO: update all debug fuctions to look like this (DEBUG) or revert it. Whichever you're in the mood for
export const DEBUGtogglePkmnRegistered = async (dbContext: PGliteWithLive) => updateToggleRegistered(dbContext);

export const displayPkmnName = (name: string) => {
    //TODO: special names list like Mr. Mime
    return name.charAt(0).toUpperCase() + name.slice(1);
}
