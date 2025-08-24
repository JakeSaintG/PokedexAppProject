import sqlite from 'better-sqlite3';
import { PokemonBaseData, PokemonSpeciesData } from '../types/pokemonData';
import { Pokemon } from '../types/pokemon';
import { PokedexData } from '../types/pokedexData';
import { PokemonImageData } from '../types/pokemonImageData';
import { logInfo } from '../repositories/logRepository';

let dbContext: sqlite.Database;

const FILE_LOCATION = './pokemon_data.db';

export const initPokemonDb = (dataSource: string) => {
    setDbContext(dataSource);
    createPokemonTablesIfNotExist();
    // migrateTablesIfNeeded()

    logInfo('Prepared Pokemon database.');
}

const setDbContext = (dataSource: string) => {
    if (dataSource === 'sqlite') {
        dbContext = new sqlite(FILE_LOCATION);
    } else if (dataSource === 'postgres') {
        throw 'postgres support not yet implemented.'
    }
};

const createPokemonTablesIfNotExist = () => {
    // pokemon_base_data
    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS pokemon_base_data (
                id INT PRIMARY KEY NOT NULL
                ,name STRING NOT NULL
                ,url STRING NOT NULL
                ,species_url STRING NOT NULL
                ,is_default INT NOT NULL --INT used as BIT
                ,type_1 STRING NOT NULL
                ,type_2 STRING NULL
                ,img_path STRING NOT NULL
                ,has_forms INT NOT NULL --INT used as BIT
                ,male_sprite_url STRING NOT NULL
                ,female_sprite_url STRING NULL
                ,last_modified_dts STRING NOT NULL
            )
        `)
        .run();

    // pokemon_species_data
    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS pokemon_species_data (
                id INT PRIMARY KEY NOT NULL
                ,dex_no INT NOT NULL
                ,name STRING NOT NULL
                ,is_default INT NULL --INT used as BIT
                ,habitat STRING NOT NULL
                ,has_gender_differences INT NULL --INT used as BIT
                ,generation STRING NOT NULL
                ,evo_chain_url STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
        `)
        .run();

    // pokedex_entries
    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS pokedex_entries (
                id INT NOT NULL
                ,generation STRING NOT NULL
                ,text_entry STRING NOT NULL
                ,language STRING NOT NULL
                ,version_name STRING NOT NULL
                ,version_url STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
        `)
        .run();

    // pokemon_images
    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS pokemon_images (
                id INT PRIMARY KEY NOT NULL
                ,name INT NOT NULL
                ,default_img_size INT NOT NULL
                ,female_img_size INT NULL
                ,default_img_last_modified INT NOT NULL
                ,female_img_last_modified INT NULL
                ,default_img_data BLOB NOT NULL
                ,female_img_data BLOB NULL
            )
        `)
        .run();
};

export const upsertPokemonImage = async (pkmnImgData: PokemonImageData) => {
    let defaultImageBuffer = null;
    let femaleImageBuffer = null;
    let defaultImageSize = null;
    let femaleImageSize = null;
    const defaultImageLastModifiedDate = new Date().toISOString();
    let femaleImageLastModifiedDate = null;

    if (typeof(pkmnImgData.male_sprite) != 'string') {
        defaultImageBuffer = Buffer.from(
            await pkmnImgData.male_sprite.arrayBuffer()
        );
        defaultImageSize = pkmnImgData.male_sprite.size;
    }
    
    if (typeof(pkmnImgData.female_sprite) != 'string' && pkmnImgData.female_sprite != null) {
        femaleImageBuffer = Buffer.from(
            await pkmnImgData.female_sprite.arrayBuffer()
        );
        femaleImageSize = pkmnImgData.female_sprite.size;
        femaleImageLastModifiedDate = defaultImageLastModifiedDate;
    }

    const stmt = `
        INSERT INTO pokemon_images (
            id
            ,name
            ,default_img_size
            ,female_img_size
            ,default_img_last_modified
            ,female_img_last_modified
            ,default_img_data
            ,female_img_data
        ) 
        VALUES (
            :id
            ,:name
            ,:default_img_size
            ,:female_img_size
            ,:default_img_last_modified
            ,:female_img_last_modified
            ,:default_img_data
            ,:female_img_data
        )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = id
                ,name = name
                ,default_img_size = :default_img_size
                ,female_img_size = :female_img_size
                ,default_img_last_modified = :default_img_last_modified
                ,female_img_last_modified = :female_img_last_modified
                ,default_img_data = :default_img_data
                ,female_img_data = :female_img_data
    `

    try {        
        dbContext
            .prepare(stmt)
            .run({
                id: pkmnImgData.id,
                name: pkmnImgData.name,
                default_img_size: defaultImageSize,
                female_img_size: femaleImageSize,
                default_img_last_modified: defaultImageLastModifiedDate,
                female_img_last_modified: femaleImageLastModifiedDate,
                default_img_data: defaultImageBuffer,
                female_img_data: femaleImageBuffer,
            });
    } catch (error) {
        console.error(`Failed to UPSERT image data for ${pkmnImgData.name}: ${error}`);
    }
}

