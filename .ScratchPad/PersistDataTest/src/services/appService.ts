import { checkMinLastUpdated, getConfigData, upsertConfigurationData } from "../data/data";
import { ConfigurationData } from "../types/configurationData";


export const updateNeeded = (forceUpdate: boolean, staleByDate: string): boolean => {
    /* Check if overall data is stale. */
    const minLastUpdated = checkMinLastUpdated();
    const dbStale = (minLastUpdated == null) || Date.parse(minLastUpdated) > Date.parse(staleByDate);

    if (!dbStale || !forceUpdate) {
        console.log("No data update needed.");
        return false;
    }

    return true;
}

export const setConfigurationData = () => {
    // Pretend API call to a "home" server that holds app config data
    // (): result => {} 

    const result = [
        {
            id: 1,
            generation_name: 'generation1',
            description: 'Red, Green, Blue, and Yellow.',
            starting_dex_no: 1,
            count: 9, //151
            last_modified_dts: '2025-05-07T22:01:16.292Z' // new Date().toISOString()
        }
        ,{
            id: 2,
            generation_name: 'generation2',
            description: 'Gold, Silver, and Crystal.',
            starting_dex_no: 152,
            count: 9, // 100
            last_modified_dts: '2025-05-07T22:01:16.292Z' // new Date().toISOString()
        }
    ]
    
    upsertConfigurationData(result)
}

export const getSupportedGenerations = () => {
    // return 
    return getConfigData()
        .map( (d: ConfigurationData) => {
            return {
                start_dex_no: d.starting_dex_no,
                count: d.count
            }
        })
}
