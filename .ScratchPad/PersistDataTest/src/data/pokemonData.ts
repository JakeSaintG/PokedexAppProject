import sqlite from 'better-sqlite3';
import fs from 'fs';
import { PokemonBaseData, PokemonSpeciesData } from '../types/pokemonData';
import { Pokemon } from '../types/pokemon';
import { PokedexData } from '../types/pokedexData';

let dbContext: sqlite.Database;

const FILE_LOCATION = './pokemon_data.db';

export const initPokemonDb = (dataSource: string) => {
    setDbContext(dataSource);
    createPokemonTablesIfNotExist();

    // migrateTablesIfNeeded()
}

const setDbContext = (dataSource: string) => {
    console.log('Preparing Pokemon database...');
    if (dataSource === 'sqlite') {
        dbContext = new sqlite(FILE_LOCATION);
    } else if (dataSource === 'postgres') {
        throw 'postgres support not yet implemented.'
    }
};

const createPokemonTablesIfNotExist = () => {
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

    dbContext
        .prepare(`
            CREATE TABLE IF NOT EXISTS pokedex_entries (
                id INT NOT NULL
                ,pokemon_id INT NOT NULL
                ,generation STRING NOT NULL
                ,text_entry STRING NOT NULL
                ,language STRING NOT NULL
                ,version_name STRING NOT NULL
                ,version_url STRING NOT NULL
                ,last_modified_dts STRING NOT NULL
            )
        `)
        .run();
};

// TODO: Do bulk insert instead of onesie-twosie
export const upsertPokemonBaseData = (pkmnData: PokemonBaseData) => {
    let convertedHasForms = 0;
    if (pkmnData.has_forms) convertedHasForms = 1;

    let convertedIsDefault = 0;
    if (pkmnData.is_default) convertedIsDefault = 1;

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
                ,name = name
                ,url = :url
                ,species_url = species_url
                ,is_default = :is_default
                ,male_sprite_url = male_sprite_url
                ,female_sprite_url = female_sprite_url
                ,img_path = img_path
                ,has_forms = has_forms
                ,type_1 = type_1
                ,type_2 = type_2
                ,last_modified_dts = last_modified_dts
    `;

    try {
        dbContext
            .prepare(insert)
            .run({
                id: pkmnData.id,
                name: pkmnData.name,
                url: pkmnData.url,
                is_default: convertedIsDefault,
                species_url: pkmnData.species_url,
                male_sprite_url: pkmnData.male_sprite_url,
                female_sprite_url: pkmnData.male_sprite_url,
                img_path: pkmnData.img_path,
                has_forms: convertedHasForms,
                type_1: pkmnData.type_1,
                type_2: pkmnData.type_2,
                last_modified_dts: new Date().toISOString()
            });
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnData.name}: ${error}`);
    }
}

// TODO: Do bulk insert instead of onesie-twosie
export const upsertPokedexData = (pkmnSpecData: PokemonSpeciesData) => {
    pkmnSpecData.flavor_texts.forEach(t => {
        // TODO: English only for now; more to come later!
        // Trying to keep DB size down for now.
        if (t.language.name !== 'en') return;
        
        const cmd = `
            INSERT INTO pokedex_entries (
                id
                ,pokemon_id
                ,generation
                ,text_entry
                ,language
                ,version_name
                ,version_url
                ,last_modified_dts
            ) 
            VALUES (
                :id
                ,:pokemon_id
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
            .prepare(cmd)
            .run({
                id: pkmnSpecData.id,
                pokemon_id: 'placeholder',
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
    let convertedHasGenderDifferences = 0
    if (pkmnSpecData.has_gender_differences) convertedHasGenderDifferences = 1;

    const cmd =  `
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
            .prepare(cmd)
            .run({
                id: pkmnSpecData.id,
                dex_no: pkmnSpecData.dex_no,
                name: pkmnSpecData.name,
                has_gender_differences: convertedHasGenderDifferences,
                habitat: pkmnSpecData.habitat,
                generation: pkmnSpecData.generation,
                evo_chain_url: pkmnSpecData.evo_chain_url,
                last_modified_dts: new Date().toISOString()
            });
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnSpecData.id}: ${error}`);
    }
}

export const upsertDexData = (pDexData: PokedexData) => {
    dbContext
        .prepare(`
            INSERT INTO pokedex_entries (
                id
                ,pokemon_id
                ,generation
                ,text_entry
                ,language
                ,version_name
                ,version_url
                ,last_modified_dts
            ) 
            VALUES (
                :id
                ,:pokemon_id
                ,:generation
                ,:text_entry
                ,:language
                ,:version_name
                ,:version_url
                ,:last_modified_dts
            )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = :id
                ,pokemon_id = :pokemon_id
                ,generation = :generation
                ,text_entry = :text_entry
                ,language = :language
                ,version_name = :version_name
                ,version_url = :version_url
                ,last_modified_dts = :last_modified_dts
        `)
        .run([
            pDexData.id,
            pDexData.pokemon_id,
            pDexData.generation,
            pDexData.text_entry,
            pDexData.language,
            pDexData.version_name,
            pDexData.version_url,
            pDexData.last_modified_dts
        ]);
}

export const getPokemonSpeciesToLoad = (pokemonToGet: Pokemon[]) => {
    let pokemonSpeciesToLoad: Pokemon[] = [];

    const stmt = `
        SELECT 
            name
            ,species_url
        FROM pokemon_base_data
        WHERE name IN (${pokemonToGet.map((p: Pokemon) => `'${p.name}'`).join(', ')});
    `;

    const pokemonSpeciesList = dbContext
        .prepare(stmt)
        .all();

    pokemonSpeciesList.forEach(spec => {
        if (
            typeof spec === 'object' 
            && spec !== null 
            && (
                'name' in spec
                && typeof spec['name'] === 'string'
            )
            && (
                'species_url' in spec
                && typeof spec['species_url'] === 'string'
            )
        ) {
            pokemonSpeciesToLoad.push({
                name: spec.name,
                url: spec.species_url
            });
        }
    })

    return pokemonSpeciesToLoad;
}
