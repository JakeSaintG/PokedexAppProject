import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { Buffer } from 'buffer';
import type {
    PokemonBaseData,
    PokemonSpeciesData,
} from "../../types/pokemonData";
import type { PokemonImageData } from "../../types/pokemonImageData";
import { logInfo } from "../../repositories/logRepository";
import type { PokedexPreviewData } from "../../types/pokdexPreviewData";
import type { PokedexEntryData } from "../../types/pokedexEntryData";

export const initPokemonDb = async (dbContext: PGliteWithLive) => {
    await createPokemonTablesIfNotExist(dbContext);
    // migrateTablesIfNeeded()

    logInfo(dbContext, 'Prepared Pokemon database.');
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
                ,weight INT NULL
                ,height INT NULL
                ,img_path TEXT NOT NULL
                ,has_forms BOOLEAN NOT NULL
                ,male_sprite_url TEXT NOT NULL
                ,female_sprite_url TEXT NULL
                ,is_registered BOOLEAN NOT NULL
                ,obtainable BOOLEAN NOT NULL
                ,regional_form BOOLEAN NOT NULL
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
                ,genera TEXT NOT NULL
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
                    ,female_img_last_modified TEXT NOT NULL
                    ,default_img_data BYTEA NOT NULL
                    ,female_img_data BYTEA NULL
                )
            `
        )
        .then(() => console.log("pokemon_images table created"));
};

const blobToByteArray = async (blob: Blob): Promise<Uint8Array> => {
    try {
        return new Uint8Array(await blob.arrayBuffer()); 
    } catch (error) {
        console.error("Error converting blob to byte array:", error);
        throw error;
    }
}

export const upsertPokemonImage = async (dbContext: PGliteWithLive, pkmnImgData: PokemonImageData) => {
    let defaultImageBytes = null;
    let defaultImageSize: number;

    if (typeof(pkmnImgData.default_sprite) != 'string') {
        defaultImageSize = pkmnImgData.default_sprite.size;
        defaultImageBytes = await blobToByteArray(pkmnImgData.default_sprite);
    }

    let femaleImageBytes = null;
    let femaleImageSize: number;
    
    if (typeof(pkmnImgData.female_sprite) != 'string' && pkmnImgData.female_sprite != null) {
        femaleImageSize = pkmnImgData.female_sprite.size;
        femaleImageBytes = await blobToByteArray(pkmnImgData.female_sprite);
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
            new Date().toISOString(),
            new Date().toISOString(), // Even if it's null, it was still modified
            defaultImageBytes,
            femaleImageBytes,
        ]));
    } catch (error) {
        // TODO: better error handling
        console.error(`Failed to UPSERT image data for ${pkmnImgData.name}: ${error}`);
    }
}

export const upsertPokemonBaseData = async (dbContext: PGliteWithLive, pkmnData: PokemonBaseData) => {
    /*
        Insert base data. If configuration data is already there, set it with
        the exception of the "is_registered" field. Perserve the is_registered
        value in case a user has already registered that Pokemon.
    */ 

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
                    ,weight
                    ,height
                    ,is_registered
                    ,obtainable
                    ,regional_form
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
                    ,$12 -- pkmnData.weight
                    ,$13 -- pkmnData.height
                    ,$14 -- is_registered
                    ,$15 -- obtainable
                    ,$16 -- regional_form
                    ,$17 -- new Date().toISOString()
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
                        ,weight = $12                       -- pkmnData.weight
                        ,height = $13                       -- pkmnData.height
                        ,obtainable = $15                   -- obtainable
                        ,regional_form = $16                -- regional_form
                        ,last_modified_dts = $17            -- new Date().toISOString()
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
                pkmnData.weight,
                pkmnData.height,
                false,
                pkmnData.obtainable,
                pkmnData.regional_form,
                new Date().toISOString(),
            ]
        ));
    } catch (error) {
        // TODO: better error handling
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
            // TODO: better error handling
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
            ,genera
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
            ,$9
        )
            ON CONFLICT(id) 
            DO UPDATE SET 
                id = $1
                ,dex_no = $2
                ,name = $3
                ,has_gender_differences = $4
                ,habitat = $5
                ,generation = $6
                ,genera = $7
                ,evo_chain_url = $8
                ,last_modified_dts = $9
    `;

    try {
        await dbContext.transaction(async (transaction) => transaction.query(stmt, [
            pkmnSpecData.id,
            pkmnSpecData.dex_no,
            pkmnSpecData.name,
            pkmnSpecData.has_gender_differences,
            pkmnSpecData.habitat,
            pkmnSpecData.generation,
            pkmnSpecData.genera,
            pkmnSpecData.evo_chain_url,
            new Date().toISOString()
        ]))
    } catch (error) {
        // TODO: better error handling
        console.error(`Failed to UPSERT ${pkmnSpecData.id}: ${error}`);
    }
}

