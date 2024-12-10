import { initData, getStoredPokemon } from "./data/data";
import crypto from "crypto";

const getPokeAPIData = async () => {
    const limit = 20;
    let pkmn = [];

    await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`, {
        method: "GET",
    })
        .then((res) => res.json())
        .then((data) => (pkmn = data.results))
        .catch(() =>
            console.log(
                "Unable to contact PokeAPI. Continuing in offline mode.\r\nIf connectivity resumes, and you wish to sync data, please do so in the settings."
            )
        );

    return pkmn;
};

const loadMissingPokemon = async (toLoad, getVarieties: boolean = true) => {
    let loadedPokemon = [];

    await Promise.all(
        toLoad.map(async (p) => {
            let pokemonData = {};
            let getRecurve = [];

            await fetch(p.url, { method: "GET" })
                .then((res) => res.json())
                .then((data) => {
                    pokemonData["id"] = data.id;
                    pokemonData["name"] = data.name;
                    pokemonData["species_url"] = data.species.url;
                    pokemonData["has_forms"] = false;
                    pokemonData["male_sprite_url"] = data.sprites.front_default;
                    pokemonData["female_sprite_url"] = data.sprites.front_female;

                    if (data.forms.length > 1) {
                        pokemonData["has_forms"] = true;
                    }

                    data.types.forEach((t) => {
                        pokemonData[`type_${t.slot}`] = t.type.name;
                    });
                });

            await fetch(pokemonData["species_url"], { method: "GET" })
                .then((res) => res.json())
                .then((data) => {
                    pokemonData["has_gender_differences"] = data.has_gender_differences;
                    pokemonData["habitat"] = data.habitat.name;
                    pokemonData["generation"] = data.generation.name;
                    pokemonData["evo_chain_url"] = data.evolution_chain.url;

                    if (data.varieties.length > 1) {
                        data.varieties.forEach((v) => {
                            if (!(v["is_default"] || v.pokemon["name"].includes("totem")) && getVarieties ) {
                                getRecurve.push(v.pokemon);
                            }
                        });
                    }
                });

            if (getRecurve.length > 0) {
                const moreLoaded = await loadMissingPokemon(getRecurve, false);
                moreLoaded.forEach((pkmn) => {
                    loadedPokemon.push(pkmn);
                });
            }

            pokemonData["last_load_dts"] = Date.now();

            loadedPokemon.push(pokemonData);
        })
    );

    return loadedPokemon;
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

    const load_start_time = Date.now();

    console.log("Checking data to update.");
    let toLoad = fetchedPokemon.filter((x) => !storedPokemon.includes(x.name));


    // TODO: Should probably do a pokemon at a time and save it right after
    // - loadMissingPokemon() will already get variations (raichu and A. raichu) 
    // - this will allow me to check the db, use the id and last_load_dts, then only get if last_load_dts > load_start_time
    const loadedPokemon = await loadMissingPokemon(toLoad);

    // TODO: There will be a point in the loading where I start pulling down pokemon forms that are already loaded
    // - I'll get alolan raichu in the first 151 and again when I get to 10100.
    // - Figure out what to do... maybe a last modified date? Skip it if the last_mod is the same as current load time?
    console.log(loadedPokemon);
};

loadData();
