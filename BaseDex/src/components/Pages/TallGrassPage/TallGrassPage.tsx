import styles from "./TallGrassPage.module.css";
import { DexHeader, NavigationMenu } from "../../PageElements";
import { useEffect, useState } from "react";
import { getPokemonCountData } from "../../../repositories/pokemonRepository";
import { usePGlite } from "@electric-sql/pglite-react";
import { connectionCheck } from "../../../repositories/configurationRepository";
import type { RegionCountData } from "../../../types/regionCountData";
import { Link } from "react-router-dom";

export function TallGrassPage() {
    const defaultRegionData: RegionCountData[] = [];
    let key = 0;

    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    const [generationData, setGenerationData] = useState(defaultRegionData);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getPokemonCountData(dbContext).then(t => setGenerationData(t));
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
