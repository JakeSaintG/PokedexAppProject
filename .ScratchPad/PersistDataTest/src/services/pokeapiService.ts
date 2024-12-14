export const fetchPkmnListBatch = async (limit: number) => {
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

    return pkmn
}

export const fetchPkmnData = async (url: string) => {
    let pokemonData = {};

    await fetch(url, { method: "GET" })
    .then((res) => res.json())
    .then((data) => {
        pokemonData["id"] = data.id;
        pokemonData["name"] = data.name;
        pokemonData["species_url"] = data.species.url;
        pokemonData["has_forms"] = false;
        pokemonData["male_sprite_url"] = data.sprites.front_default;
        pokemonData["female_sprite_url"] = data.sprites.front_female;
        pokemonData["img_path"] = `./imgs/dex_imgs/${data.id}`;

        if (data.forms.length > 1) {
            pokemonData["has_forms"] = true;
        }

        data.types.forEach((t) => {
            pokemonData[`type_${t.slot}`] = t.type.name;
        });
    });

    return pokemonData;
}

export const fetchPkmnSpecData = async (url: string, name: string, getVarieties: boolean = true): Promise<[{},any[]]> => {
    let pokemonSpeciesData = {};
    let getRecurve = [];

    await fetch(url, { method: "GET" })
    .then((res) => res.json())
    .then((data) => {
        pokemonSpeciesData['dex_no'] = data.order;
        pokemonSpeciesData["has_gender_differences"] = data.has_gender_differences;
        pokemonSpeciesData["habitat"] = data.habitat.name;
        pokemonSpeciesData["generation"] = data.generation.name;
        pokemonSpeciesData["evo_chain_url"] = data.evolution_chain.url;

        data.varieties.forEach((v) => {
            if (name == v.pokemon["name"]) {
                pokemonSpeciesData['is_default'] = v["is_default"];
            }
            
            if (!(v["is_default"] || v.pokemon["name"].includes("totem")) && getVarieties ) {
                getRecurve.push(v.pokemon);
            }
        });
    });

    return [pokemonSpeciesData, getRecurve];
}