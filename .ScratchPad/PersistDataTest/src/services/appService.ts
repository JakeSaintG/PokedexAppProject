import { ConfigurationData } from "../types/configurationData";


// export const updateNeeded = (forceUpdate: boolean, staleByDate: string): boolean => {
//     /* Check if overall data is stale. */
//     const minLastUpdated = checkMinLastUpdated();
//     const dbStale = (minLastUpdated == null) || Date.parse(minLastUpdated) > Date.parse(staleByDate);

//     if (!dbStale || !forceUpdate) {
//         console.log("No data update needed.");
//         return false;
//     }

//     return true;
// }

// export const setConfigurationData = () => {

    
//     upsertConfigurationData(result)
// }

// export const getSupportedGenerations = () => {
//     // return 
//     return getConfigData()
//         .map( (d: ConfigurationData) => {
//             return {
//                 start_dex_no: d.starting_dex_no,
//                 count: d.count
//             }
//         })
// }
