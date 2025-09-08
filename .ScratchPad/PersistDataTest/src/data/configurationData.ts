import sqlite from 'better-sqlite3';
import { Obtainable, SupportedGeneration } from '../types/configurationData';
import { DateData } from '../types/dateData';
import { logError, logInfo, setLogRetentionDays } from '../repositories/logRepository';
import { LogData } from '../types/logData';

let dbContext: sqlite.Database;

const FILE_LOCATION = './config.db';

export const initConfigDb = (dataSource: string) => {
    setDbContext(dataSource);
    createConfigTablesIfNotExist();
    // migrateTablesIfNeeded();

    logInfo('Prepared configuration database.');
}

const setDbContext = (dataSource: string) => {
    if (dataSource === 'sqlite') {
        dbContext = new sqlite(FILE_LOCATION);
    } else if (dataSource === 'postgres') {
        throw 'postgres support not yet implemented.'
    }

}

const createConfigTablesIfNotExist = () => {
    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS obtainable_forms (
                form STRING PRIMARY KEY NOT NULL
                ,list STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
        `)
        .run();

    dbContext
        .prepare(`
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
        `)
        .run();

    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY
                ,log_message STRING NOT NULL
                ,log_level STRING NOT NULL
                ,verbose INT NULL -- boolean
                ,retain INT NULL -- boolean
                ,log_written_dts STRING NOT NULL
            )
        `)
        .run();
}

export const upsertObtainableData = (obtainable: Obtainable) => {
    const stmt = `
            INSERT INTO obtainable_forms (
                form
                ,list
                ,last_modified_dts
            )
            VALUES (
                :form
                ,:list
                ,:last_modified_dts
            )
            ON CONFLICT(form)
            DO UPDATE SET
                form = :form
                ,list = :list
                ,last_modified_dts = :last_modified_dts
        `;

    try {
        (dbContext.transaction((obtainable: Obtainable) => {
            dbContext
                .prepare(stmt)
                .run({
                    form: obtainable.form,
                    list: obtainable.list,
                    last_modified_dts: new Date().toISOString(),
                });
        }))(obtainable);
    } catch (error) {
        logError(`Failed to UPSERT config data for ${obtainable.form}. This is a terminating error.\r\n${error.message}`, true);
    }
}

