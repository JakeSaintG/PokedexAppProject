// TODO: Route this through the config repo. This repo shouldn't be talking to the config interface
import { getGenerationCountAndOffset, getGenerationLastUpdatedLocally } from "../data/configurationData";
import { getPokemonSpeciesToLoad, upsertPokemonBaseData, upsertPokemonSpeciesData } from "../data/pokemonData";
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
    
    const foo = batchArray(pokemonToLoad, 3)

    // console.log(foo);

    foo.forEach( async (pokemonBatch: Pokemon[]) => {
            console.log(`\r\nStarting batch ${batchCounter++}: ${pokemonBatch.map((p: Pokemon) => p.name).join(', ')}`);
            await startLoad(pokemonBatch, (new Date().toISOString()))
        })
}

const startLoad  = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    console.log(`Loading base data for: ${pokemonToLoad.map((p: Pokemon) => p.name).join(', ')}`);
    await loadBasePokemonData(pokemonToLoad, loadStartTime);
    const pokemonSpeciesToLoad = getPokemonSpeciesToLoad(pokemonToLoad);
    
    console.log(`Loading species data for: ${pokemonSpeciesToLoad.map((p: Pokemon) => p.name).join(', ')}`);
    const varietiesLeftToGet = await loadSpeciesPokemonData(pokemonSpeciesToLoad, loadStartTime);
    
    if (varietiesLeftToGet.length > 0) {
        console.log(`Loading remaining special forms: ${varietiesLeftToGet.map((p: Pokemon) => p.name).join(', ')} `);
        await loadBasePokemonData(varietiesLeftToGet, loadStartTime);
    }
}


const loadSpeciesPokemonData = async (  pokemonToLoad: Pokemon[], loadStartTime: string ): Promise<Pokemon[]> => {
    let varietiesToGet: Variety[] = [];

    // TODO: I wonder if an HTTP factory will help prevent timeouts.......every batch gets its own http connection?
    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) => {
            const foo = await fetchPokeApiData(p.url)
            
            // if(foo.name === 'charmeleon') {
                // console.log(foo.name)
            // }

            return foo 
        }
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
        parsedData.map((p) => 
            upsertPokemonSpeciesData(p)
        )
    )

    // console.log(varietiesToGet)

    return varietiesToGet.map(v => v.pokemon);
}

const loadBasePokemonData = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    // console.log(pokemonToLoad);
    
    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) => {
            const fetched = await fetchPokeApiData(p.url);
            return {data: fetched, url: p.url };
        })
    )
    .then((downloadedData) => 
        downloadedData.map((p) =>

            {
                // console.log(p.data.name)
                return parsePokemonBaseData(p.data, p.url)
            }
        )
    )
    .then(parsedData => 
        parsedData.map((p) => {
            // console.log(p.name)
            upsertPokemonBaseData(p)
        }
        )
    )
}
