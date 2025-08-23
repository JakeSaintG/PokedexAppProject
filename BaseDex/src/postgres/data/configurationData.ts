import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { SupportedGeneration } from '../../types/configurationData';
import type { DateData } from '../../types/dateData';
// import type { DateData } from '../../types/dateData';
// import { SupportedGeneration } from '../types/configurationData';
// import { logError, logInfo, setLogRetentionDays } from '../repositories/logRepository';
// import { LogData } from '../types/logData';

export const upsertConfigurationData = async (dbContext: PGliteWithLive, configData: SupportedGeneration) => {
    /*
    Insert configuration data. If configuration data is already there, set it with
    the exception of the "active" field. Perserve the active value in case a user
    has that generation active.
    */ 

    try {
        // TODO: Remember what was going on with local_last_modified vs last_modified, seems redundant and fragile
        await dbContext.transaction(async (transaction) => transaction.query(
            `
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
                    $1      -- id
                    ,$2     -- generation_name
                    ,$3     -- description
                    ,$4     -- starting_dex_no
                    ,$5     -- count
                    ,$6     -- stale_by_dts
                    ,$7     -- active
                    ,$8     -- last_modified_dts
                    ,$9     -- source_last_modified_dts
                    ,$10    -- local_last_modified_dts
                )
                ON CONFLICT(id) 
                DO UPDATE SET 
                    id = $1
                    ,generation_name = $2
                    ,description = $3
                    ,starting_dex_no = $4
                    ,count = $5
                    ,stale_by_dts = $6
                    ,last_modified_dts = $8
                    ,source_last_modified_dts = $9
                    ,local_last_modified_dts = $10
            `,
            [configData.id ,configData.generation_name ,configData.description ,configData.starting_dex_no ,configData.count ,configData.stale_by_dts ,configData.active ,new Date().toISOString() ,configData.last_modified_dts ,'']
        ));
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
    const result = await dbContext.query(
        `
            SELECT 
                last_modified_dts
                ,source_last_modified_dts
                ,stale_by_dts
                ,active
            FROM supported_generations
            WHERE id = $1
            LIMIT 1;
        `, 
        [id]
    );

    const genDateData = result.rows[0];

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
            source_last_modified_dts: genDateData.source_last_modified_dts,
            stale_by_dts: genDateData.stale_by_dts,
            active: genDateData.active
        }
    } else {
        return undefined;
    }
}

// export const setGenerationActive

export const setLocalLastModifiedDate = async (dbContext: PGliteWithLive, id: number) => {
    const stmt = `
        UPDATE supported_generations
        SET local_last_modified_dts = $2
        WHERE id = $1;
    `;
    
    try {
        await dbContext.transaction(async (transaction) => transaction.query(stmt, [id, new Date().toISOString()]));
    } catch (error) {
        // logError(`Failed to update supported_generations local_last_modified_dts: ${error}`);
        console.error(`Failed to update supported_generations local_last_modified_dts: ${error}`);
    }
}

export const getGenerationLastUpdatedLocally = async (dbContext: PGliteWithLive): Promise<DateData[]> => {
    const results = await dbContext.query(`
            SELECT 
                id
                ,last_modified_dts
                ,active
                ,local_last_modified_dts
            FROM supported_generations;
        `
    );

    return results.rows.reduce((acc: DateData[], e: unknown) => {
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
                && typeof e['local_last_modified_dts'] === 'string'
            )
            && (
                'active' in e
                && (
                    typeof e['active'] === 'boolean' 
                    || e['active'] === null
                )
            )
        ) {
            acc.push({
                generation_id: e.id,
                last_modified_dts: e.last_modified_dts,
                active: Boolean(e.active),
                local_last_modified_dts: e.local_last_modified_dts
            });
        }

        return acc;
    }, []);
}

export const getGenerationCountAndOffset = async (dbContext: PGliteWithLive, id: number): Promise<[number, number]> => {
    const results = await dbContext.query(`
            SELECT 
                id
                ,count
                ,starting_dex_no
            FROM supported_generations
            WHERE id = $1
            LIMIT 1;
        `, [id]
    )

    const countData = results.rows[0];

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

    throw "Unable to retrieve data from supported_generations table.";
}

// export const saveLog

// export const cleanUpOldLogs
