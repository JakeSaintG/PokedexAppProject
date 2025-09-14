import type { FlavorTextEntry } from "../types/flavorText";
import type { Pokemon } from "../types/pokemon";
import type { PokemonBaseData, PokemonSpeciesData } from "../types/pokemonData";
import type { pokemonType } from "../types/pokemonType";
import type { Variety } from "../types/varieties";

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

export const fetchPokeApiImage = async (url: string) => {
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

export const parsePokemonBaseData = async (data: unknown, whiteList: string[]) : Promise<PokemonBaseData> => {
    if (
        typeof data === 'object' 
        && data !== null 
        && (
            'id' in data
            && typeof data['id'] === 'number'
        )
        && (
            'name' in data
            && typeof data['name'] === 'string'
        )
        && (
            'species' in data 
            && typeof data['species'] === 'object'    
        )
        && (
            'url' in data.species! 
            && typeof data.species!['url'] === 'string'    
        )
        && (
            'is_default' in data
            && typeof data['is_default'] === 'boolean'
        )
        && (
            'sprites' in data
            && typeof data['sprites'] === 'object'
        )
        && (
            'front_default' in data.sprites!
            && typeof data.sprites['front_default'] === 'string'
        )
        && (
            'front_female' in data.sprites!
            && (
                typeof data.sprites['front_female'] === 'string'
                || data.sprites['front_female'] === null
            )
        )
        && (
            'forms' in data
            && Array.isArray(data['forms'])
        )
        && (
            'types' in data
            && Array.isArray(data['types'])
        )
        && (
            'url' in data
            && typeof data['url'] === 'string'
        )
        && (
            'obtainable' in data
            && typeof data['obtainable'] === 'boolean'
        )
        && (
            'is_registered' in data
            && typeof data['is_registered'] === 'boolean'
        )
        && (
            'regional_form' in data
            && typeof data['regional_form'] === 'boolean'
        )
    ) {
        const parsedData: PokemonBaseData = {
            id: data.id,
            name: data.name,
            species_url: data.species.url,
            is_default: data.is_default,
            male_sprite_url: data.sprites.front_default,
            female_sprite_url: data.sprites.front_female,
            img_path: `./imgs/dex_imgs/${data.id}`,
            type_1: '',
            type_2: undefined,
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
    
        data.types.forEach((t: pokemonType) => {
            const type = `type_${t.slot}`;
            if (type == 'type_2' || type == 'type_2') parsedData[type] = t.type.name;
        });

        if (parsedData.is_default) {
            parsedData.obtainable = true;
        } else if (whiteList.some(wl => parsedData.name.includes(wl))) {
            parsedData.obtainable = true;
            parsedData.regional_form = true;
        }

        return parsedData;
    } else {
        throw 'Unable to parse Pokemon base data.';
    }
}

export const parsePokemonSpeciesData = async (data: unknown, blackList: string[]): Promise<[PokemonSpeciesData, Variety[]]> => {
    if (
        typeof data === 'object' 
        && data !== null 
        && (
            'id' in data
            && typeof data['id'] === 'number'
        )
        && (
            'pokedex_numbers' in data
            && Array.isArray(data['pokedex_numbers'])
        )
        && (
            'name' in data
            && typeof data['name'] === 'string'
        )
        && (
            'has_gender_differences' in data
            && typeof data['has_gender_differences'] === 'boolean'
        )
        && (
            'habitat' in data
            && typeof data['habitat'] === 'object'
        )
        && (
            'name' in data.habitat! 
            && typeof data.habitat!['name'] === 'string'    
        )
        && (
            'generation' in data 
            && typeof data['generation'] === 'object'    
        )
        && (
            'name' in data.generation! 
            && typeof data.generation!['name'] === 'string'    
        )
        && (
            'evolution_chain' in data 
            && typeof data['evolution_chain'] === 'object'    
        )
        && (
            'url' in data.evolution_chain! 
            && typeof data.evolution_chain['url'] === 'string'    
        )
        && (
            'flavor_text_entries' in data
            && Array.isArray(data['flavor_text_entries'])
        )
        && (
            'varieties' in data
            && Array.isArray(data['varieties'])
        )
    ) {
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
    else {
        throw 'Unable to parse Pokemon species data.';
    }
}

// TODO: Implement
export const pokeApiPing = () => {
    return true;
};
