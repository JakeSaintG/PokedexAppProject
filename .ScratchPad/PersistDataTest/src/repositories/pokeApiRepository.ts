import { Pokemon } from "../types/pokemon";
import { PokemonBaseData, PokemonSpeciesData } from "../types/pokemonData";
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

export const fetchPokeApiData = async (url: string) => {
    return await fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((data) => data)
}

export const parsePokemonBaseData = (data: any, url: string): PokemonBaseData => {
    let parsedData: PokemonBaseData = {
        id: 0,
        name: '',
        species_url: '',
        is_default: false,
        male_sprite_url: '',
        female_sprite_url: '',
        img_path: '',
        type_1: '',
        type_2: null,
        has_forms: false,
        url: url,
        last_modified_dts: ''
    };

    parsedData.id = data.id;
    parsedData.name = data.name;
    parsedData.species_url = data.species.url;
    parsedData.is_default = data.is_default;
    parsedData.male_sprite_url = data.sprites.front_default;
    parsedData.female_sprite_url = data.sprites.front_female;
    parsedData.img_path = `./imgs/dex_imgs/${data.id}`;
    
    if (data.forms.length > 1) {
        parsedData.has_forms = true;
    }

    data.types.forEach((t) => {
        parsedData[`type_${t.slot}`] = t.type.name;
    });

    return parsedData;
}

export const parsePokemonSpeciesData = (data: any): [PokemonSpeciesData, Variety[]] => {
    const specData: PokemonSpeciesData = {
        id: data.id,
        dex_no: data.pokedex_numbers.find(e => e.pokedex.name === 'national').entry_number,
        name: data.name,
        has_gender_differences: data.has_gender_differences,
        habitat: data.habitat.name,
        generation: data.generation.name,
        evo_chain_url: data.evolution_chain.url,
        last_modified_dts: ''
    }

    // TODO: handle flavor texts
    // const flavorTexts = data.flavor_text_entries.reduce((acc, txt) => {
    //     if (txt.language.name == "en") {
    //         const text = txt.flavor_text.replace(/\n|\f/g, " ");
    //         if (!acc.includes(text)) acc.push(text);
    //     }

    //     return acc;
    // }, []);

    // pokemonSpeciesData["flavor_texts"] = flavorTexts;


    // TODO: varietyExclusions should probably be its own table in config
    const varietyExclusions = ["totem", "starter", "-cap"];

    const varitiesToGet: Variety[] = data.varieties.filter((variety: Variety) => 
        variety.is_default != true
    );

    return [specData, varitiesToGet];
}

export const fetchPkmnSpeciesData = async ( url: string, name: string, getVarieties: boolean = true ): Promise<[{}, Pokemon[]]> => {
    let pokemonSpeciesData = {};
    let varietiesToGet = [];

    await fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
            pokemonSpeciesData["dex_no"] = data.pokedex_numbers.find(e => e.pokedex.name === 'national').entry_number;
            pokemonSpeciesData["has_gender_differences"] = data.has_gender_differences;
            pokemonSpeciesData["habitat"] = data.habitat.name;
            pokemonSpeciesData["generation"] = data.generation.name;
            pokemonSpeciesData["evo_chain_url"] = data.evolution_chain.url;

            // const flavorTexts = data.flavor_text_entries.reduce((acc, txt) => {
            //     if (txt.language.name == "en") {
            //         const text = txt.flavor_text.replace(/\n|\f/g, " ");
            //         if (!acc.includes(text)) acc.push(text);
            //     }

            //     return acc;
            // }, []);

            // pokemonSpeciesData["flavor_texts"] = flavorTexts;

            // TODO: I'm looping in a loop (forEach & some())
            // I'm already in an outer loop... I need to optimize this.

            // console.log(data.varieties)

            // TODO: varietyExclusions should probably be its own table in config
            const varietyExclusions = ["totem", "starter", "-cap"];

            // data.varieties.forEach((variety: Variety) => {
            //     if (name !== variety.pokemon["name"]) {
            //         varietiesToGet.push(variety.pokemon);
            //     }

            //     const excluded = varietyExclusions.some((subStr) =>
            //         variety.pokemon["name"].includes(subStr)
            //     );

            //     if (!(variety["is_default"] || excluded) && getVarieties) {
                    
            //     }

            //     console.log(`${name} - ${variety.pokemon["name"]} - ${variety["is_default"]}`)
            // });
        });

    return [pokemonSpeciesData, varietiesToGet];
};

// TODO: Implement
export const pokeApiPing = () => {
    return true;
};
