import { initConfigDb } from "./data/configurationData";
import { initPokemonDb } from "./data/pokemonData";
import { configApiPing, updateConfiguration } from "./repositories/configurationRepository";
import { pokeApiPing } from "./repositories/pokeApiRepository";
import { loadPokemonData } from "./repositories/pokemonRepository";
import { ConfigurationData } from "./types/configurationData";

// Just a week for now
const placeHolderStaleByDate = new Date(
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000
).toISOString();

// Call out for new configuration
const getUpdatedAppConfiguration = async () => {
    // Pretend API call to a "home" server that holds app config data
    // (): result => {}

    const simulatedResult = {
        supported_generations: [
            {
                id: 1,
                generation_name: "generation1",
                description: "Red, Green, Blue, and Yellow.",
                starting_dex_no: 1,
                count: 151, //151
                stale_by_dts: placeHolderStaleByDate,
                last_modified_dts: "2025-05-08T22:04:23.243Z", // new Date().toISOString()
            }
            // ,{
            //     id: 2,
            //     generation_name: 'generation2',
            //     description: 'Gold, Silver, and Crystal.',
            //     starting_dex_no: 152,
            //     count: 3, // 100
            //     stale_by_dts: placeHolderStaleByDate,
            //     last_modified_dts: '2025-05-08T22:01:16.292Z' // new Date().toISOString()
            // }
        ],
    };

    return simulatedResult;
};

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
};
