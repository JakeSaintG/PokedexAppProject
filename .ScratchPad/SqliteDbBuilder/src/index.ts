import { ensureDataStoreExists } from "./data";
import { DataConfig } from "./types";

// ensure data sources exist
// - JSON file and directory
// db file

// TODO: Pull from .env
const dataConfig: DataConfig = {
    sqliteEnabled: true,
    jsonStoreEnabled: true
}

ensureDataStoreExists(dataConfig);
