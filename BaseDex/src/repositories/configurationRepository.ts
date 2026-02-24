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
    connectionError,
    selectAppSettings,
    truncateInsertSettings,
    setDefaultSettings
} from '../postgres/data/configurationData';
import type { AppendedSupportedGeneration, ConfigurationData, Obtainable, SupportedGeneration, VersionGroup } from '../types/configurationData';
import type { DateData } from '../types/dateData';
import { logInfo } from './logRepository';
import { fetchPokeApiData } from './pokeApiRepository';
import type { Settings } from '../types/settings';

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
                count: 151, //151
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

export const getSettings = async (dbContext: PGliteWithLive): Promise<Settings> => {
    const result = await selectAppSettings(dbContext);

    if (
        typeof result === 'object' 
        && result !== null
        && (
            'id' in result
            && typeof result['id'] === 'number'
        )
        && (
            'debug_active' in result
            && typeof result['debug_active'] === 'boolean'
        )
        && (
            'light_mode' in result
            && typeof result['light_mode'] === 'boolean'
        )
        && (
            'register_from_dex' in result
            && typeof result['register_from_dex'] === 'boolean'
        )
        && (
            'tutorial_active' in result
            && typeof result['tutorial_active'] === 'boolean'
        )
        && (
            'last_updated_dts' in result
            && typeof result['last_updated_dts'] === 'string'
        )
    ) {
        return result as Settings;
    }

    throw "Unable to parse data for settings.";
}

export const updateSettings = async (dbContext: PGliteWithLive, settings: Settings): Promise<Settings> => {
    /*Updates existing settings and return a Settings object.*/

    await truncateInsertSettings(dbContext, settings);
    return await getSettings(dbContext);
}

export const toggleTutorial = async (dbContext: PGliteWithLive, settings: Settings): Promise<Settings> => {
    settings.tutorial_active = !settings.tutorial_active;
    return await updateSettings(dbContext, settings);
}

export const restoreDefaultSettings = async (dbContext: PGliteWithLive) => {
    await setDefaultSettings(dbContext);
}

export const updateConfiguration = (dbContext: PGliteWithLive, configuration: ConfigurationData) => {
    updateSupportedGenerations(dbContext, configuration.supported_generations);
    updateObtainablity(dbContext, configuration.obtainable);
};

export const getObtainableList = async (dbContext: PGliteWithLive, listType: string): Promise<string[]> => await selectObtainableList(dbContext, listType);

export const getGenerationCountOffset = async (dbContext: PGliteWithLive, id: number): Promise<[number, number]> =>
    await getGenerationCountAndOffset(dbContext, id);

export const getLastLocalGenerationUpdate = async (dbContext: PGliteWithLive): Promise<DateData[]> => {
    const results = getGenerationLastUpdatedLocally(dbContext)
    .then (r => 
        r.reduce((acc: DateData[], e: unknown) => {
            if (
                typeof e === 'object' 
                && e !== null 
                && (
                    'id' in e
                    && typeof e['id'] === 'number'
                )
                && (
                    'last_modified_dts' in e
                    && typeof e['last_modified_dts'] === 'string'
                )
                && (
                    'local_last_modified_dts' in e
                    && typeof e['local_last_modified_dts'] === 'string'
                )
                && (
                    'active' in e
                    && (
                        typeof e['active'] === 'boolean' 
                        || e['active'] === null
                    )
                )
            ) {
                acc.push({
                    generation_id: e.id,
                    last_modified_dts: e.last_modified_dts,
                    active: Boolean(e.active),
                    local_last_modified_dts: e.local_last_modified_dts
                });
            }
    
            return acc;
        }, [])
    )

    return results;
};

export const updateGenerationActive = (dbContext: PGliteWithLive, id: number) => setGenerationActive(dbContext, id);

const updateObtainablity = (dbContext: PGliteWithLive, obtainableList: Obtainable[]) => {
    obtainableList.forEach((obtainable) => upsertObtainableData(dbContext, obtainable))
}

// const parseDateData = async (dbContext: PGliteWithLive, id: number) => {
//     const genDateData: unknown = await getGenerationUpdateData(dbContext, id);

//     if (
//         typeof genDateData === 'object' 
//         && genDateData !== null 
//         && (
//             'last_modified_dts' in genDateData
//             && typeof genDateData['last_modified_dts'] === 'string'
//         )
//         && (
//             'source_last_modified_dts' in genDateData
//             && typeof genDateData['source_last_modified_dts'] === 'string'
//         )
//         && (
//             'stale_by_dts' in genDateData
//             && typeof genDateData['stale_by_dts'] === 'string'
//         )
//         && (
//             'active' in genDateData
//             && typeof genDateData['active'] === 'boolean'
//         )
//     ) {
//         return {
//             last_modified_dts: genDateData.last_modified_dts,
//             source_last_modified_dts: genDateData.source_last_modified_dts,
//             stale_by_dts: genDateData.stale_by_dts,
//             active: genDateData.active
//         }
//     } else {
//         throw `Unable to parse date data for gen ${id}`;
//     }
// }

const generationUpdateData = async (dbContext: PGliteWithLive, genId: number) => {
    const results = await getGenerationUpdateData(dbContext, genId);

    if (
        typeof results === 'object' 
        && results !== null 
        && (
            'last_modified_dts' in results
            && typeof results['last_modified_dts'] === 'string'
        )
        && (
            'source_last_modified_dts' in results
            && typeof results['source_last_modified_dts'] === 'string'
        )
        && (
            'stale_by_dts' in results
            && typeof results['stale_by_dts'] === 'string'
        )
        && (
            'active' in results
            && typeof results['active'] === 'boolean'
        )
    ) {
        return {
            last_modified_dts: results.last_modified_dts,
            source_last_modified_dts: results.source_last_modified_dts,
            stale_by_dts: results.stale_by_dts,
            active: results.active
        }
    } else {
        return undefined;
    }
}

export const updateSupportedGenerations = async (dbContext: PGliteWithLive, supported_generations: SupportedGeneration[]) => {
    supported_generations.forEach(async (generation: SupportedGeneration) => {
        const generationDateData: DateData | undefined = await generationUpdateData(dbContext, generation.id);

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
