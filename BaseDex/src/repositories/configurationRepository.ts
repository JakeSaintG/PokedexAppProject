import type { PGliteWithLive } from '@electric-sql/pglite/live';
import {
    getGenerationCountAndOffset,
    getGenerationLastUpdatedLocally,
    getGenerationUpdateData,
    // setLocalLastModifiedDate,
    upsertConfigurationData,
    // getGenerationCountAndOffset,
    // getGenerationLastUpdatedLocally,
    // setGenerationActive,
} from '../postgres/data/configurationData';
import type { ConfigurationData, SupportedGeneration } from '../types/configurationData';
import type { DateData } from '../types/dateData';
// import { logInfo } from './logRepository';

export const configApiPing = () => {
    return true;
};

// Call out for new configuration
export const getUpdatedAppConfiguration = async () => {
    // Pretend API call to a "home" server that holds app config data
    // (): result => {}
    const placeHolderStaleByDate = new Date(
        // It's been...one week.
        new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const simulatedResult = {
        supported_generations: [
            {
                id: 1,
                generation_name: 'generation1',
                description: 'Red, Green, Blue, and Yellow.',
                starting_dex_no: 1,
                count: 9, //151
                active: true,
                stale_by_dts: placeHolderStaleByDate,
                last_modified_dts: '2025-05-08T22:04:23.251Z', // new Date().toISOString()
            },
            {
                id: 2,
                generation_name: 'generation2',
                description: 'Gold, Silver, and Crystal.',
                starting_dex_no: 152, //152,
                count: 3, // 100
                active: null,
                stale_by_dts: placeHolderStaleByDate,
                last_modified_dts: '2025-05-08T22:01:16.299Z', // new Date().toISOString()
            },
        ],
    };

    return simulatedResult;
};

export const updateConfiguration = (dbContext: PGliteWithLive, configuration: ConfigurationData) => {
    configuration.supported_generations.forEach(async (generation: SupportedGeneration) => {
        const generationDateData: DateData | undefined = await getGenerationUpdateData(dbContext, generation.id);

        if (
            // Update if there is no data stored
            generationDateData == undefined ||
            // Update if the value last_modified_dts from the server is newer than what is stored
            Date.parse(generationDateData.source_last_modified_dts!) < Date.parse(generation.last_modified_dts) ||
            // Update if the data is considered stale
            Date.parse(generationDateData.stale_by_dts!) < Date.parse(generationDateData.last_modified_dts)
        ) {
            // TODO logInfo(`Updating configuration data for ${generation.generation_name}`);
            console.log(`Updating configuration data for ${generation.generation_name}`);
            upsertConfigurationData(dbContext, generation);
        }
    });
};

export const getGenerationCountOffset = async (dbContext: PGliteWithLive, id: number): Promise<[number, number]> =>
    await getGenerationCountAndOffset(dbContext, id);

export const getLastLocalGenerationUpdate = async (dbContext: PGliteWithLive): Promise<DateData[]> => getGenerationLastUpdatedLocally(dbContext);

// export const updateGenerationActive = (id: number) => setGenerationActive(id);

// export const updateLocalLastModified = (id: number) => {
//     setLocalLastModifiedDate(id);
// };