// TODO: need to refactor most data<=>repository functions to be more like this in structure
export const getRegionCountData = async (dbContext: PGliteWithLive): Promise<unknown[]> => {
    // TODO: I don't want to return megas...or gmaxes...but I do want regional variations. I may need go back to the drawing board with my data

    return await dbContext.query(
        `
            SELECT 
                g.id
                ,s.generation AS generation
                ,g.main_region_name AS region_name
                ,COUNT(b.id) AS total
                ,COUNT(CASE WHEN b.is_registered = true THEN 0 END) AS registered
            FROM pokemon_species_data s
            JOIN pokemon_base_data b ON s.id = b.id
            JOIN supported_generations g ON g.generation_name = s.generation
            GROUP BY s.generation, g.main_region_name, g.id
            ORDER BY g.id;
        `
    )
    .then(r =>  r.rows)
    .catch(c => { 
        throw `Unable to retrieve data from supported_generations table: ${c}`;
    });
}

export const getHabitatData = async (dbContext: PGliteWithLive, regionId: string): Promise<unknown[]> => {
    return await dbContext.query(
        `
            SELECT DISTINCT(habitat)
            FROM pokemon_species_data
            WHERE generation = $1;
        `,
        [regionId]
    )
    .then(r =>  r.rows)
    .catch(c => { 
        throw `Unable to retrieve data from supported_generations table: ${c}`;
    });
}

export const getPokedexList = async (dbContext: PGliteWithLive): Promise<PokedexPreviewData[]> => {
    let results;

    try {        
        results = await dbContext.query(`
                SELECT 
                    d.id
                    ,s.dex_no
                    ,s.name
                    ,i.default_img_data
                    ,d.type_1
                    ,d.type_2
                    ,d.male_sprite_url
                    ,d.is_registered
                FROM pokemon_species_data s
                JOIN pokemon_base_data d
                    ON d.id = s.dex_no
                JOIN pokemon_images i
                    on d.id = i.id;
            `
        )
    } catch {
        console.log('Error reading from database');

        return [{
            name: 'MissingNo',
            primary_type: 'none',
            dex_no: 0,
            secondary_type: undefined,
            id: 0,
            img_url: 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png',
            is_registered: true,
        }]
    }
    

    const data = results.rows;

    if (
        Array.isArray(data)
        && data !== null
    ) {
        const previewData = data.map(d => {
            if (
                    typeof d === 'object' 
                    && d !== null
                    && (
                        'id' in d
                        && typeof d['id'] === 'number'
                    )
                    && (
                        'dex_no' in d
                        && typeof d['dex_no'] === 'number'
                    )
                    && (
                        'name' in d
                        && typeof d['name'] === 'string'
                    )
                    && (
                        'type_1' in d
                        && typeof d['type_1'] === 'string'
                    )
                    && (
                        'type_2' in d
                        && (
                            typeof d['type_2'] === 'string' 
                            || d['type_2'] === null
                        )
                    )
                    && (
                        'male_sprite_url' in d
                        && typeof d['male_sprite_url'] === 'string'
                    )
                    && (
                        'is_registered' in d
                        && typeof d['is_registered'] === 'boolean'
                    )
                    && (
                        'default_img_data' in d
                        && typeof d['default_img_data'] === 'object'
                    )
            ) {
                return {
                    id: d.id,
                    name: d.name,
                    primary_type: d.type_1,
                    secondary_type: d.type_2,
                    dex_no: d.dex_no,
                    img_url: d.male_sprite_url,
                    is_registered: d.is_registered,
                    img_data: new Blob([d.default_img_data] as BlobPart[], {type: 'image/png'})
                }
            }
        })

        return previewData as PokedexPreviewData[];
    }

    throw "Error reading pokedex list";
}

