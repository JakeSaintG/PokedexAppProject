import styles from "./HomePage.module.css";
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function HomePage() {
    return (
        <>
            <DexHeader />
            <div className={styles.home}>
                <div className={styles.stats}>
                    <p>
                        Here I'll show some stats like how many pkmn are registered
                    </p>
                </div>
                <p>HOME</p>
                {/* TODO: If no load has occured due to previous offline state,
                show a button here to try again */}
                <button>try again</button>
            </div>
            <NavigationMenu activePage="home"></NavigationMenu>
        </>
    );
}
