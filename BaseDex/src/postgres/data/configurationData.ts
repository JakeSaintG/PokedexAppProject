import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { SupportedGeneration } from '../../types/configurationData';
import type { DateData } from '../../types/dateData';
// import type { DateData } from '../../types/dateData';
// import { SupportedGeneration } from '../types/configurationData';
// import { logError, logInfo, setLogRetentionDays } from '../repositories/logRepository';
// import { LogData } from '../types/logData';

export const upsertConfigurationData = (configData: SupportedGeneration, dbContext: PGliteWithLive) => {
    /*
    Insert configuration data. If configuration data is already there, set it with
    the exception of the "active" field. Perserve the active value in case a user
    has that generation active.
    */ 
    
    // TODO: Remember what was going on with local_last_modified vs last_modified; seems redundant and fragile
    const stmt =  `
        INSERT INTO supported_generations (
            id
            ,generation_name
            ,description
            ,starting_dex_no
            ,count
            ,stale_by_dts
            ,active
            ,last_modified_dts
            ,source_last_modified_dts
            ,local_last_modified_dts
        ) 
        VALUES (
            ${configData.id}                  -- id                 
            ,${configData.generation_name}    -- generation_name                             
            ,${configData.description}        -- description                         
            ,${configData.starting_dex_no}    -- starting_dex_no                             
            ,${configData.count}              -- count                     
            ,${configData.stale_by_dts}       -- stale_by_dts                         
            ,${configData.active}             -- active                     
            ,${new Date().toISOString()}      -- last_modified_dts                             
            ,${configData.last_modified_dts}  -- source_last_modified_dts                                 
            ,${''}                            -- local_last_modified_dts     
        )
        ON CONFLICT(id) 
        DO UPDATE SET 
            id = ${configData.id}
            ,generation_name = ${configData.generation_name}
            ,description = ${configData.description}
            ,starting_dex_no = ${configData.starting_dex_no}
            ,count = ${configData.count}
            ,stale_by_dts = ${configData.stale_by_dts}
            ,last_modified_dts = ${new Date().toISOString()}
            ,source_last_modified_dts = ${configData.last_modified_dts}
            ,local_last_modified_dts = ${''};
    `;

    try {
        dbContext.transaction(async (transaction) => transaction.exec(stmt));
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Failed to UPSERT config data for ${configData.generation_name}. This is a terminating error.\r\n${error.message}`, true);
            // logError(`Failed to UPSERT config data for ${configData.generation_name}. This is a terminating error.\r\n${error.message}`, true);
        }
    }
}

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

export const getGenerationUpdateData = async (dbContext: PGliteWithLive, id: number): Promise<DateData | undefined> => {
    let stmt = `
        SELECT 
            last_modified_dts
            ,source_last_modified_dts
            ,stale_by_dts
            ,active
        FROM supported_generations
        WHERE id = ${id}
        LIMIT 1;
    `

    stmt = `
        SELECT *
        FROM supported_generations
    `

    const result = await dbContext.exec(stmt);
    const genDateData = result;

    console.log(result[0].rows)

    if (
        typeof genDateData === 'object' 
        && genDateData !== null 
        && (
            'last_modified_dts' in genDateData
            && typeof genDateData['last_modified_dts'] === 'string'
        )
        && (
            'source_last_modified_dts' in genDateData
            && typeof genDateData['source_last_modified_dts'] === 'string'
        )
        && (
            'stale_by_dts' in genDateData
            && typeof genDateData['stale_by_dts'] === 'string'
        )
        && (
            'active' in genDateData
            && typeof genDateData['active'] === 'boolean'
        )
    ) {
        console.log('==============================================')
        console.log(genDateData.last_modified_dts)
        console.log(genDateData.source_last_modified_dts)
        console.log(genDateData.stale_by_dts)
        console.log(genDateData.active)
        console.log('==============================================')
        
        return {
            last_modified_dts: genDateData.last_modified_dts,
            source_last_modified_dts: genDateData.source_last_modified_dts,
            stale_by_dts: genDateData.stale_by_dts,
            active: genDateData.active
        }
    } else {
        console.log('======================booooo========================')
        return undefined;
    }
}

// export const setGenerationActive

// export const setLocalLastModifiedDate 

// export const getGenerationLastUpdatedLocally

// export const getGenerationCountAndOffset

// export const saveLog

// export const cleanUpOldLogs
