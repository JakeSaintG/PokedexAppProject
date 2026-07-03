import { DataConfig } from "../types"
import { ensureDbExists } from "./sqliteData";
import { ensureJsonStoreExists } from "./jsonData";

export const ensureDataStoreExists = (sources: DataConfig) => {
    if (sources.jsonStoreEnabled) ensureJsonStoreExists();
    if (sources.sqliteEnabled) ensureDbExists();
}