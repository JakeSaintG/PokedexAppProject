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
            <DexHeader />
            <h2 className={styles.title}>Home</h2>
            <div className={styles.home}>
                <div className={styles.stats}>
                    <p>
                        Here I'll show some stats like how many pkmn are registered
                    </p>
                </div>
            </div>
            <NavigationMenu activePage="home" connectionError={dbError}></NavigationMenu>
        </>
    );
}
