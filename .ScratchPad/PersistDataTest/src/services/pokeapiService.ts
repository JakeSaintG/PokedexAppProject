import { Variety } from "../types/varieties";

export const fetchPkmnToLoad = async (limit: number, offset: number) => {
    let pkmn = [];

    await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
        { method: "GET" }
    )
        .then((res) => res.json())
        .then((data) => (pkmn = data.results))
        .catch(() =>
            console.log(
                "Unable to contact PokeAPI. Continuing in offline mode.\r\nIf connectivity resumes, and you wish to sync data, please do so in the settings."
            )
        );

    return pkmn;
};

export const fetchPkmnData = async (url: string) => {
    let pokemonData = {};

    await fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
            pokemonData["id"] = data.id;
            pokemonData["name"] = data.name;
            pokemonData["species_url"] = data.species.url;
            pokemonData["male_sprite_url"] = data.sprites.front_default;
            pokemonData["female_sprite_url"] = data.sprites.front_female;
            pokemonData["img_path"] = `./imgs/dex_imgs/${data.id}`;
            pokemonData["has_forms"] = false;

            if (data.forms.length > 1) {
                pokemonData["has_forms"] = true;
            }

            data.types.forEach((t) => {
                pokemonData[`type_${t.slot}`] = t.type.name;
            });
        });

    return pokemonData;
};

export const fetchPkmnSpeciesData = async ( url: string, name: string, getVarieties: boolean = true ): Promise<[{}, any[]]> => {
    let pokemonSpeciesData = {};
    let getRecurve = [];

    await fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
            
            const national_dex = data.pokedex_numbers.find(e => e.pokedex.name === 'national');
            
            pokemonSpeciesData["dex_no"] = national_dex.entry_number;
            pokemonSpeciesData["has_gender_differences"] = data.has_gender_differences;
            pokemonSpeciesData["habitat"] = data.habitat.name;
            pokemonSpeciesData["generation"] = data.generation.name;
            pokemonSpeciesData["evo_chain_url"] = data.evolution_chain.url;

            const flavorTexts = data.flavor_text_entries.reduce((acc, txt) => {
                if (txt.language.name == "en") {
                    const text = txt.flavor_text.replace(/\n|\f/g, " ");
                    if (!acc.includes(text)) acc.push(text);
                }

                return acc;
            }, []);

            pokemonSpeciesData["flavor_texts"] = flavorTexts;

            data.varieties.forEach((variety: Variety) => {
                if (name == variety.pokemon["name"]) {
                    pokemonSpeciesData["is_default"] = variety["is_default"];
                }

                // TODO: varietyExclusions should probably be its own table in config
                const varietyExclusions = ["totem", "starter"];
                const excluded = varietyExclusions.some((subStr) =>
                    variety.pokemon["name"].includes(subStr)
                );

                if (!(variety["is_default"] || excluded) && getVarieties) {
                    getRecurve.push(variety.pokemon);
                }
            });
        });

    return [pokemonSpeciesData, getRecurve];
};

// TODO: Implement
export const pokeApiPing = () => {
    return true;
};
