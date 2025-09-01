import styles from "./TallGrassPage.module.css";
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";
import { useEffect, useState } from "react";
import { getTallGrassData } from "../../repositories/pokemonRepository";
import { usePGlite } from "@electric-sql/pglite-react";

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
    // TODO: If they empty cache...this page will blow up. So will others. Need to handle that? 
    // Maybe? The main apps won't work like that and this is a poc
    
    const dbContext = usePGlite();
    let key = 0;

    const [generationData, setGenerationData] = useState('');
    
    useEffect(() => {
        
        setGenerationData('beep');

        getTallGrassData(dbContext);
    }, [])

    return (
        
        
        <div className={styles.tall_grass}>
            <DexHeader />
            <h2>tall grass!</h2>
            <div className={styles.regions}>
                {test_data.map((r) => (
                    <div className={styles.region} key={key++}>
                        <p>{r.region}</p>
                        <p>{`${r.registered}/${r.total} ${generationData}`}</p>
                    </div>
                ))}
            </div>
            <NavigationMenu activePage="tall_grass"></NavigationMenu>
        </div>
    );
}
