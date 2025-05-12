import sqlite from 'better-sqlite3';
import { SupportedGeneration } from '../types/configurationData';

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
                ,last_modified_dts STRING NOT NULL
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

export const upsertConfigurationData = (configData: SupportedGeneration[]) => {
    const insert =  `
        INSERT INTO supported_generations (
            id
            ,generation_name
            ,description
            ,starting_dex_no
            ,count
            ,last_modified_dts
        ) 
        VALUES (
            :id
            ,:generation_name
            ,:description
            ,:starting_dex_no
            ,:count
            ,:last_modified_dts
        )
        ON CONFLICT(id) 
        DO UPDATE SET 
            id = :id
            ,generation_name = :generation_name
            ,starting_dex_no = :starting_dex_no
            ,count = :count
            ,last_modified_dts = :last_modified_dts
    `;

    configData.forEach((c: SupportedGeneration) => {
        dbContext
            .prepare(insert)
            .run({
                id: c.id,
                generation_name: c.generation_name,
                description: c.description,
                starting_dex_no: c.starting_dex_no,
                count: c.count,
                last_modified_dts: c.last_modified_dts
            });
        try {
        } catch (error) {
            console.error(`Failed to UPSERT config data for ${c.generation_name}`)
        }
    })
}

export const getConfigData = () => {
    return dbContext.prepare(
        `SELECT * FROM supported_generations;`
    ).all();
}
