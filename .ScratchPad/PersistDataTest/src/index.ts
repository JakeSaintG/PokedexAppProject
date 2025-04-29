import { initData, getStoredPokemon, mergeAllData, checkLastUpdated, checkMinLastUpdated } from "./data/data";
import { PkmnData } from "./types/pkmnData";
import { fetchPkmnData, fetchPkmnListBatch, fetchPkmnSpeciesData, pokeApiPing } from "./services/pokeApiService";
import { Env } from './env';

const getPokeAPIData = async () => {
    const limit = 1;
    const offset = 0;
    return await fetchPkmnListBatch(limit, offset);
};

const loadMissingPokemon = async ( toLoad, loadStartTime, staleByDate, getVarieties: boolean = true ) => {
    await Promise.all(
        toLoad.map(async (p) => {
            const entryStale = !(checkLastUpdated(p.name) == undefined) && checkLastUpdated(p.name)["last_modified_dts"] > staleByDate;
            
            if (entryStale && !forceUpdate) {
                return;
            }

            const baseData = {
                url: p.url,
                last_modified_dts: new Date().toISOString(),
            };

            const pokemonData = await fetchPkmnData(p.url);
            const [pkmnSpeciesData, getRecurve] = await fetchPkmnSpeciesData(
                pokemonData["species_url"],
                pokemonData["name"]
            );

            if (getRecurve.length > 0 && getVarieties) {
                await loadMissingPokemon( getRecurve, loadStartTime, staleByDate, false );
            }

            // TODO: store this in pkmnData
            console.log(pkmnSpeciesData);

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
                
                url: baseData["url"],
                last_modified_dts: baseData["last_modified_dts"],
            };

            mergeAllData(pkmnData);
        })
    );
};

const loadData = async (dateSource: string, staleByDate: string, forceUpdate: boolean) => {
    const loadStartTime = new Date().toISOString();

    initData(dateSource);

    const dbStale = !(checkMinLastUpdated() == undefined) && checkMinLastUpdated() > staleByDate;

    if (dbStale && !forceUpdate) {
        console.log("No data update needed.");
        return;
    }

    const fetchedPokemon = await getPokeAPIData();

    await loadMissingPokemon(fetchedPokemon, loadStartTime, staleByDate);
};

// Just a week for now. Will be configurable after poc
const staleByDate = new Date(
    new Date().getTime() - 7 * 24 * 60 * 60 * 1000
).toISOString();

// Will be configurable later after POC
const forceUpdate = true;

if (pokeApiPing()) {
    loadData(Env.DATA_SOURCE, staleByDate, forceUpdate);
}