export const upsertPokemonBaseData = async (pkmnData: PokemonBaseData) => {
    const insert =  `
        INSERT INTO pokemon_base_data (
            id
            ,name
            ,url
            ,species_url
            ,is_default
            ,male_sprite_url
            ,female_sprite_url
            ,img_path
            ,has_forms
            ,type_1
            ,type_2
            ,last_modified_dts
        ) 
        VALUES (
            :id
            ,:name
            ,:url
            ,:species_url
            ,:is_default
            ,:male_sprite_url
            ,:female_sprite_url
            ,:img_path
            ,:has_forms
            ,:type_1
            ,:type_2
            ,:last_modified_dts
        )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = id
                ,name = :name
                ,url = :url
                ,species_url = :species_url
                ,is_default = :is_default
                ,male_sprite_url = :male_sprite_url
                ,female_sprite_url = :female_sprite_url
                ,img_path = :img_path
                ,has_forms = :has_forms
                ,type_1 = :type_1
                ,type_2 = :type_2
                ,last_modified_dts = :last_modified_dts
    `;

    try {
        dbContext
            .prepare(insert)
            .run({
                id: pkmnData.id,
                name: pkmnData.name,
                url: pkmnData.url,
                is_default: pkmnData.is_default ? 1 : 0,
                species_url: pkmnData.species_url,
                male_sprite_url: pkmnData.male_sprite_url,
                female_sprite_url: pkmnData.female_sprite_url,
                img_path: pkmnData.img_path,
                has_forms: pkmnData.has_forms ? 1 : 0,
                type_1: pkmnData.type_1,
                type_2: pkmnData.type_2,
                last_modified_dts: new Date().toISOString()
            });
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnData.name}: ${error}`);
    }
}

export const upsertPokedexData = (pkmnSpecData: PokemonSpeciesData) => {
    pkmnSpecData.flavor_texts.forEach(t => {
        // English only for the time being
        // This is a learning exercise and keeping it to english will keep scope down.
        // I'm also trying to keep DB size down for now.
        if (t.language.name !== 'en') return;
        
        const stmt = `
            INSERT INTO pokedex_entries (
                id
                ,generation
                ,text_entry
                ,language
                ,version_name
                ,version_url
                ,last_modified_dts
            ) 
            VALUES (
                :id
                ,:generation
                ,:text_entry
                ,:language
                ,:version_name
                ,:version_url
                ,:last_modified_dts
            )
        `;

        try {
            dbContext
                .prepare(stmt)
                .run({
                    id: pkmnSpecData.id,
                    generation: pkmnSpecData.generation,
                    text_entry: t.flavor_text,
                    language: t.language.name,
                    version_name: t.version.name,
                    version_url: t.version.url,
                    last_modified_dts: new Date().toISOString(),
                });
        } catch (error) {
            console.error(`Failed to UPSERT dex data for ${pkmnSpecData.id}: ${error}`);
        }
    })
}

export const upsertPokemonSpeciesData = (pkmnSpecData: PokemonSpeciesData) => {
    const stmt =  `
        INSERT INTO pokemon_species_data (
            id
            ,dex_no
            ,name
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
                ,has_gender_differences = :has_gender_differences
                ,habitat = :habitat
                ,generation = :generation
                ,evo_chain_url = :evo_chain_url
                ,last_modified_dts = :last_modified_dts
    `;

    try {
        dbContext
            .prepare(stmt)
            .run({
                id: pkmnSpecData.id,
                dex_no: pkmnSpecData.dex_no,
                name: pkmnSpecData.name,
                has_gender_differences: pkmnSpecData.has_gender_differences ? 0 : 1,
                habitat: pkmnSpecData.habitat,
                generation: pkmnSpecData.generation,
                evo_chain_url: pkmnSpecData.evo_chain_url,
                last_modified_dts: new Date().toISOString()
            });
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnSpecData.id}: ${error}`);
    }
}
