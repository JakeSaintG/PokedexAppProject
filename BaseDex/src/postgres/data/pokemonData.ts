import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { Buffer } from 'buffer';
import type {
    PokemonBaseData, /*, PokemonSpeciesData*/
    PokemonSpeciesData,
} from "../../types/pokemonData";
import type { PokemonImageData } from "../../types/pokemonImageData";
import { logInfo } from "../../repositories/logRepository";
// import type { Pokemon } from '../../types/pokemon';
// import type { PokedexData } from '../../types/pokedexData';
// import type { PokemonImageData } from '../../types/pokemonImageData';

export const initPokemonDb = async (dbContext: PGliteWithLive) => {
    await createPokemonTablesIfNotExist(dbContext);
    // migrateTablesIfNeeded()
    logInfo(dbContext, 'Prepared Pokemon database.');
};

const createPokemonTablesIfNotExist = async (dbContext: PGliteWithLive) => {
    console.log("Creating Pokémon tables...");

    // TODO: Add is_registered

    // pokemon_base_data
    await dbContext
        .exec(
            `
            CREATE TABLE IF NOT EXISTS pokemon_base_data (
                id INT PRIMARY KEY NOT NULL
                ,name TEXT NOT NULL
                ,url TEXT NOT NULL
                ,species_url TEXT NOT NULL
                ,is_default BOOLEAN NOT NULL
                ,type_1 TEXT NOT NULL
                ,type_2 TEXT NULL
                ,img_path TEXT NOT NULL
                ,has_forms BOOLEAN NOT NULL
                ,male_sprite_url TEXT NOT NULL
                ,female_sprite_url TEXT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `
        )
        .then(() => console.log("pokemon_base_data table created"));

    // pokemon_species_data
    await dbContext
        .exec(
            `
            CREATE TABLE IF NOT EXISTS pokemon_species_data (
                id INT PRIMARY KEY NOT NULL
                ,dex_no INT NOT NULL
                ,name TEXT NOT NULL
                ,is_default BOOLEAN NULL
                ,habitat TEXT NOT NULL
                ,has_gender_differences BOOLEAN NULL
                ,generation TEXT NOT NULL
                ,evo_chain_url TEXT NOT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `
        )
        .then(() => console.log("pokemon_species_data table created"));

    // pokedex_entries
    await dbContext
        .exec(
            `
            CREATE TABLE IF NOT EXISTS pokedex_entries (
                id INT NOT NULL
                ,generation TEXT NOT NULL
                ,text_entry TEXT NOT NULL
                ,language TEXT NOT NULL
                ,version_name TEXT NOT NULL
                ,version_url TEXT NOT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `
        )
        .then(() => console.log("pokedex_entries table created"));

    // pokemon_images
    //TODO: I used a BLOB in sqlite and a BYTEA here (byte array)
    // Make sure this still works on read/write
    await dbContext
        .exec(
            `
                CREATE TABLE IF NOT EXISTS pokemon_images (
                    id INT PRIMARY KEY NOT NULL
                    ,name TEXT NOT NULL
                    ,default_img_size INT NOT NULL
                    ,female_img_size INT NULL
                    ,default_img_last_modified TEXT NOT NULL
                    ,female_img_last_modified TEXT NULL
                    ,default_img_data BYTEA NOT NULL
                    ,female_img_data BYTEA NULL
                )
            `
        )
        .then(() => console.log("pokemon_images table created"));
};

