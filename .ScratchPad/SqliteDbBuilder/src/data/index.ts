import { DataConfig } from "../types"
import { ensureDbExists } from "./sqliteData";
import { ensureJsonExists } from "./jsonData";

const ensureDataStoreExists = (sources: DataConfig) => {
    if (sources.jsonStoreEnabled) ensureJsonStoreExists();
    if (sources.sqliteEnabled) ensureDbExists();
}