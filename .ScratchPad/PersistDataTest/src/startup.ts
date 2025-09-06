import { initConfigDb } from "./data/configurationData";
import { initPokemonDb } from "./data/pokemonData";
import { getUpdatedAppConfiguration, configApiPing, updateConfiguration, getLastLocalGenerationUpdate } from "./repositories/configurationRepository";
import { pokeApiPing } from "./repositories/pokeApiRepository";
import { checkIfUpdatesNeeded, loadPokemonData } from "./repositories/pokemonRepository";
import { ConfigurationData } from "./types/configurationData";

const initOfflinePlaceholderData = () => {
    /*
    In case the user is offline on the first spin-up of the application,
    it would be a good idea to put a few missingno or starters in there.
    */ 
}

export const runStartUp = async (dataSource: string, forceUpdate: boolean, batchSize) => {
    initConfigDb(dataSource);
    initPokemonDb(dataSource);

    // TODO: error handling
    if (configApiPing()) {
        const configurationData: ConfigurationData = await getUpdatedAppConfiguration();
        updateConfiguration(configurationData);
    }

    const pkmnGenLastUpdatedLocally = getLastLocalGenerationUpdate();

    const pokemonDataToLoad = checkIfUpdatesNeeded(pkmnGenLastUpdatedLocally, forceUpdate);

    if (pokeApiPing()) {
        loadPokemonData(pokemonDataToLoad, batchSize);
    }

    // Run anything needed in case user is offline
    // - Put placeholder data in?

    // Tell system that start up is complete
};
