import styles from "./HomePage.module.css";
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useEffect, useState } from "react";
import { connectionCheck, getSettings, toggleTutorial } from "../../../repositories/configurationRepository";
import { usePGlite } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from '@electric-sql/pglite/live';
import type { Settings } from "../../../types/settings";


export function HomePage() {
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);

    // TODO: I'm going to be getting settings a lot...should probably
    // look into react's ContextApi or Signals
    const [settings, setSettings] = useState({} as Settings);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getSettings(dbContext).then((r: Settings) => setSettings(r));
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

    return (
        <>
            <DexHeader title="Home"/>
            <div className={styles.home}>
                <h3>Welcome!</h3>
                <div className={styles.stats}>
                    {displayTutorial(dbContext)}
                    <div className={styles.total_registered}>
                        <p>Total registered:</p>
                        <p>0/0</p>
                    </div>
                </div>
            </div>
            <NavigationMenu activePage="home" connectionError={dbError}></NavigationMenu>
        </>
    );
}