export const upsertConfigurationData = (configData: SupportedGeneration) => {
    /*
    Insert configuration data. If configuration data is already there, set it with
    the exception of the "active" field. Perserve the active value in case a user
    has that generation active.
    */ 
    
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
            :id
            ,:generation_name
            ,:description
            ,:starting_dex_no
            ,:count
            ,:stale_by_dts
            ,:active
            ,:last_modified_dts
            ,:source_last_modified_dts
            ,:local_last_modified_dts
        )
        ON CONFLICT(id) 
        DO UPDATE SET 
            id = :id
            ,generation_name = :generation_name
            ,starting_dex_no = :starting_dex_no
            ,count = :count
            ,stale_by_dts = :stale_by_dts
            ,last_modified_dts = :last_modified_dts
            ,source_last_modified_dts = :source_last_modified_dts
            ,local_last_modified_dts = :local_last_modified_dts;
    `;

    try {
        (dbContext.transaction((configData: SupportedGeneration) => {
            dbContext
                .prepare(stmt)
                .run({
                    id: configData.id,
                    generation_name: configData.generation_name,
                    description: configData.description,
                    starting_dex_no: configData.starting_dex_no,
                    count: configData.count,
                    stale_by_dts: configData.stale_by_dts,
                    active: configData.active ? 1 : 0,
                    source_last_modified_dts: configData.last_modified_dts,
                    last_modified_dts: new Date().toISOString(),
                    local_last_modified_dts: ''
                });
        }))(configData);
    } catch (error) {
        logError(`Failed to UPSERT config data for ${configData.generation_name}. This is a terminating error.\r\n${error.message}`, true);
    }
}

export const getGenerationUpdateData = (id: number): DateData | undefined => {
    const stmt = `
        SELECT 
            last_modified_dts
            ,source_last_modified_dts
            ,stale_by_dts
            ,active
        FROM supported_generations
        WHERE id = :id
        LIMIT 1;
    `

    const genDateData = dbContext
        .prepare(stmt)
        .all({id: id})[0];

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
        return {
            last_modified_dts: genDateData.last_modified_dts,
            source_last_modified_dts:  genDateData.source_last_modified_dts,
            stale_by_dts: genDateData.stale_by_dts,
            active: genDateData.active
        }
    } else {
        return undefined;
    }
}

export const setGenerationActive = (id: number) => {
    const stmt = `
        UPDATE supported_generations
        SET active = 1
        WHERE id = :id;
    `;

    try {
        (dbContext.transaction((id: number) => {
            dbContext
                .prepare(stmt)
                .run({
                    id: id
                });
        }))(id);
    } catch (error) {
        logError(`Failed to update supported_generations active field: ${error}`);
    }
}

export const setLocalLastModifiedDate = (id: number) => {
    const stmt = `
        UPDATE supported_generations
        SET local_last_modified_dts = '${new Date().toISOString()}'
        WHERE id = :id;
    `;
    
    try {
        (dbContext.transaction((id: number) => {
            dbContext
                .prepare(stmt)
                .run({
                    id: id
                });
        }))(id);
    } catch (error) {
        logError(`Failed to update supported_generations local_last_modified_dts: ${error}`);
    }
}

export const getGenerationLastUpdatedLocally = (): DateData[] => {
    const stmt = `
        SELECT 
            id
            ,last_modified_dts
            ,active
            ,local_last_modified_dts
        FROM supported_generations;
    `;

    const dateData = dbContext
        .prepare(stmt)
        .all();

    return dateData.map((e) => {
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
                && (typeof e['local_last_modified_dts'] === 'string')
            )
            && (
                'active' in e
                && typeof e['active'] === 'number'
            )
        ) {
            return {
                generation_id: e.id,
                last_modified_dts: e.last_modified_dts,
                active: Boolean(e.active),
                local_last_modified_dts: e.local_last_modified_dts
            };
        }
    });
}

export const selectObtainableList = () => {
        const stmt = `
        SELECT 
            form
            ,list
        FROM obtainable_forms
    `

    const result = dbContext
    .prepare(stmt)
    .all();

    if (
        typeof Array.isArray(result) 
        && result !== null 
        && (
            'form' in result
            && typeof result[0]['form'] === 'string'
        )
        // && (
        //     'list' in result
        //     && typeof result[0]['list'] === 'string'
        // )
    ) {
        
        console.log(result)
        
        // console.log(result.list + result.form)
        
        // return [result.count, result.starting_dex_no]
    } 
    
    console.log('!~fdasdfasdfasdfsadf')
    return undefined;
}

export const getGenerationCountAndOffset = (id: number): [number, number] | undefined => {
    const stmt = `
        SELECT 
            id
            ,count
            ,starting_dex_no
        FROM supported_generations
        WHERE id = ${id}
        LIMIT 1;
    `
    
    const countData = dbContext
        .prepare(stmt)
        .all()[0];

    if (
        typeof countData === 'object' 
        && countData !== null 
        && (
            'id' in countData
            && typeof countData['id'] === 'number'
        )
        && (
            'count' in countData
            && typeof countData['count'] === 'number'
        )
        && (
            'starting_dex_no' in countData
            && typeof countData['starting_dex_no'] === 'number'
        )
    ) {
        return [countData.count, countData.starting_dex_no]
    } 

    return undefined;
}

export const saveLog = (logData: LogData) => {
    const stmt =  `
        INSERT INTO logs (
            log_message
            ,log_level
            ,verbose
            ,retain
            ,log_written_dts
        ) 
        VALUES (
            :log_message
            ,:log_level
            ,:verbose
            ,:retain
            ,:log_written_dts
        )
    `

    try {
        (dbContext.transaction((logData: LogData) => {
            dbContext
                .prepare(stmt)
                .run({
                    log_message: logData.message,
                    log_level: logData.logLevel,
                    verbose: logData.verbose ? 1 : 0,
                    retain: logData.retain ? 1 : 0,
                    log_written_dts: new Date().toISOString()
                });
        }))(logData);
    } catch (error) {
        console.error(`Failed to write log message to log table: ${error}`)
    }
};

export const cleanUpOldLogs = (removeOlderThanDate: Date) => {
    if(!(removeOlderThanDate) || removeOlderThanDate == undefined) {
        // Avoid a position where removeOlderThanDate wasn't set or defaulted.
        removeOlderThanDate = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);
    };
    
    const stmt =  `
        DELETE FROM logs 
        WHERE log_written_dts < :removeOlderThanDate
        AND retain = 0 OR id > 1000000;
    `

    try {
        (dbContext.transaction((removeOlderThanDate: Date) => {
            dbContext.prepare(stmt)
                .run({
                    removeOlderThanDate: removeOlderThanDate.toISOString()
                });
        }))(removeOlderThanDate);
    } catch (error) {
        logError(`Failed to delete old logs! ${error}`, false, true);
    }
};
