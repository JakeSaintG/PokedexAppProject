// import Habitatstyles from "./HabitatSelect.module.css";
import TallGrassStyles from "../TallGrassPage.module.css";
import { DexHeader } from "../../../DexHeader";
import { NavigationMenu } from "../../../NavigationMenu";
import { connectionCheck } from "../../../../repositories/configurationRepository";
import { useEffect, useState } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import { getHabitatPageData } from "../../../../repositories/pokemonRepository";
import type { Habitat } from "../../../../types/tallGrassRegion";
import { useSearchParams } from "react-router-dom";

export function HabitatSelect() {
    let key = 0;

    const [searchParams] = useSearchParams();
    const regionId = searchParams.get("id")!;
    
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);

    const defaultHabitatData: Habitat[] = [];
    const [habitatData, setHabitatData] = useState(defaultHabitatData);

    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getHabitatPageData(dbContext, regionId).then(r => setHabitatData(r));
    }, [])

    return (
        <>
            <DexHeader title="Tall Grass"/>
            <div className={TallGrassStyles.contents}>
                {/* 
                    TODO: need to handle 'rare' for legendaries
                    calcuate a small change that a random legendary/mytical will appear regardless of habitat. Just for fun.
                */}
                {habitatData.map((r) => (
                    // TODO: link - user will then be greeted with a grassy grid that they can click on until a pkmn appears.
                    <div className={TallGrassStyles.tile} key={key++}>
                        <p>img</p>
                        <p>
                            {r.habitat.replace('-', ' ')}
                        </p>
                    </div>
                ))}
            </div>
            {/* TODO: override for back arrow */}
            <NavigationMenu activePage="tall_grass" connectionError={dbError}></NavigationMenu>
        </>
    );
}
