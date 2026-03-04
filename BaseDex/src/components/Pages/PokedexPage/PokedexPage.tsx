import styles from './PokedexPage.module.css';
import { DexHeader, NavigationMenu } from "../../PageElements";
import { PokedexPreview } from './PokedexPreview';
import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import { usePGlite } from "@electric-sql/pglite-react";
import { useEffect, useState } from 'react';
import { getPokedexPageData } from '../../../repositories/pokemonRepository';
import { connectionCheck } from '../../../repositories/configurationRepository';

export function PokedexPage( ) {
    const dexTile: PokedexPreviewData[] = [];
    let key = 0;

    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    const [pokedexPreviewData, setPokedexPreviewData] = useState(dexTile);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getPokedexPageData(dbContext).then(d => setPokedexPreviewData(d));
    }, []);

    const [isChecked, setIsChecked] = useState(false);
    const handleToggleInput = () => {
        setIsChecked(!isChecked);
    };
    useEffect(() => {
        console.log(isChecked)
    }, [isChecked])

    return (
        <>
            <DexHeader title='Pokédex'/>
            <div className={styles.dex_menu}>
                <div className={styles.dex_menu_select}>
                    <div className={styles.dex_menu_arrow_left} onClick={() => console.log('previous gen')}></div>
                    <p>{"GENERATION 1"}</p>
                    <div className={styles.dex_menu_arrow_right} onClick={() => console.log('next gen')}></div>
                </div>
                <div className={styles.dex_menu_toggle}>
                    <label htmlFor="toggle_regional_forms">Show Regional Forms</label>
                    <input type="checkbox" name="toggle_regional_forms" id="toggle_regional_forms" onChange={handleToggleInput}/>
                </div>
            </div>
            <div className={styles.dex_previews}>
                {pokedexPreviewData.map((pkmn) => (
                        <PokedexPreview previewData={pkmn} key={key++}></PokedexPreview>
                ))}
            </div>
            <NavigationMenu activePage='pokedex' connectionError={dbError}></NavigationMenu>
        </>
    );
}
