import styles from "./HabitatSelect.module.css";
import { DexHeader } from "../../../DexHeader";
import { NavigationMenu } from "../../../NavigationMenu";
import { useState } from "react";
// import { usePGlite } from "@electric-sql/pglite-react";

export function HabitatSelect() {
    // let key = 0;

    // const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);

    return (
        <>
            <DexHeader title="Tall Grass"/>
            <div className={styles.regions}>
                <p>TODO</p>
                <ul>
                    <li>
                        Work in progress! Here I will show a list of Pokemon habitats for the user to select from.
                    </li>
                    <li>
                        The user will select the habitat, the page will SELECT * FROM base_data WHERE habitat = 'habitat';
                        <ul>
                            <li>
                                Also, calcuate a small change that a random legendary/mytical will appear regardless of habitat. Just for fun.
                            </li>
                        </ul>
                    </li>
                    <li>
                        The user will then be greeted with a grassy grid that they can click on until a pkmn appears.
                    </li>
                </ul>
                
            </div>
            <NavigationMenu activePage="tall_grass" connectionError={dbError}></NavigationMenu>
        </>
    );
}
