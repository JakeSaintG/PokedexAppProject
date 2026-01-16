import styles from "./TallGrassPage.module.css";
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useEffect, useState } from "react";
import { getTallGrassPageData } from "../../../repositories/pokemonRepository";
import { usePGlite } from "@electric-sql/pglite-react";
import { connectionCheck } from "../../../repositories/configurationRepository";
import type { TallGrassRegion } from "../../../types/tallGrassRegion";
import { Link } from "react-router-dom";

export function TallGrassPage() {
    const defaultRegionData: TallGrassRegion[] = [];
    let key = 0;

    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    const [generationData, setGenerationData] = useState(defaultRegionData);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getTallGrassPageData(dbContext).then(t => setGenerationData(t));
    }, [])

    return (
        <>
            <DexHeader title="Tall Grass"/>
            <div className={styles.contents}>
                {generationData.map((r) => (
                    <Link className={styles.tile} key={key++} to={`/habitat_select?id=${r.generation}`}>
                        <p>{r.region_name}</p>
                        <p>{`${r.registered}/${r.total} Registered`}</p>
                    </Link>
                ))}
            </div>
            <NavigationMenu activePage="tall_grass" connectionError={dbError}></NavigationMenu>
        </>
    );
}
