import styles from "./HomePage.module.css";
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useEffect, useState } from "react";
import { connectionCheck } from "../../../repositories/configurationRepository";
import { usePGlite } from "@electric-sql/pglite-react";


export function HomePage() {
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
    },[]);

    return (
        <>
            <DexHeader title="Home"/>
            <div className={styles.home}>
                <h3>Welcome!</h3>
                <div className={styles.stats}>
                    {/* make permanently dismissable - persist in settings table; add setting to bring tutorial back!*/}
                    <div className={styles.tutorial}>
                        <p>Head over to the tall grass to begin registering Pokemon!</p>
                        <p>Once you have a few, check them out in the Pokedex!</p>
                        <p>Tap the person icon to customize your profile.</p>
                        <p>Head to settings to tweak you experience, enable secret features, and add more regions to explore (when ready)!</p>
                    </div>
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
