import sqlite from 'better-sqlite3';
import fs from 'fs';

let dbContext: sqlite.Database;

const FILE_LOCATION = './data.db';

export const initData = () => {
    if (!fs.existsSync(FILE_LOCATION)) {
        console.log('File not found.')
        setDbContext();
        createDatabase();
    } else {
        setDbContext();
    }
};

export const getStoredPokemon = async (): Promise<unknown[]> => {
    return dbContext.prepare('SELECT name FROM pokemon;').all();
}

// TODO: Do I care about is_default when updating? 
export const checkLastUpdated = (pokemonName: string, date: Date) => {
    const selectAllContactRequests: unknown[] = dbContext.prepare(
        `SELECT name, last_modified_dts FROM pokemon WHERE is_default = true and ${pokemonName} = name;`
    ).all();


}

const setDbContext = () => {
    console.log('Setting context.')
    dbContext = new sqlite(FILE_LOCATION);
};

const createDatabase = () => {
    console.log('Creating tables.')
    dbContext
        .prepare(
            `
            CREATE TABLE IF NOT EXISTS pokemon (
                id VARCHAR(36) PRIMARY KEY NOT NULL,
                dex_no INT NOT NULL,
                is_default BIT NULL,
                name VARCHAR NOT NULL,
                url VARCHAR NOT NULL,
                type_1 VARCHAR NOT NULL,
                type_2 VARCHAR NULL,
                img_path VARCHAR NOT NULL,
                species_url VARCHAR NOT NULL,
                has_forms BIT NOT NULL,
                male_sprite_url VARCHAR NOT NULL,
                female_sprite_url VARCHAR NULL,
                has_gender_differences BIT NOT NULL,
                habitat VARCHAR NOT NULL,
                generation VARCHAR NOT NULL,
                evo_chain_url VARCHAR NOT NULL,
                last_modified_dts VARCHAR NOT NULL
            )
            `
        )
        .run();

    dbContext
        .prepare(
            `
            CREATE TABLE IF NOT EXISTS pokedex_entries (
                id VARCHAR(36) PRIMARY KEY NOT NULL,
                gen VARCHAR NOT NULL,
                entry VARCHAR NOT NULL
            )
            `
        )
        .run();
};