import type { PGliteWithLive } from '@electric-sql/pglite/live';
// import type { DateData } from '../../types/dateData';
// import sqlite from 'better-sqlite3';
// import { SupportedGeneration } from '../types/configurationData';
// import { logError, logInfo, setLogRetentionDays } from '../repositories/logRepository';
// import { LogData } from '../types/logData';

export const initConfigDb = async (dbContext: PGliteWithLive) => {
    await createConfigTablesIfNotExist(dbContext);
    // migrateTablesIfNeeded()
    // logInfo('Prepared Pokemon database.');
}

const createConfigTablesIfNotExist = async (dbContext: PGliteWithLive) => {
    console.log('Creating config tables...');
    
    dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS supported_generations (
                id INT PRIMARY KEY NOT NULL
                ,generation_name STRING NOT NULL
                ,description STRING NOT NULL
                ,starting_dex_no INT NOT NULL
                ,count INT NOT NULL
                ,stale_by_dts STRING NOT NULL
                ,active INT NULL -- boolean
                ,last_modified_dts STRING NOT NULL
                ,local_last_modified_dts NULL
                ,source_last_modified_dts STRING NOT NULL
            )
        `).then ( () => 
            console.log('supported_generations table created')
        );

    dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY NOT NULL
                ,log_message STRING NOT NULL
                ,log_level STRING NOT NULL
                ,verbose INT NULL -- boolean
                ,retain INT NULL -- boolean
                ,log_written_dts STRING NOT NULL
            )
        `).then ( () => 
            console.log('logs table created')
        );
}
