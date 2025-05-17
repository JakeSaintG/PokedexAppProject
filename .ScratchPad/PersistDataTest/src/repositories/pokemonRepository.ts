// TODO: Route this through the config repo. This repo shouldn't be talking to the config interface
import { getGenerationCountAndOffset, getGenerationLastUpdatedLocally } from "../data/configurationData";
import { getPokemonSpeciesToLoad, upsertPokemonBaseData, upsertPokemonData, upsertPokemonSpeciesData } from "../data/pokemonData";
import { Pokemon } from "../types/pokemon";
import { Variety } from "../types/varieties";
import { batchArray } from "../utils/utils";
import { updateLocalLastModified } from "./configurationRepository";
import { fetchPokeApiData, fetchPkmnData, fetchPkmnSpeciesData, fetchPkmnToLoad, parsePokemonBaseData, parsePokemonSpeciesData } from "./pokeApiRepository";

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
    
    batchArray(pokemonToLoad, 10)
        .forEach( async (pokemonBatch: Pokemon[]) => {
            console.log(`Starting batch ${batchCounter++}`);

            // DEPRECATED
            // loadMissingPokemon(pokemonBatch, (new Date().toISOString()))

            await startLoad(pokemonBatch, (new Date().toISOString()))
        })
}


const startLoad  = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    await loadBasePokemonData(pokemonToLoad, loadStartTime);

    const pokemonSpeciesToLoad = getPokemonSpeciesToLoad();

    await loadSpeciesPokemonData(pokemonSpeciesToLoad, loadStartTime);
}


const loadSpeciesPokemonData = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    let varietiesToGet: Variety[] = [];
    
    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) =>
            await fetchPokeApiData(p.url)
        )
    )
    .then((downloadedData) => 
        downloadedData.map((p) => {
            const parsed = parsePokemonSpeciesData(p);
            varietiesToGet = parsed[1];
            return parsed[0];
        })
    )
    .then(parsedData => 
        parsedData.map((p) => 
            upsertPokemonSpeciesData(p)
        )
    )
}

const loadBasePokemonData = async (  pokemonToLoad: Pokemon[], loadStartTime: string ) => {
    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) => {
            const fetched = await fetchPokeApiData(p.url)
            return {data: fetched, url: p.url }
        })
    )
    .then((downloadedData) => 
        downloadedData.map((p) =>
            parsePokemonBaseData(p.data, p.url)
        )
    )
    .then(parsedData => 
        parsedData.map((p) => 
            upsertPokemonBaseData(p)
        )
    )
}

const loadMissingPokemon = async ( 
    pokemonToLoad: Pokemon[],
    loadStartTime: string,
    getVarieties: boolean = true,
    pokemonSpeciesData = undefined
) => {
    await Promise.all(
        pokemonToLoad.map(async (p: Pokemon) => {
            let pkmnSpeciesData = pokemonSpeciesData;
            let varieties: Pokemon[] = [];

            const pokemonData = await fetchPkmnData(p.url);

            if (pkmnSpeciesData === undefined) {
                [pkmnSpeciesData, varieties] = await fetchPkmnSpeciesData(
                    pokemonData["species_url"],
                    pokemonData["name"]
                );
            }

            if (varieties.length > 0 && getVarieties) {
                await loadMissingPokemon( varieties, loadStartTime, false, pkmnSpeciesData );
            }

            upsertPokemonData({
                id: pokemonData["id"],
                name: pokemonData["name"],
                type_1: pokemonData["type_1"],
                type_2: pokemonData["type_2"],
                img_path: pokemonData["img_path"],
                species_url: pokemonData["species_url"],
                has_forms: pokemonData["has_forms"],
                male_sprite_url: pokemonData["male_sprite_url"],
                female_sprite_url: pokemonData["female_sprite_url"],

                dex_no: pkmnSpeciesData["dex_no"],
                is_default: pkmnSpeciesData["is_default"],
                has_gender_differences: pkmnSpeciesData["has_gender_differences"],
                habitat: pkmnSpeciesData["habitat"],
                generation: pkmnSpeciesData["generation"],
                evo_chain_url: pkmnSpeciesData["evo_chain_url"],

                url: p.url,
                last_modified_dts: new Date().toISOString()
            });
        })
    );
};
