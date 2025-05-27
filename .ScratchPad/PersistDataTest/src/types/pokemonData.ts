import { FlavorTextEntry } from "./flavorText";

export interface PokemonBaseData {
    id: number,
    name: string,
    species_url: string,
    is_default: boolean,
    male_sprite_url: string,
    female_sprite_url?: string,
    img_path: string,
    type_1: string,
    type_2?: string,
    has_forms: boolean,
    url: string,
    last_modified_dts: string,
}

export interface PokemonSpeciesData {
    id: number,
    dex_no: number,
    name: string,
    has_gender_differences: boolean,
    habitat: string,
    generation: string,
    evo_chain_url: string,
    flavor_texts: FlavorTextEntry[],
    last_modified_dts: string,
}
