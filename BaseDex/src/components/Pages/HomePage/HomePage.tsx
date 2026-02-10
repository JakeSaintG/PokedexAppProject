import styles from "./HomePage.module.css";
import { DexHeader, NavigationMenu } from "../../PageElements";
import { useEffect, useState } from "react";
import { connectionCheck, getSettings, toggleTutorial } from "../../../repositories/configurationRepository";
import { usePGlite } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { Settings } from "../../../types/settings";
import { getPokemonCountData } from "../../../repositories/pokemonRepository";
import type { RegionCountData } from "../../../types/regionCountData";


export function HomePage() {
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);

    // TODO: I'm going to be getting settings a lot...should probably
    // look into react's ContextApi or Signals
    const [settings, setSettings] = useState({} as Settings);
    const [generationData, setGenerationData] = useState({} as RegionCountData);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getSettings(dbContext).then((r: Settings) => setSettings(r));

        getPokemonCountData(dbContext).then((b: RegionCountData[]) => {
        
            let sumRegistered = 0;
            let sumTotal = 0;
            b.forEach(b => {
                sumRegistered += b.registered
                sumTotal += b.total
            })

            return {
                generation: "all",
                id: 1,
                region_name: "combined",
                registered: sumRegistered,
                total: sumTotal
            } as RegionCountData
        })
        .then(t => setGenerationData((t)));
    },[]);

    const displayTutorial = (dbContext: PGliteWithLive) => {
        if (settings.tutorial_active) {
            return <div className={styles.tutorial}>
                <p>Head over to the tall grass to begin registering Pokemon!</p>
                <p>Once you've caught a few, check them out in the Pokedex!</p>
                <p>Tap the person icon to customize your profile.</p>
                <p>Go to settings to tweak you experience, enable secret features, and add more regions to explore (when ready)!</p>
                <button onClick={() => toggleTutorial(dbContext, settings).then((s: Settings) => setSettings(s))}>Got it!</button>
            </div>
        }

        return <></>
    }

    const displayRegisterData = (generationData: RegionCountData) => {
        const reg = generationData.registered ? generationData.registered : 'XXX';
        const tot = generationData.total ? generationData.total : 'XXX';

        return <p>{reg}/{tot}</p>;
    }

    return (
        <>
            <DexHeader title="Home"/>
            <div className={styles.home}>
                <h3>Welcome!</h3>
                <div className={styles.stats}>
                    {displayTutorial(dbContext)}
                    <div className={styles.total_registered}>
                        <p>Total registered:</p>
                        {displayRegisterData(generationData)}
                    </div>
                </div>
            </div>
            <NavigationMenu activePage="home" connectionError={dbError}></NavigationMenu>
        </>
    );
}
