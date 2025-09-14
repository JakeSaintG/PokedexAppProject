export interface ConfigurationData {
    supported_generations: SupportedGeneration[],
    obtainable: Obtainable[]
}

export interface SupportedGeneration {
    id: number, 
    generation_name: string,
    description: string,
    starting_dex_no: number, 
    count: number,
    active: boolean | undefined | null,
    stale_by_dts: null | string,
    last_modified_dts: string
}

export interface Obtainable {
    form: string,
    list: string
}