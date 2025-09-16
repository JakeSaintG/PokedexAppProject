import { Obtainable } from "../types/configurationData";
import { FlavorTextEntry } from "../types/flavorText";
import { Pokemon } from "../types/pokemon";
import { PokemonBaseData, PokemonSpeciesData } from "../types/pokemonData";
import { Variety } from "../types/varieties";

export const fetchPkmnToLoad = async (limit: number, offset: number) => {
    // TODO: better error handling
    let pkmn: Pokemon[] = [];

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

export const fetchPokeApiImage = async (url) => {
    // TODO: better error handling
    return await fetch(url, { method: "GET" })
        .then((res) => res.blob())
}

export const fetchPokeApiData = async (url: string) => {
    // TODO: better error handling
    return await fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((json) => {
            json.url = url
            return json
        })
}

export const parsePokemonBaseData = async (data: any,  whiteList: string[]) : Promise<PokemonBaseData> => {
    let parsedData: PokemonBaseData = {
        id: data.id,
        name: data.name,
        species_url: data.species.url,
        is_default: data.is_default,
        male_sprite_url: data.sprites.front_default,
        female_sprite_url: data.sprites.front_female,
        img_path: `./imgs/dex_imgs/${data.id}`,
        type_1: '',
        type_2: null,
        has_forms: false,
        url: data.url,


        obtainable: false,
        is_registered: false,
        regional_form: false,


        last_modified_dts: ''
    };

    if (data.forms.length > 1) {
        parsedData.has_forms = true;
    }

    data.types.forEach((t) => {
        parsedData[`type_${t.slot}`] = t.type.name;
    });

    if (parsedData.is_default) {
        parsedData.obtainable = true;
    } else if (whiteList.some(wl => parsedData.name.includes(wl))) {
        parsedData.obtainable = true;
        parsedData.regional_form = true;
    }

    return parsedData;
}

export const parsePokemonSpeciesData = (data: any, blackList: string[]): [PokemonSpeciesData, Variety[]] => {
    const specData: PokemonSpeciesData = {
        id: data.id,
        dex_no: data.pokedex_numbers.find(e => e.pokedex.name === 'national').entry_number,
        name: data.name,
        has_gender_differences: data.has_gender_differences,
        habitat: data.habitat.name,
        generation: data.generation.name,
        evo_chain_url: data.evolution_chain.url,
        flavor_texts: [],
        last_modified_dts: ''
    }

    specData.flavor_texts = data.flavor_text_entries.map( (flavorTxt: FlavorTextEntry) => {
        return {
            language: flavorTxt.language,
            version: flavorTxt.version,
            flavor_text: flavorTxt.flavor_text.replace(/\n|\f/g, " ")
        }
    })

    // Build regex string to test use in filtering out unneeded varieties.
    // Doing this process with regex was the least time-complex option I could think of for now.
    const blackListRegex = new RegExp(blackList.join("|"), "i");
    const varietiesToGet: Variety[] = data.varieties.filter((variety: Variety) => 
        // It's a special form that needs more data if it's not default or blacklisted
        variety.is_default == false && !blackListRegex.test(variety.pokemon.name)
    );

    return [specData, varietiesToGet];
}

// TODO: Implement
export const pokeApiPing = () => {
    return true;
};
