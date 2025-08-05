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
                ,generation_name TEXT NOT NULL
                ,description TEXT NOT NULL
                ,starting_dex_no INT NOT NULL
                ,count INT NOT NULL
                ,stale_by_dts TEXT NOT NULL
                ,active BOOLEAN NULL
                ,last_modified_dts TEXT NOT NULL
                ,local_last_modified_dts TEXT NULL
                ,source_last_modified_dts TEXT NOT NULL
            )
        `).then ( () => 
            console.log('supported_generations table created')
        );

    dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY NOT NULL
                ,log_message TEXT NOT NULL
                ,log_level TEXT NOT NULL
                ,verbose_logging BOOLEAN NULL
                ,retain BOOLEAN NULL
                ,log_written_dts TEXT NOT NULL
            )
        `).then ( () => 
            console.log('logs table created')
        );
}

/*
    NOTE! Booleans above will need some rework to not be INTs in the below logic
*/ 

// export const upsertConfigurationData 

// export const getGenerationUpdateData 

// export const setGenerationActive

// export const setLocalLastModifiedDate 

// export const getGenerationLastUpdatedLocally

// export const getGenerationCountAndOffset

// export const saveLog

// export const cleanUpOldLogs
