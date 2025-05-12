import { Pokemon } from "../types/pokemon";

export const loadPokemonData = async (forceUpdate: boolean) => {
    const loadStartTime = new Date().toISOString();
    
    // if (!updateNeeded(forceUpdate, staleByDate)) return;

    // // TODO: implement getting by generation
    // // - When empty, load gen 1
    // // - Allow user to trigger all other gen fetching (using limit and offset)

    // const supportedGenerations = getSupportedGenerations();

    // supportedGenerations.forEach( async (gen) => {
    //     const fetchedPokemon = await fetchPkmnToLoad(gen.count, (gen.start_dex_no - 1));
    //     await loadMissingPokemon(fetchedPokemon, loadStartTime, staleByDate, forceUpdate);
    // })
};

const loadMissingPokemon = async ( 
    toLoad: Pokemon[],
    loadStartTime: string,
    staleByDate: string,
    forceUpdate: boolean,
    getVarieties: boolean = true
) => {
//     await Promise.all(
//         toLoad.map(async (p: Pokemon) => {
//             const lastUpdated = checkLastUpdated(p.name);
            
//             const entryStale = !(lastUpdated == undefined) && lastUpdated["last_modified_dts"] > staleByDate;
            
//             if (entryStale && !forceUpdate) {
//                 return;
//             }

//             const pokemonData = await fetchPkmnData(p.url);

//             // WIP ============================================================================
//             // TODO: Don't do this if I'm in this function recursively
//             // I shouldn't be doing this again if I already know the species data from an outside call 
//             // and I'm just getting the /pokemon/{id} data for the form/variety.
//             const [pkmnSpeciesData, varieties] = await fetchPkmnSpeciesData(
//                 pokemonData["species_url"],
//                 pokemonData["name"]
//             );

//             if (varieties.length > 0 && getVarieties) {
//                 await loadMissingPokemon( varieties, loadStartTime, staleByDate, forceUpdate, false );
//             }
//             // WIP ============================================================================

//             const pkmnData: PkmnData = {
//                 id: pokemonData["id"],
//                 name: pokemonData["name"],
//                 type_1: pokemonData["type_1"],
//                 type_2: pokemonData["type_2"],
//                 img_path: pokemonData["img_path"],
//                 species_url: pokemonData["species_url"],
//                 has_forms: pokemonData["has_forms"],
//                 male_sprite_url: pokemonData["male_sprite_url"],
//                 female_sprite_url: pokemonData["female_sprite_url"],

//                 dex_no: pkmnSpeciesData["dex_no"],
//                 is_default: pkmnSpeciesData["is_default"],
//                 has_gender_differences: pkmnSpeciesData["has_gender_differences"],
//                 habitat: pkmnSpeciesData["habitat"],
//                 generation: pkmnSpeciesData["generation"],
//                 evo_chain_url: pkmnSpeciesData["evo_chain_url"],

//                 url: p.url,
//                 last_modified_dts: new Date().toISOString()
//             };

//             mergeAllData(pkmnData);
//         })
//     );
};
