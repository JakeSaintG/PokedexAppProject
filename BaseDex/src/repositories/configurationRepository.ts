import type { PGliteWithLive } from '@electric-sql/pglite/live';
import {
    getGenerationCountAndOffset,
    getGenerationLastUpdatedLocally,
    getGenerationUpdateData,
    setGenerationActive,
    setLocalLastModifiedDate,
    upsertConfigurationData,
    upsertObtainableData,
    selectObtainableList,
    connectionError
} from '../postgres/data/configurationData';
import type { AppendedSupportedGeneration, ConfigurationData, Obtainable, SupportedGeneration, VersionGroup } from '../types/configurationData';
import type { DateData } from '../types/dateData';
import { logInfo } from './logRepository';
import { fetchPokeApiData } from './pokeApiRepository';

export const configApiPing = () => {
    return true;
};

export const connectionCheck = async (dbContext: PGliteWithLive): Promise<boolean> => await connectionError(dbContext);

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
                starting_dex_no: 1,
                count: 25, //151
                active: true,
                stale_by_dts: placeHolderStaleByDate,
                last_modified_dts: '2025-05-08T22:04:23.251Z', // new Date().toISOString()
            },
            {
                id: 2,
                starting_dex_no: 152, //152,
                count: 9, // 100
                active: null, //null,
                stale_by_dts: placeHolderStaleByDate,
                last_modified_dts: '2025-05-08T22:01:16.299Z', // new Date().toISOString()
            },
        ],
        obtainable: [
            {
                form: 'alola',
                list: 'white'
            },
            {
                form: 'galar',
                list: 'white'
            },
            {
                form: 'hisui',
                list: 'white'
            },
            {
                form: 'cap',
                list: 'black'
            },
            {
                form: 'starter',
                list: 'black'
            },
            {
                form: 'totem',
                list: 'black'
            },
        ]
    };

    return simulatedResult;
};

export const updateConfiguration = (dbContext: PGliteWithLive, configuration: ConfigurationData) => {
    updateSupportedGenerations(dbContext, configuration.supported_generations);
    updateObtainablity(dbContext, configuration.obtainable);
};

export const getObtainableList = async (dbContext: PGliteWithLive, listType: string): Promise<string[]> => await selectObtainableList(dbContext, listType);

export const getGenerationCountOffset = async (dbContext: PGliteWithLive, id: number): Promise<[number, number]> =>
    await getGenerationCountAndOffset(dbContext, id);

export const getLastLocalGenerationUpdate = async (dbContext: PGliteWithLive): Promise<DateData[]> => getGenerationLastUpdatedLocally(dbContext);

export const updateGenerationActive = (dbContext: PGliteWithLive, id: number) => setGenerationActive(dbContext, id);

const updateObtainablity = (dbContext: PGliteWithLive, obtainableList: Obtainable[]) => {
    obtainableList.forEach((obtainable) => upsertObtainableData(dbContext, obtainable))
}

export const updateSupportedGenerations = async (dbContext: PGliteWithLive, supported_generations: SupportedGeneration[]) => {
    supported_generations.forEach(async (generation: SupportedGeneration) => {
        const generationDateData: DateData | undefined = await getGenerationUpdateData(dbContext, generation.id);

        if (
            // Update if there is no data stored
            generationDateData == undefined ||
            // Update if the value last_modified_dts from the server is newer than what is stored
            Date.parse(generationDateData.source_last_modified_dts!) < Date.parse(generation.last_modified_dts) ||
            // Update if the data is considered stale
            Date.parse(generationDateData.stale_by_dts!) < Date.parse(generationDateData.last_modified_dts)
        ) {
            // console.log(`Updating configuration data for ${generation.generation_name}`);
            
            const additionalConfig = await fetchPokeApiData(`https://pokeapi.co/api/v2/generation/${generation.id}`);

            const desc = additionalConfig.version_groups.map((v: VersionGroup) => v.name);

            const genAppended: AppendedSupportedGeneration = {
                id: generation.id,
                description: desc.join(','),
                generation_name: additionalConfig.name,
                main_region_name: additionalConfig.main_region.name,
                starting_dex_no: generation.starting_dex_no,
                count: generation.count,
                active: generation.active,
                stale_by_dts: generation.stale_by_dts,
                last_modified_dts: generation.last_modified_dts
            }

            logInfo(dbContext, `Updating configuration data for ${genAppended.generation_name}`);
            
            upsertConfigurationData(dbContext, genAppended);
        }
    });
};

export const updateLocalLastModified = (dbContext: PGliteWithLive, id: number) => {
    setLocalLastModifiedDate(dbContext, id);
};