export const getPokedexEntry = async (dbContext: PGliteWithLive, id: string): Promise<PokedexEntryData> => {
    let results;
    
    try {
        results = await dbContext.query(`
                SELECT 
                    d.id
                    ,s.name
                    ,s.dex_no
                    ,s.habitat
                    ,s.has_gender_differences
                    ,s.generation
                    ,s.genera
                    ,d.is_default
                    ,d.type_1
                    ,d.type_2
                    ,d.weight
                    ,d.height
                    ,d.has_forms
                    ,d.is_registered
                    ,i.default_img_data
                    ,i.female_img_data
                FROM pokemon_species_data s
                JOIN pokemon_base_data d
                    ON d.id = s.dex_no
                JOIN pokemon_images i
                    on d.id = i.id
                WHERE d.id = $1
                LIMIT 1;
            `, [id]
        )
    } catch {
        console.log('Error reading from database.');
        
        return {
            id: 0,
            name: "MissingNo",
            dex_no: 0,
            habitat: "Shoreline",
            has_gender_differences: false,
            generation: "i",
            genera: "UNIDENTIFIABLE",
            is_default: false,
            type_1: "Ň̷̨ȕ̷͕l̷͇̑l̸̠̏",
            height: 0,
            weight: 0,
            has_forms: false,
            is_registered: true,
        }
    }

    const data = results.rows[0];

    if (
        typeof data === 'object' 
        && data !== null
        && (
            'id' in data
            && typeof data['id'] === 'number'
        )
        && (
            'name' in data
            && typeof data['name'] === 'string'
        )
        && (
            'dex_no' in data
            && typeof data['dex_no'] === 'number'
        )
        && (
            'habitat' in data
            && typeof data['habitat'] === 'string'
        )
        && (
            'has_gender_differences' in data
            && typeof data['has_gender_differences'] === 'boolean'
        )
        && (
            'generation' in data
            && typeof data['generation'] === 'string'
        )
        && (
            'genera' in data
            && typeof data['genera'] === 'string'
        )
        && (
            'is_default' in data
            && typeof data['is_default'] === 'boolean'
        )
        && (
            'type_1' in data
            && typeof data['type_1'] === 'string'
        )
        && (
            'type_2' in data
            && (
                typeof data['type_2'] === 'string'
                || data['type_2'] === null
            )
        )
        && (
            'has_forms' in data
            && typeof data['has_forms'] === 'boolean'
        )
        && (
            'is_registered' in data
            && typeof data['is_registered'] === 'boolean'
        )
        && (
            'default_img_data' in data
            && typeof data['default_img_data'] === 'object'
        )
        && (
            'female_img_data' in data
            && (
                typeof data['female_img_data'] === 'object'
                || data['female_img_data'] === null
            )
        )
    ) {
        data.default_img_data = new Blob([data.default_img_data] as BlobPart[], {type: 'image/png'});

        if (data.female_img_data !== null) {
            data.female_img_data = new Blob([data.female_img_data] as BlobPart[], {type: 'image/png'});
        }
        
        return data as PokedexEntryData;
    }

    throw "Error reading pokedex entry";
}

export const setPokedexRegistered = async (dbContext: PGliteWithLive, id: number) => {
    /*Set the boolean is_registered for a specified row given a unique id.*/ 

    try {
        await dbContext.transaction(async (transaction) => transaction.query(
            `
                UPDATE pokemon_base_data
                SET is_registered = true
                WHERE id = $1;
            `,
            [id]
        ));
    } catch (error) {
        // TODO: better error handling
        console.error(`Failed to set ${id} as registered: ${error}`);
    }
}
