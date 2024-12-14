export interface PkmnData {
    id: number, 
    dex_no: number, 
    name: string,
    is_default?: boolean,
    type_1: string, 
    type_2?: string, 
    img_path: string, 
    url: string, 
    species_url: string, 
    has_forms: boolean,
    male_sprite_url: string, 
    female_sprite_url?: string, 
    has_gender_differences: boolean, 
    habitat: string, 
    generation: string, 
    evo_chain_url: string, 
    last_modified_dts: string, 
}