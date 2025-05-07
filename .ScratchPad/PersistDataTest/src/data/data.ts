import sqlite from 'better-sqlite3';
import fs from 'fs';
import { PkmnData } from '../types/pkmnData';
import { ConfigurationData } from '../types/configurationData';

let dbContext: sqlite.Database;
let configDbContext: sqlite.Database;

const DB_FILE_LOCATION = './data.db';
const CONFIG_DB_FILE_LOCATION = './config.db';

export const initData = (dataSource: string) => {
    if (!fs.existsSync(DB_FILE_LOCATION) || !fs.existsSync(CONFIG_DB_FILE_LOCATION)) {
        setDbContext(dataSource);
        createPokemonTablesIfNotExist();
        createConfigTablesIfNotExist();
    } else {
        setDbContext(dataSource);
    }
};

const setDbContext = (dataSource: string) => {
    console.log('Preparing databases...');
    if (dataSource === 'sqlite') {
        dbContext = new sqlite(DB_FILE_LOCATION);
        configDbContext = new sqlite(CONFIG_DB_FILE_LOCATION);
    } else if (dataSource === 'postgres') {
        throw 'postgres support not yet implemented.'
    }
};

export const getStoredPokemon = async (): Promise<unknown[]> => {
    return dbContext.prepare('SELECT name, url FROM pokemon;').all();
}

export const checkLastUpdated = (pokemonName: string) => {
    return dbContext.prepare(
        `SELECT name, last_modified_dts FROM pokemon WHERE name = '${pokemonName}';`
    ).all()[0];
}

export const checkMinLastUpdated = () => {
    return dbContext.prepare(
        `SELECT min(last_modified_dts) FROM pokemon;`
    ).all()[0]['min(last_modified_dts)'];
}

export const mergeAllData = (pkmnData: PkmnData) => {
    upsertPokemonData(pkmnData);
    upsertDexData(pkmnData)
}

const upsertPokemonData = (pkmnData: PkmnData) => {
    let convertedIsDefault = 0
    let convertedHasForms = 0
    let convertedHasGenderDifferences = 0
    
    if (pkmnData.is_default) convertedIsDefault = 1
    if (pkmnData.has_forms) convertedHasForms = 1
    if (pkmnData.has_gender_differences) convertedHasGenderDifferences = 1

    const insert =  `
    INSERT INTO pokemon (
        id
        ,dex_no
        ,name
        ,is_default
        ,type_1
        ,type_2
        ,img_path
        ,url
        ,species_url
        ,has_forms
        ,male_sprite_url
        ,female_sprite_url
        ,has_gender_differences
        ,habitat
        ,generation
        ,evo_chain_url
        ,last_modified_dts
    ) 
    VALUES (
        :id
        ,:dex_no
        ,:name
        ,:is_default
        ,:type_1
        ,:type_2
        ,:img_path
        ,:url
        ,:species_url
        ,:has_forms
        ,:male_sprite_url
        ,:female_sprite_url
        ,:has_gender_differences
        ,:habitat
        ,:generation
        ,:evo_chain_url
        ,:last_modified_dts
    )
        ON CONFLICT(id) 
        DO UPDATE SET 
            id = :id
            ,dex_no = :dex_no
            ,name = :name
            ,is_default = :is_default
            ,type_1 = :type_1
            ,type_2 = :type_2
            ,img_path = :img_path
            ,url = :url
            ,species_url = :species_url
            ,has_forms = :has_forms
            ,male_sprite_url = :male_sprite_url
            ,female_sprite_url = :female_sprite_url
            ,has_gender_differences = :has_gender_differences
            ,habitat = :habitat
            ,generation = :generation
            ,evo_chain_url = :evo_chain_url
            ,last_modified_dts = :last_modified_dts
    `;

    try {
        dbContext
            .prepare(insert)
            .run({
                id: pkmnData.id,
                dex_no: pkmnData.dex_no,
                name: pkmnData.name,
                is_default: convertedIsDefault,
                type_1: pkmnData.type_1,
                type_2: pkmnData.type_2,
                img_path: pkmnData.img_path,
                url: pkmnData.url,
                species_url: pkmnData.species_url,
                has_forms: convertedHasForms,
                male_sprite_url: pkmnData.male_sprite_url,
                female_sprite_url: pkmnData.male_sprite_url,
                has_gender_differences: convertedHasGenderDifferences,
                habitat: pkmnData.habitat,
                generation: pkmnData.generation,
                evo_chain_url: pkmnData.evo_chain_url,
                last_modified_dts: pkmnData.last_modified_dts
            });
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnData.name}`)
    }
}

export const upsertDexData = (pkmnData: PkmnData) => {
//     const insert = 'INSERT INTO contacts (contact_id, name, email, pieces_of_interest, message) VALUES (?,?,?,?,?)';

//     dbContext
//         .prepare(insert)
//         .run([
//             contactReq.id,
//             contactReq.name,
//             contactReq.email,
//             piecesOfInterest,
//             contactReq.message
//         ]);
}

const createPokemonTablesIfNotExist = () => {
    dbContext
        .prepare(
            `
            CREATE TABLE IF NOT EXISTS pokemon (
                id INT PRIMARY KEY NOT NULL
                ,dex_no INT NOT NULL
                ,name STRING NOT NULL
                ,is_default INT NULL --INT used as BIT
                ,type_1 STRING NOT NULL
                ,type_2 STRING NULL
                ,img_path STRING NOT NULL
                ,url STRING NOT NULL
                ,species_url STRING NOT NULL
                ,has_forms INT NOT NULL --INT used as BIT
                ,male_sprite_url STRING NOT NULL
                ,female_sprite_url STRING NULL
                ,has_gender_differences INT NOT NULL --INT used as BIT
                ,habitat STRING NOT NULL
                ,generation STRING NOT NULL
                ,evo_chain_url STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
            `
        )
        .run();

    dbContext
        .prepare(
            `
            CREATE TABLE IF NOT EXISTS pokedex_entries (
                id INT PRIMARY KEY NOT NULL
                ,gen STRING NOT NULL
                ,entry STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
            `
        )
        .run();

    console.log('Pokemon specific tables created');
};

const createConfigTablesIfNotExist = () => {
    configDbContext
        .prepare(
            `
            CREATE TABLE IF NOT EXISTS supported_generations (
                id INT PRIMARY KEY NOT NULL
                ,generation_name STRING NOT NULL
                ,start_dex_no INT NOT NULL
                ,end_dex_no INT NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
            `
        )
        .run();

    console.log('configuration tables created');
}

export const upsertConfigurationData = (configData: ConfigurationData[]) => {
    const insert =  `
        INSERT INTO supported_generations (
            id
            ,generation_name
            ,start_dex_no
            ,end_dex_no
            ,last_modified_dts
        ) 
        VALUES (
            :id
            ,:generation_name
            ,:start_dex_no
            ,:end_dex_no
            ,:last_modified_dts
        )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = :id
                ,generation_name = :generation_name
                ,start_dex_no = :start_dex_no
                ,end_dex_no = :end_dex_no
                ,last_modified_dts = :last_modified_dts
    `;

    configData.forEach((c: ConfigurationData) => {
        configDbContext
            .prepare(insert)
            .run({
                id: c.id,
                generation_name: c.generation_name,
                start_dex_no: c.start_dex_no,
                end_dex_no: c.end_dex_no,
                last_modified_dts: c.last_modified_dts
            });
        try {
        } catch (error) {
            console.error(`Failed to UPSERT config data for ${c.generation_name}`)
        }
    })
}
