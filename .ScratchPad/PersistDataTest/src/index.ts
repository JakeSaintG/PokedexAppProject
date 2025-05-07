import { initData, getStoredPokemon, mergeAllData, checkLastUpdated, checkMinLastUpdated, upsertConfigurationData } from "./data/data";
import { PkmnData } from "./types/pkmnData";
import { fetchPkmnData, fetchPkmnToLoad, fetchPkmnSpeciesData, pokeApiPing } from "./services/pokeApiService";
import { Env } from './env';
import { updateNeeded } from "./services/appService";

const loadMissingPokemon = async ( toLoad, loadStartTime, staleByDate, forceUpdate, getVarieties: boolean = true ) => {
    await Promise.all(
        toLoad.map(async (p) => {
            const lastUpdated = checkLastUpdated(p.name);
            
            const entryStale = !(lastUpdated == undefined) && lastUpdated["last_modified_dts"] > staleByDate;
            
            if (entryStale && !forceUpdate) {
                return;
            }

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
                await loadMissingPokemon( varieties, loadStartTime, staleByDate, false );
            }
            // WIP ============================================================================

            // TODO: store this in pkmnData
            // console.log(pkmnSpeciesData);

            const pkmnData: PkmnData = {
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

            mergeAllData(pkmnData);
        })
    );
};

const loadData = async (staleByDate: string, forceUpdate: boolean) => {
    const loadStartTime = new Date().toISOString();

    if (updateNeeded(forceUpdate, staleByDate)) return;

    // TODO: implement getting by generation
    // - When empty, load gen 1
    // - Allow user to trigger all other gen fetching (using limit and offset)

    const limit = 1;
    const offset = 0;
    const fetchedPokemon = await fetchPkmnToLoad(limit, offset);

    await loadMissingPokemon(fetchedPokemon, loadStartTime, staleByDate, forceUpdate);
    console.log('done')
};




initData(Env.DATA_SOURCE);

// TODO: Temporary; later simulate getting this from a "call home" API response.
const tempConfigData = [{
    id: 1,
    generation_name: 'generation1',
    start_dex_no: 1,
    end_dex_no: 1,
    last_modified_dts: new Date().toISOString()
}]
upsertConfigurationData(tempConfigData)

// Just a week for now. Will be configurable after poc
const staleByDate = new Date(
    new Date().getTime() - 7 * 24 * 60 * 60 * 1000
).toISOString();

if (pokeApiPing()) {
    loadData( staleByDate, Env.FORCE_UPDATE);
}
