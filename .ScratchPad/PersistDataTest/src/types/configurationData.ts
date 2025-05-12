export interface ConfigurationData {
    supported_generations: SupportedGeneration[]
}

export interface SupportedGeneration {
    id: number, 
    generation_name: string,
    description: string,
    starting_dex_no: number, 
    count: number,
    last_modified_dts: string
}