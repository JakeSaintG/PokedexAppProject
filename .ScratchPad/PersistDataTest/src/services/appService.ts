import { checkMinLastUpdated } from "../data/data";


export const updateNeeded = (forceUpdate: boolean, staleByDate: string): boolean => {
    const minLastUpdated = checkMinLastUpdated();
    const dbStale = !(minLastUpdated == undefined) && minLastUpdated > staleByDate;

    if (dbStale && !forceUpdate) {
        console.log("No data update needed.");
        return false;
    }

    return true;
}
