import sqlite from 'better-sqlite3';
import { SupportedGeneration } from '../types/configurationData';
import { DateData } from '../types/dateData';

let dbContext: sqlite.Database;

const FILE_LOCATION = './config.db';

export const initConfigDb = (dataSource: string) => {
    setDbContext(dataSource);
    createConfigTablesIfNotExist();
}

const setDbContext = (dataSource: string) => {
    console.log('Preparing configuration database...');
    if (dataSource === 'sqlite') {
        dbContext = new sqlite(FILE_LOCATION);
    } else if (dataSource === 'postgres') {
        throw 'postgres support not yet implemented.'
    }
};

const createConfigTablesIfNotExist = () => {
    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS supported_generations (
                id INT PRIMARY KEY NOT NULL
                ,generation_name STRING NOT NULL
                ,description STRING NOT NULL
                ,starting_dex_no INT NOT NULL
                ,count INT NOT NULL
                ,stale_by_dts STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
                ,source_last_modified_dts STRING NOT NULL
            )
        `)
        .run();

    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS table_versions (
                id INT PRIMARY KEY NOT NULL
                ,table_name STRING NOT NULL
                ,version STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
        `)
        .run();
}

export const upsertConfigurationData = (configData: SupportedGeneration) => {
    const insert =  `
        INSERT INTO supported_generations (
            id
            ,generation_name
            ,description
            ,starting_dex_no
            ,count
            ,stale_by_dts
            ,last_modified_dts
            ,source_last_modified_dts
        ) 
        VALUES (
            :id
            ,:generation_name
            ,:description
            ,:starting_dex_no
            ,:count
            ,:stale_by_dts
            ,:last_modified_dts
            ,:source_last_modified_dts
        )
        ON CONFLICT(id) 
        DO UPDATE SET 
            id = :id
            ,generation_name = :generation_name
            ,starting_dex_no = :starting_dex_no
            ,count = :count
            ,stale_by_dts = stale_by_dts
            ,last_modified_dts = :last_modified_dts
            ,source_last_modified_dts = :source_last_modified_dts
            `;

    dbContext
        .prepare(insert)
        .run({
            id: configData.id,
            generation_name: configData.generation_name,
            description: configData.description,
            starting_dex_no: configData.starting_dex_no,
            count: configData.count,
            stale_by_dts: configData.stale_by_dts,
            source_last_modified_dts: configData.last_modified_dts,
            last_modified_dts: new Date().toISOString()
        });
    try {
    } catch (error) {
        console.error(`Failed to UPSERT config data for ${configData.generation_name}`)
    }
}

export const getConfigData = () => {
    return dbContext.prepare(
        `SELECT * FROM supported_generations;`
    ).all();
}

export const getGenerationUpdateData = (gen_id: number): DateData | undefined => {
    let genLastUpdatedData: DateData = {
        last_modified_dts: '',
        source_last_modified_dts: '',
        stale_by_dts: ''
    };

    const genDateData = dbContext.prepare(
        `SELECT 
            last_modified_dts
            ,source_last_modified_dts
            ,stale_by_dts
        FROM supported_generations
        WHERE id = ${gen_id}
        LIMIT 1;`
    ).all()[0];

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
    ) {
        genLastUpdatedData.last_modified_dts = genDateData.last_modified_dts
        genLastUpdatedData.source_last_modified_dts = genDateData.source_last_modified_dts
        genLastUpdatedData.stale_by_dts = genDateData.stale_by_dts
        
        return genLastUpdatedData;
    } else {
        return undefined;
    }
}