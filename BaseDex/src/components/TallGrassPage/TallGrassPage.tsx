import styles from "./TallGrassPage.module.css";
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

const test_data = [
    { region: "kanto", registered: 2, total: 3 },
    { region: "johto", registered: 2, total: 3 },
    { region: "hoenn", registered: 2, total: 3 },
    { region: "sinnoh", registered: 2, total: 3 },
    { region: "unova", registered: 2, total: 3 },
    { region: "kalos", registered: 2, total: 3 },
    { region: "alola", registered: 2, total: 3 },
    { region: "galar", registered: 2, total: 3 },
    { region: "hisui", registered: 2, total: 3 },
    { region: "paldea", registered: 2, total: 3 },
];

export function TallGrassPage() {
    let key = 0;

    return (
        <div className={styles.tall_grass}>
            <DexHeader />
            <h2>tall grass!</h2>
            <div className={styles.regions}>
                {test_data.map((r) => (
                    <div className={styles.region} key={key++}>
                        <p>{r.region}</p>
                        <p>{`${r.registered}/${r.total}`}</p>
                    </div>
                ))}
            </div>
            <NavigationMenu activePage="tall_grass"></NavigationMenu>
        </div>
    );
}
