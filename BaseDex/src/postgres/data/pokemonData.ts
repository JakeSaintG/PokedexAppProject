import type { PGliteWithLive } from '@electric-sql/pglite/live';
// import type { PokemonBaseData, PokemonSpeciesData } from '../../types/pokemonData';
// import type { Pokemon } from '../../types/pokemon';
// import type { PokedexData } from '../../types/pokedexData';
// import type { PokemonImageData } from '../../types/pokemonImageData';

export const initPokemonDb = async (dbContext: PGliteWithLive) => {
    await createPokemonTablesIfNotExist(dbContext);
    // migrateTablesIfNeeded()
    // logInfo('Prepared Pokemon database.');
}

const createPokemonTablesIfNotExist = async (dbContext: PGliteWithLive) => {
    console.log('Creating tables...')

    // pokemon_base_data
    await dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS pokemon_base_data (
                id INT PRIMARY KEY NOT NULL
                ,name TEXT NOT NULL
                ,url TEXT NOT NULL
                ,species_url TEXT NOT NULL
                ,is_default INT NOT NULL --INT used as BIT
                ,type_1 TEXT NOT NULL
                ,type_2 TEXT NULL
                ,img_path TEXT NOT NULL
                ,has_forms INT NOT NULL --INT used as BIT
                ,male_sprite_url TEXT NOT NULL
                ,female_sprite_url TEXT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `).then ( () => 
            console.log('pokemon_base_data table created')
        );

    // pokemon_species_data
    await dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS pokemon_species_data (
                id INT PRIMARY KEY NOT NULL
                ,dex_no INT NOT NULL
                ,name TEXT NOT NULL
                ,is_default INT NULL --INT used as BIT
                ,habitat TEXT NOT NULL
                ,has_gender_differences INT NULL --INT used as BIT
                ,generation TEXT NOT NULL
                ,evo_chain_url TEXT NOT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `).then ( () => 
            console.log('pokemon_species_data table created')
        );

    // pokedex_entries
    await dbContext
        .exec(`
            CREATE TABLE IF NOT EXISTS pokedex_entries (
                id INT NOT NULL
                ,generation TEXT NOT NULL
                ,text_entry TEXT NOT NULL
                ,language TEXT NOT NULL
                ,version_name TEXT NOT NULL
                ,version_url TEXT NOT NULL
                ,last_modified_dts TEXT NOT NULL
            )
        `).then ( () => 
            console.log('pokedex_entries table created')
        );

    // pokemon_images
    //TODO: I used a BLOB in sqlite and a BYTEA here (byte array)
    // Make sure this still works on read/write
    await dbContext
        .exec(`
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
        `).then ( () => 
            console.log('pokemon_images table created')
        );
};
