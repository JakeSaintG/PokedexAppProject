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
            name VARCHAR NOT NULL,
            url VARCHAR NOT NULL,
            type_1 VARCHAR NOT NULL,
            type_2 VARCHAR NULL
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