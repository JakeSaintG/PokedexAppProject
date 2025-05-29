import { initConfigDb } from "./data/configurationData";
import { initPokemonDb } from "./data/pokemonData";
import { getUpdatedAppConfiguration, configApiPing, updateConfiguration } from "./repositories/configurationRepository";
import { pokeApiPing } from "./repositories/pokeApiRepository";
import { loadPokemonData } from "./repositories/pokemonRepository";
import { ConfigurationData } from "./types/configurationData";

const initOfflinePlaceholderData = () => {
    /*
    In case the user is offline on the first spin-up of the application,
    it would be a good idea to put a few missingno or starters in there.
    */ 
}

export const runStartUp = async (dataSource: string, forceUpdate: boolean) => {
    initConfigDb(dataSource);
    initPokemonDb(dataSource);

    if (configApiPing()) {
        const configurationData: ConfigurationData = await getUpdatedAppConfiguration();
        updateConfiguration(configurationData);
    }

    if (pokeApiPing()) {
        loadPokemonData( forceUpdate );
    }

    // Run anything needed in case user is offline
    // - Put placeholder data in?

    // Tell system that start up is complete
};
