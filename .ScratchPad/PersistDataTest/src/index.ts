import { initData, getStoredPokemon, mergeAllData, checkLastUpdated } from "./data/data";
import crypto from "crypto";
import { PkmnData } from "./types/pkmnData";
import { fetchPkmnData, fetchPkmnListBatch, fetchPkmnSpecData } from "./services/pokeapiService";

const getPokeAPIData = async () => {
    const limit = 5;
    return await fetchPkmnListBatch(limit);
};

const loadMissingPokemon = async (toLoad, loadStartTime, getVarieties: boolean = true) => {
    // TODO: Compare these dates an exit early
    const staleByDate = new Date(loadStartTime).setUTCDate(new Date(loadStartTime).getUTCDate() - 7);
    
    await Promise.all(
        toLoad.map(async (p) => {
            
            // TODO: Need to check if item has not been updated for...a week?
            console.log(`${checkLastUpdated(p.name)} - ${staleByDate}`)
            
            const baseData = {url: p.url, last_modified_dts: new Date().toISOString()};
            const pokemonData = await fetchPkmnData(p.url);
            const [pokemonSpeciesData, getRecurve] = await fetchPkmnSpecData(pokemonData['species_url'], pokemonData['name']);

            if (getRecurve.length > 0 && getVarieties) {
                await loadMissingPokemon(getRecurve, loadStartTime, false);
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
    initData();
    // TODO: do a QUICK ping (getStoredPokemon takes a while to give up)
    const storedPokemon = await getStoredPokemon();
    const fetchedPokemon = await getPokeAPIData();

    // quick compare
    const fetchedHash = crypto
        .createHash("md5")
        .update(fetchedPokemon.toString())
        .digest("hex");

    const storedHash = crypto
        .createHash("md5")
        .update(storedPokemon.toString())
        .digest("hex");

    if (fetchedHash === storedHash) {
        console.log("Data load not necessary.");
        return;
    }

    const loadStartTime = new Date();

    console.log("Checking data to update.");
    let toLoad = fetchedPokemon.filter((x) => !storedPokemon.includes(x.name));


    // TODO: Should probably do a pokemon at a time and save it right after
    // - loadMissingPokemon() will already get variations (raichu and A. raichu) 
    // - this will allow me to check the db, use the id and last_load_dts, then only get if last_load_dts > load_start_time

    const loadedPokemon = await loadMissingPokemon(toLoad, loadStartTime);

    // TODO: There will be a point in the loading where I start pulling down pokemon forms that are already loaded
    // - I'll get alolan raichu in the first 151 and again when I get to 10100.
    // - Figure out what to do... maybe a last modified date? Skip it if the last_mod is the same as current load time?
    // console.log(loadedPokemon);
};

loadData();
