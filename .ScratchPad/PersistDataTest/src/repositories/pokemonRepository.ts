// TODO: Route this through the config repo. This repo shouldn't be talking to the config interface
import { getGenerationCountAndOffset, getGenerationLastUpdatedLocally } from "../data/configurationData";
import { upsertPokemonData } from "../data/pokemonData";
import { Pokemon } from "../types/pokemon";
import { PokemonData } from "../types/pokemonData";
import { updateLocalLastModified } from "./configurationRepository";
import { fetchPkmnData, fetchPkmnSpeciesData, fetchPkmnToLoad } from "./pokeApiRepository";

export const loadPokemonData = async (forceUpdate: boolean) => {
    const loadStartTime = new Date().toISOString();
    const generationsLastUpdatedLocally = getGenerationLastUpdatedLocally();

    // TODO: When empty, load gen 1
    // TODO: Allow user to trigger all other gen fetching (using limit and offset)
    generationsLastUpdatedLocally.forEach( async (gen) => {

        if(gen.local_last_modified_dts === '' || forceUpdate) {
            console.log(`Gen ${gen.generation_id} identified for update.`);

            const [count, offset] = getGenerationCountAndOffset(gen.generation_id);

            const fetchedPokemon = await fetchPkmnToLoad(count, (offset - 1));
            await batchLoadPokemon(fetchedPokemon, loadStartTime);

            updateLocalLastModified(gen.generation_id);
        }
    });
};

const batchLoadPokemon = ( toLoad: Pokemon[], loadStartTime: string) => {
    console.log(batchArray(toLoad, 5));
}

const batchArray = (array, batchSize) => {
    return Array.from(
        { length: Math.ceil(array.length / batchSize) },
        (_, index) => array.slice(index * batchSize, (index + 1) * batchSize)   
    );
}

const loadMissingPokemon = async ( 
    toLoad: Pokemon[],
    loadStartTime: string,
    getVarieties: boolean = true
) => {
    await Promise.all(
        toLoad.map(async (p: Pokemon) => {
            const pokemonData = await fetchPkmnData(p.url);

            // WIP ============================================================================
            // TODO: Don't do this if I'm in this function recursively
            // I shouldn't be doing this again if I already know the species data from an outside call 
            // and I'm just getting the /pokemon/{id} data for the form/variety.
            const [pkmnSpeciesData, varieties] = await fetchPkmnSpeciesData(
                pokemonData["species_url"],
                pokemonData["name"]
            );

            if (varieties.length > 0 && getVarieties) {
                await loadMissingPokemon( varieties, loadStartTime, false );
            }
            // WIP ============================================================================

            const pkmnData: PokemonData = {
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
            };

            upsertPokemonData(pkmnData);


        })
    );
};
