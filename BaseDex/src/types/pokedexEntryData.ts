export interface PokedexEntryData {
    id: number
    name: string
    dex_no: number
    habitat: string
    has_gender_differences: boolean
    generation: string
    genera: string
    is_default: boolean
    type_1: string
    type_2?: string
    height: number,
    weight: number,
    has_forms: boolean
    is_registered: boolean
    default_img_data: Blob | MediaSource
    female_img_data: Blob | MediaSource | null
}