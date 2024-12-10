import { initData, getStoredPokemon } from './data/data';
import crypto from 'crypto'


const getPokeAPIData = async () => {
    const limit = 3;
    let pkmn = [];

    await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`, {method: 'GET'})
        .then(res => res.json())
        .then(data => pkmn = data.results)
        .catch(() => console.log('Unable to contact PokeAPI. Continuing in offline mode.\r\nIf connectivity resumes, and you wish to sync data, please do so in the settings.'));

    return pkmn;
}

const loadMissingPokemon = async (toLoad) => {
    let loadedPokemon = []
    
    await Promise.all(toLoad.map( async (p) => {
        await fetch(p.url, {method: 'GET'})
            .then(res => res.json())
            .then(data => {
                
                // TODO: For now, really only care about types and sprite
                // TODO: Get the species URL from this return and use it to get the rest of the data.
                let pokemonData = {
                    'id': data.id,
                    'name': data.name
                }
                
                loadedPokemon.push(pokemonData)
            })
    }));

    return loadedPokemon;
}

const loadData = async () => {
    
    initData();
    // TODO: do a QUICK ping (getStoredPokemon takes a while to give up)
    const storedPokemon = await getStoredPokemon();
    const fetchedPokemon = await getPokeAPIData();

    // quick compare
    const fetchedHash = crypto.createHash('md5').update(fetchedPokemon.toString()).digest('hex');
    const storedHash = crypto.createHash('md5').update(storedPokemon.toString()).digest('hex');

    if (fetchedHash === storedHash) {
        console.log('Data load not necessary.')
        return
    }

    console.log('Checking data to update.')
    let toLoad = fetchedPokemon.filter(x => !storedPokemon.includes(x.name));

    const loadedPokemon = await loadMissingPokemon(toLoad);


    // TODO: There will be a point in the loading where I start pulling down pokemon forms that are already loaded
    // - I'll get alolan raichu in the first 151 and again when I get to 10100.
    // - Figure out what to do... maybe a last modified date? Skip it if the last_mod is the same as current load time?
    console.log(loadedPokemon)
}

loadData()