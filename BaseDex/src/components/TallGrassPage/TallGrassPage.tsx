import styles from "./TallGrassPage.module.css";
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

const test_data = [
    "kanto",
    "johto",
    "hoenn",
    "sinnoh",
    "unova",
    "kalos",
    "alola",
    "galar",
    "hisui",
    "paldea",
];

export function TallGrassPage() {
    let key = 0;

    return (
        <div className={styles.tall_grass}>
            <DexHeader/>
            <h2>tall grass!</h2>
            <div className={styles.regions}>
                {test_data.map((r) => (
                    <div className={styles.region} key={key++}>
                        <p>{r}</p>
                    </div>
                ))}
            </div>
            <NavigationMenu activePage="tall_grass"></NavigationMenu>
        </div>
    );
}
