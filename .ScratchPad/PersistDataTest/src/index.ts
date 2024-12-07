import { initData, getStoredPokemon } from './data/data';
import crypto from 'crypto'


const getPokeAPIData = async () => {
    const limit = 151;
    let pkmn = [];

    await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`, {method: 'GET'})
        .then(res => res.json())
        .then(data => pkmn = data.results)
        .catch(e => console.log('Unable to contact PokeAPI. Continuing in offline mode.\r\nIf connectivity resumes, and you wish to sync data, please do so in the settings.'));

    return pkmn;
    }

const loadData = async () => {
    
    initData();
    
    const fetchedPokemon = await getPokeAPIData();

    const storedPokemon = await getStoredPokemon();

    // quick compare
    const fetchedHash = crypto.createHash('md5').update(fetchedPokemon.toString()).digest('hex');
    const storedHash = crypto.createHash('md5').update(storedPokemon.toString()).digest('hex');

    if (fetchedHash === storedHash) {
        console.log('Data load not necessary.')
        return
    }

    console.log('Checking data to update...')

    console.log(fetchedHash);
    console.log(storedHash);

    // fetchedPokemon.forEach( p => {
    //     console.log(p.name)
    // })

    // storedPokemon.forEach( p => {
    //     console.log(p.name)
    // })
}

loadData()