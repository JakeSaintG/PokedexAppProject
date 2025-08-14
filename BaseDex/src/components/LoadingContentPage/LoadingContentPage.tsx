import styles from "./LoadingContentPage.module.css";

import { useEffect, useState } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import { useNavigate } from "react-router-dom";

import speakerIcon from '../../assets/icons/bars-solid-full.svg'
import { DexHeader } from "../DexHeader";
import { initPokemonDb } from "../../postgres/data/pokemonData";
import { initConfigDb } from "../../postgres/data/configurationData";
import type { ConfigurationData } from "../../types/configurationData";
import { configApiPing, getUpdatedAppConfiguration, updateConfiguration } from "../../repositories/configurationRepository";

export function LoadingContentPage() {
    const navigate = useNavigate();
    const dbContext = usePGlite();

    const [loadingText, setLoadingText] = useState(
        "Initializing PokeDex data storage..."
    );

    const placeholder = async (f: () => void) => {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => resolve(f()), 1000);
            return () => clearTimeout(timeoutId);
        });
    };

    // Start up
    useEffect(() => {
        // Might want to handle offline mode here too but, since everything will be
        // hard coded for now, it may not be super worth it.
        initConfigDb(dbContext)
            .then (async () => {
                // TODO: error handling
                if (configApiPing()) {
                    const configurationData: ConfigurationData = await getUpdatedAppConfiguration();
                    updateConfiguration(configurationData, dbContext);
                }
            })
            .then(() => {
                // TODO: handle offline by having preloaded fakemon data if first load
                // If data has previously been loaded, notify the user that they are offline and
                // that they can load data, if needed by going to settings or by closing and reopening
                // the app once online.
                initPokemonDb(dbContext)
            })
            .then(async () => {
                // TODO: actually load the data
                await placeholder(() => {
                    setLoadingText("Loading PokeDex Data, courtesy of PokeAPI.");
                    // TODO: setLoadingText("User is offline, ensuring usable state.")



                });
            })
            .then(async () => {
                await placeholder(() =>
                    setLoadingText("Done! Welcome to your PokeDex!")
                );
            })
        .then(async () => {
            // await placeholder(() => navigate("../home"));
        });
    }, []);

    return (
        <>
            <DexHeader/>
            <div className={styles.loading_page}>
                <div className={styles.dex_display_frame}>
                    <div className={styles.top_decoration}></div>
                    <div className={styles.dex_display_screen}>
                        <p>{loadingText}</p>
                    </div>
                    <div className={styles.bottom_decoration}>
                        <img className={`${styles.speaker} ${styles.done_loading}`} src={speakerIcon} alt="speaker icon" />
                    </div>
                </div>
            </div>
        </>
    );
}
