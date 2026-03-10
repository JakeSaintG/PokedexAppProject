import styles from './PokedexPage.module.css';
import { DexHeader, NavigationMenu } from "../../PageElements";
import { PokedexPreview } from './PokedexPreview';
import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import { usePGlite } from "@electric-sql/pglite-react";
import { useEffect, useRef, useState } from 'react';
import { getPokedexPageData } from '../../../repositories/pokemonRepository';
import { connectionCheck, getSettings, updateSettings } from '../../../repositories/configurationRepository';
import type { Settings } from '../../../types/settings';
import { useIsMount } from '../../../hooks/useIsMount';

export function PokedexPage( ) {
    const dexTile: PokedexPreviewData[] = [];
    const refKey = useRef(0);

    const isMount = useIsMount();
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    const [pokedexPreviewData, setPokedexPreviewData] = useState(dexTile);
    const [settings, setSettings] = useState({} as Settings);
    const [isChecked, setIsChecked] = useState(false);
    
    useEffect(() => {
        // TODO: update checkbox state based on settings.show_regional_form
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getSettings(dbContext).then((r: Settings) => setSettings(r));
        getPokedexPageData(dbContext, settings.show_regional_forms).then(d => setPokedexPreviewData(d));
    }, []);

    useEffect(() => {
        getPokedexPageData(dbContext, settings.show_regional_forms).then(d => setPokedexPreviewData(d));
    }, [settings]);

    useEffect(() => {
        if (!isMount){
            settings.show_regional_forms = !settings.show_regional_forms;
            updateSettings(dbContext, settings).then((s: Settings) => setSettings(s));
            getPokedexPageData(dbContext, settings.show_regional_forms).then(d => setPokedexPreviewData(d));
            // TODO: need to reload page?
        }
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
                    <input type="checkbox" name="toggle_regional_forms" id="toggle_regional_forms" onChange={() => setIsChecked(!isChecked)}/>
                </div>
            </div>
            <div className={styles.dex_previews}>
                {pokedexPreviewData.map((pkmn) => (
                        <PokedexPreview previewData={pkmn} key={refKey.current++}></PokedexPreview>
                ))}
            </div>
            <NavigationMenu activePage='pokedex' connectionError={dbError}></NavigationMenu>
        </>
    );
}
