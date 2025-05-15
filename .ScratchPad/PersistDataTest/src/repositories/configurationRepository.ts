import { getGenerationUpdateData, updateLocalLastModifiedDate, upsertConfigurationData } from "../data/configurationData";
import { ConfigurationData, SupportedGeneration } from "../types/configurationData";
import { DateData } from "../types/dateData";

export const updateConfiguration = (configuration: ConfigurationData) => {
    updateSupportedGenerations(configuration.supported_generations)

    // Update table_versions table;
}

const updateSupportedGenerations = (supported_generations: SupportedGeneration[]) => {
    
    supported_generations.forEach((generation: SupportedGeneration) => {
        const generationDateData: DateData | null  = getGenerationUpdateData(generation.id);

        if (
            // Update if there is no data stored
            generationDateData == undefined
            // Update if the value last_modified_dts from the server is newer than what is stored
            || Date.parse(generationDateData.source_last_modified_dts) < Date.parse(generation.last_modified_dts)
            // Update if the data is considered stale
            || Date.now() < Date.parse(generationDateData.last_modified_dts)
        ) {
            console.log(`Updating configuration data for ${generation.generation_name}`);
            upsertConfigurationData(generation);
        }
    })
}

export const updateLocalLastModified = (id: number) => {
    updateLocalLastModifiedDate(id);
}

export const configApiPing = () => {
    return true;
};
