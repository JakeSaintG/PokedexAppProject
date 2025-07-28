import styles from "./LoadingContentPage.module.css";

import { useEffect, useState } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import { useNavigate } from "react-router-dom";

import speakerIcon from '../../assets/icons/bars-solid-full.svg'
import { DexHeader } from "../DexHeader";
import { initPokemonDb } from "../../postgres/data/pokemonData";

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

    // TODO: handle offline issue
    useEffect(() => {
        initPokemonDb(dbContext)
            .then(async () => {
                // TODO: actually load the data
                await placeholder(() =>
                    setLoadingText("Loading PokeDex Data, courtesy of PokeAPI.")
                );
            })
            .then(async () => {
                await placeholder(() =>
                    setLoadingText("Done! Welcome to your PokeDex!")
                );
            })
        .then(async () => {
            await placeholder(() => navigate("../home"));
        });
    }, []);

    return (
        <>
            <DexHeader></DexHeader>
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
