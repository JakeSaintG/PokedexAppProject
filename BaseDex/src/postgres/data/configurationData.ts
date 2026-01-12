import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { AppendedSupportedGeneration, Obtainable } from '../../types/configurationData';
import type { DateData } from '../../types/dateData';
import type { LogData } from '../../types/logData';
import { logError, logInfo } from '../../repositories/logRepository';
// import { setLogRetentionDays } from '../repositories/logRepository';

export const initConfigDb = async (dbContext: PGliteWithLive) => {
    await createConfigTablesIfNotExist(dbContext);
    // migrateTablesIfNeeded()
    logInfo(dbContext, 'Prepared Pokemon database.');
}

export const connectionError = async (dbContext: PGliteWithLive): Promise<boolean> => {
    return await dbContext.query(
        `
            SELECT id FROM supported_generations LIMIT 1;
        `,
    )
    .then((r) => {
        const idCheck = r.rows[0];
        if (
            typeof idCheck === 'object' 
            && idCheck !== null 
            && (
                'id' in idCheck
                && typeof idCheck['id'] === 'number'
            )
        ) {
            // Connection looks good to go! No errors here.
            return false;
        }

        // Something came back and it wasn't what we expected so return that we are in an error state
        return true;
    })
    .catch ( () =>
        // return that we are in an error state
        true
    );
}

const createConfigTablesIfNotExist = async (dbContext: PGliteWithLive) => {
    console.log('Creating config tables...');
    
    dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS obtainable_forms (
                form TEXT PRIMARY KEY NOT NULL
                ,list TEXT NOT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `).then ( () => 
            console.log('obtainable_forms table created')
        );

    dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS supported_generations (
                id INT PRIMARY KEY NOT NULL
                ,generation_name TEXT NOT NULL
                ,main_region_name TEXT NOT NULL
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
                id SERIAL PRIMARY KEY
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

export const upsertObtainableData = async (dbContext: PGliteWithLive, obtainable: Obtainable) => {
    try {
        await dbContext.transaction(async (transaction) => transaction.query(
            `
                INSERT INTO obtainable_forms (
                    form
                    ,list
                    ,last_modified_dts
                )
                VALUES (
                    $1
                    ,$2
                    ,$3
                )
                ON CONFLICT(form)
                DO UPDATE SET
                    form = $1
                    ,list = $2
                    ,last_modified_dts = $3
            `,
            [
                obtainable.form,
                obtainable.list,
                new Date().toISOString(),
            ]
        ));
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                logError(dbContext, `Failed to UPSERT config data for ${obtainable.form}. This is a terminating error.\r\n${error.message}`, true)
            )
        }
    }
}

export const upsertConfigurationData = async (dbContext: PGliteWithLive, configData: AppendedSupportedGeneration) => {
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
                    ,main_region_name
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
                    ,$3     -- main_region_name
                    ,$4     -- description
                    ,$5     -- starting_dex_no
                    ,$6     -- count
                    ,$7     -- stale_by_dts
                    ,$8     -- active
                    ,$9     -- last_modified_dts
                    ,$10    -- source_last_modified_dts
                    ,$11    -- local_last_modified_dts
                )
                ON CONFLICT(id) 
                DO UPDATE SET 
                    id = $1
                    ,generation_name = $2
                    ,main_region_name = $3
                    ,description = $4
                    ,starting_dex_no = $5
                    ,count = $6
                    ,stale_by_dts = $7
                    ,last_modified_dts = $9
                    ,source_last_modified_dts = $10
                    ,local_last_modified_dts = $11
            `,
            [
                configData.id,
                configData.generation_name,
                configData.main_region_name,
                configData.description,
                configData.starting_dex_no,
                configData.count,
                configData.stale_by_dts,
                configData.active,
                new Date().toISOString(),
                configData.last_modified_dts,
                ''
            ]
        ));
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                logError(dbContext, `Failed to UPSERT config data for ${configData.generation_name}. This is a terminating error.\r\n${error.message}`, true)
            )
        }
    }
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

export const setGenerationActive = async (dbContext: PGliteWithLive, id: number) => {
    try {
        await dbContext.transaction(async (transaction) => transaction.query(
            `
                UPDATE supported_generations
                SET active = 1
                ,local_last_modified_dts = NOW()
                WHERE id = $1;
            `, 
            [id]
        ));
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                logError(dbContext, `Failed to update supported_generations active field: ${error}`)
            )
        }
    }
}

export const setLocalLastModifiedDate = async (dbContext: PGliteWithLive, id: number) => {
    const stmt = `
        UPDATE supported_generations
        SET local_last_modified_dts = $2
        WHERE id = $1;
    `;
    
    try {
        await dbContext.transaction(async (transaction) => transaction.query(stmt, [id, new Date().toISOString()]));
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                logError(dbContext, `Failed to update supported_generations local_last_modified_dts: ${error.message}`)
            )
        }
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

export const selectObtainableList = async (dbContext: PGliteWithLive, listType: string): Promise<string[]> => {
    const stmt = `
        SELECT 
            form
        FROM obtainable_forms
        WHERE list = $1
    `

    const result = (await dbContext.transaction(async (transaction) => transaction.query(stmt, [listType]))).rows;

    if (
        Array.isArray(result) 
        && result !== null
    ) {
        return result.map(r => {
            if (
                typeof r === 'object' 
                && r !== null 
                && (
                    'form' in r
                    && typeof r['form'] === 'string'
                ) 
            ) {
                return r.form;
            }
        }) as string[];
    }

    throw "Unable to retrieve data from obtainable_forms table.";
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

export const saveLog = async (dbContext: PGliteWithLive, logData: LogData) => {
    const stmt =  `
        INSERT INTO logs (
            log_message
            ,log_level
            ,verbose_logging
            ,retain
            ,log_written_dts
        ) 
        VALUES (
            $1
            ,$2
            ,$3
            ,$4
            ,$5
        )
    `;

    try {
        await dbContext.transaction(async (transaction) => transaction.query(
            stmt, 
            [
                logData.message,
                logData.logLevel,
                logData.verbose,
                logData.retain,
                new Date().toISOString()
            ]
    ));
    } catch (error) {
        console.error(`Failed to write log message to log table: ${error}`)
    }
};

export const cleanUpOldLogs = async (dbContext: PGliteWithLive, removeOlderThanDate: Date) => {
    if(!removeOlderThanDate || removeOlderThanDate == undefined) {
        // Somehow, we got in a position where removeOlderThanDate wasn't set or defaulted.
        removeOlderThanDate = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);
    };
    
    const stmt =  `
        DELETE FROM logs 
        WHERE log_written_dts < $1
        AND retain = false OR id > 1000000;
    `;

    try {
        await dbContext.transaction(async (transaction) => transaction.query(
            stmt, [removeOlderThanDate.toISOString()]
        ));
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                logError(dbContext, `Failed to delete old logs! ${error.message}`, false, true)
            )
        }
    }
};
