import type { PGliteWithLive } from "@electric-sql/pglite/live";
import type {
    PokemonBaseData /*, PokemonSpeciesData*/,
} from "../../types/pokemonData";
// import type { Pokemon } from '../../types/pokemon';
// import type { PokedexData } from '../../types/pokedexData';
// import type { PokemonImageData } from '../../types/pokemonImageData';

export const initPokemonDb = async (dbContext: PGliteWithLive) => {
    await createPokemonTablesIfNotExist(dbContext);
    // migrateTablesIfNeeded()
    // logInfo('Prepared Pokemon database.');
};

const createPokemonTablesIfNotExist = async (dbContext: PGliteWithLive) => {
    console.log("Creating Pokémon tables...");

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
                    ,name INT NOT NULL
                    ,default_img_size INT NOT NULL
                    ,female_img_size INT NULL
                    ,default_img_last_modified INT NOT NULL
                    ,female_img_last_modified INT NULL
                    ,default_img_data BYTEA NOT NULL
                    ,female_img_data BYTEA NULL
                )
            `
        )
        .then(() => console.log("pokemon_images table created"));
};

/*
    NOTE! Booleans above will need some rework to not be INTs in the below logic
*/

// export const upsertPokemonImage

// export const upsertPokemonBaseData
export const upsertPokemonBaseData = async (
    dbContext: PGliteWithLive,
    pkmnData: PokemonBaseData
) => {
    try {
        dbContext.query(
            `
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
        );
    } catch (error) {
        console.error(`Failed to UPSERT ${pkmnData.name}: ${error}`);
    }
};

// export const upsertPokedexData

// export const upsertPokemonSpeciesData

// export const upsertDexData

// export const getPokemonSpeciesToLoad
