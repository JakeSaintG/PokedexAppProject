import { initData, getStoredPokemon, mergeAllData, checkLastUpdated, checkMinLastUpdated } from "./data/data";
import { PkmnData } from "./types/pkmnData";
import { fetchPkmnData, fetchPkmnListBatch, fetchPkmnSpecData } from "./services/pokeapiService";

// TODO: set these as configuration at some point
const forceUpdate = true;

const getPokeAPIData = async () => {
    const limit = 1;
    return await fetchPkmnListBatch(limit);
};

const loadMissingPokemon = async (toLoad, loadStartTime, staleByDate, getVarieties: boolean = true) => {
    await Promise.all(
        toLoad.map(async (p) => {

            const entryStale = !(checkLastUpdated(p.name) == undefined) && checkLastUpdated(p.name)['last_modified_dts'] > staleByDate;
            if (entryStale && !forceUpdate) {
                return;
            }

            const baseData = {url: p.url, last_modified_dts: new Date().toISOString()};
            const pokemonData = await fetchPkmnData(p.url);
            const [pokemonSpeciesData, getRecurve] = await fetchPkmnSpecData(pokemonData['species_url'], pokemonData['name']);

            if (getRecurve.length > 0 && getVarieties) {
                await loadMissingPokemon(getRecurve, loadStartTime, staleByDate, false);
            }

            const pkmnData: PkmnData = {
                id: pokemonData['id'],
                dex_no: pokemonSpeciesData['dex_no'],
                name: pokemonData['name'],
                is_default: pokemonSpeciesData['is_default'],
                type_1: pokemonData['type_1'],
                type_2: pokemonData['type_2'],
                img_path: pokemonData['img_path'],
                url: baseData['url'],
                species_url: pokemonData['species_url'],
                has_forms: pokemonData['has_forms'],
                male_sprite_url: pokemonData['male_sprite_url'],
                female_sprite_url: pokemonData['female_sprite_url'],
                has_gender_differences: pokemonSpeciesData['has_gender_differences'],
                habitat: pokemonSpeciesData['habitat'],
                generation: pokemonSpeciesData['generation'],
                evo_chain_url: pokemonSpeciesData['evo_chain_url'],
                last_modified_dts: baseData['last_modified_dts']
            }

            mergeAllData(pkmnData);
        })
    );
};

const loadData = async () => {
    const loadStartTime = new Date().toISOString();
    const staleByDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    initData();

    const dbStale = !(checkMinLastUpdated() == undefined) && checkMinLastUpdated() > staleByDate;
    if (dbStale && !forceUpdate) {
        console.log('No data update needed.');
        return;
    }

    // TODO: do a QUICK ping (getStoredPokemon takes a while to give up)

    const fetchedPokemon = await getPokeAPIData();
    await loadMissingPokemon(fetchedPokemon, loadStartTime, staleByDate);
};

loadData();