export const upsertPokemonImage = async (dbContext: PGliteWithLive, pkmnImgData: PokemonImageData) => {
    let defaultImageBuffer = null;
    let femaleImageBuffer = null;
    let defaultImageSize: number;
    let femaleImageSize: number;
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
            $1 -- id
            ,$2 -- name
            ,$3 -- default_img_size
            ,$4 -- female_img_size
            ,$5 -- default_img_last_modified
            ,$6 -- female_img_last_modified
            ,$7 -- default_img_data
            ,$8 -- female_img_data
        )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = $1
                ,name = $2
                ,default_img_size = $3
                ,female_img_size = $4
                ,default_img_last_modified = $5
                ,female_img_last_modified = $6
                ,default_img_data = $7
                ,female_img_data = $8
    `

    try {        
        await dbContext.transaction(async (transaction) => transaction.query(stmt, [
            pkmnImgData.id,
            pkmnImgData.name,
            defaultImageSize,
            femaleImageSize,
            defaultImageLastModifiedDate,
            femaleImageLastModifiedDate,
            defaultImageBuffer,
            femaleImageBuffer,
        ]));
    } catch (error) {
        console.error(`Failed to UPSERT image data for ${pkmnImgData.name}: ${error}`);
    }
}

export const upsertPokemonBaseData = async (dbContext: PGliteWithLive, pkmnData: PokemonBaseData) => {
    try {
        await dbContext.transaction(async (transaction) => transaction.query(
            `
                INSERT INTO pokemon_base_data (
                    id
                    ,name
                    ,url
                    ,is_default
                    ,species_url
                    ,male_sprite_url
                    ,female_sprite_url
                    ,img_path
                    ,has_forms
                    ,type_1
                    ,type_2
                    ,last_modified_dts
                ) 
                VALUES (
                    $1 -- pkmnData.id
                    ,$2 -- pkmnData.name
                    ,$3 -- pkmnData.url
                    ,$4 -- pkmnData.is_default
                    ,$5 -- pkmnData.species_url
                    ,$6 -- pkmnData.male_sprite_url
                    ,$7 -- pkmnData.female_sprite_url
                    ,$8 -- pkmnData.img_path
                    ,$9 -- pkmnData.has_forms
                    ,$10 -- pkmnData.type_1
                    ,$11 -- pkmnData.type_2
                    ,$12 -- new Date().toISOString()
                )
                    ON CONFLICT(id) 
                    DO UPDATE SET 
                        id = $1                             -- pkmnData.id
                        ,name = $2                          -- pkmnData.name
                        ,url = $3                           -- pkmnData.url
                        ,is_default = $4                    -- pkmnData.is_default
                        ,species_url = $5                   -- pkmnData.species_url
                        ,male_sprite_url = $6               -- pkmnData.male_sprite_url
                        ,female_sprite_url = $7             -- pkmnData.female_sprite_url
                        ,img_path = $8                      -- pkmnData.img_path
                        ,has_forms = $9                     -- pkmnData.has_forms
                        ,type_1 = $10                       -- pkmnData.type_1
                        ,type_2 = $11                       -- pkmnData.type_2
                        ,last_modified_dts = $12            -- new Date().toISOString()
            `,
            [
                pkmnData.id,
                pkmnData.name,
                pkmnData.url,
                pkmnData.is_default,
                pkmnData.species_url,
                pkmnData.male_sprite_url,
                pkmnData.female_sprite_url,
                pkmnData.img_path,
                pkmnData.has_forms,
                pkmnData.type_1,
                pkmnData.type_2,
                new Date().toISOString(),
            ]
        ));
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnData.name}: ${error}`);
    }
};

export const upsertPokedexData = async (dbContext: PGliteWithLive, pkmnSpecData: PokemonSpeciesData) => {
    pkmnSpecData.flavor_texts.forEach(async t => {
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
                $1 -- id
                ,$2 -- generation
                ,$3 -- text_entry
                ,$4 -- language
                ,$5 -- version_name
                ,$6 -- version_url
                ,$7 -- last_modified_dts
            )
        `;

        try {
            await dbContext.transaction(async (transaction) => transaction.query(stmt, [
                pkmnSpecData.id,
                pkmnSpecData.generation,
                t.flavor_text,
                t.language.name,
                t.version.name,
                t.version.url,
                new Date().toISOString(),
            ]))
        } catch (error) {
            console.error(`Failed to UPSERT dex data for ${pkmnSpecData.id}: ${error}`);
        }
    })
}

export const upsertPokemonSpeciesData = async (dbContext: PGliteWithLive, pkmnSpecData: PokemonSpeciesData) => {
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
            $1
            ,$2
            ,$3
            ,$4
            ,$5
            ,$6
            ,$7
            ,$8
        )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = $1
                ,dex_no = $2
                ,name = $3
                ,has_gender_differences = $4
                ,habitat = $5
                ,generation = $6
                ,evo_chain_url = $7
                ,last_modified_dts = $8
    `;

    try {
        await dbContext.transaction(async (transaction) => transaction.query(stmt, [
            pkmnSpecData.id,
            pkmnSpecData.dex_no,
            pkmnSpecData.name,
            pkmnSpecData.has_gender_differences,
            pkmnSpecData.habitat,
            pkmnSpecData.generation,
            pkmnSpecData.evo_chain_url,
            new Date().toISOString()
        ]))
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnSpecData.id}: ${error}`);
    }
}


export const getRegionCountData = async (dbContext: PGliteWithLive) => {

    // TODO: need to get is_registered once its added...
    // TODO: return count(*) from base_data joined on pokedex_entries grouped by generation

    const results = await dbContext.query(`
            SELECT 
                *
            FROM pokedex_entries;
        `, [/*id*/]
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