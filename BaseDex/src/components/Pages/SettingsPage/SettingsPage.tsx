import styles from './SettingsPage.module.css';
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useNavigate } from 'react-router-dom';
import { connectionCheck, getSettings, restoreDefaultSettings, toggleTutorial, updateSettings } from '../../../repositories/configurationRepository';
import { useEffect, useState } from 'react';
import { usePGlite } from '@electric-sql/pglite-react';
import type { Settings } from '../../../types/settings';
import type { PGliteWithLive } from '@electric-sql/pglite/live';

export function SettingsPage( ) {
    const navigate = useNavigate();
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);

    const [settings, setSettings] = useState({} as Settings);
    const [debugCounter, setDebugCounter] = useState(0);

    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getSettings(dbContext).then((r: Settings) => setSettings(r));
    },[]);

    useEffect(() => {
        // Triggers desired effects if, for some reason, the counter is already 0;
        if (debugCounter == -1) setDebugCounter(0); 
        
        if (settings.last_updated_dts && (debugCounter == 5 || debugCounter == 0)) {
            console.log(`updating debug settings: debug ${!settings.debug_active}`);
            settings.debug_active = !settings.debug_active;
            updateSettings(dbContext, settings).then((s: Settings) => setSettings(s));
        }

        if (debugCounter > 5) setDebugCounter(5);
    },[debugCounter]);

    const displayDebugOptions = () => {
        if (settings.debug_active) {
            return <div className={styles.debug_options}>
                <h3>Debug</h3>
                <button onClick={() => setDebugCounter(-1)}>Hide Debug Settings(wip)</button>
                <button onClick={() => navigate('../loading')}>Reload Data</button>
                <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>load all dex data(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Allow registery from dex page(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>export logs(wip)</button>
            </div>;
        }

        return <></>;
    }

    const setDefault = (dbContext: PGliteWithLive) => {
        restoreDefaultSettings(dbContext);
        setDebugCounter(-1);
    }

    return (
        <>
            <DexHeader title='Settings'/>
            <div className={styles.settings_menu}>
                {/* Screw it...these should be slider/checkboxes... */}
                <h3>Appearance</h3>
                <button onClick={() => console.log('not yet implemented')}>light mode(wip)</button>
                <button onClick={() => toggleTutorial(dbContext)}>Restore Tutorial</button>
                <button onClick={() => setDefault(dbContext)}>Restore default settings</button>

                {/* TODO: Warn that this may take some of the fun out of the app */}
                {displayDebugOptions()}

                <p 
                    onClick={() => setDebugCounter(debugCounter + 1)} 
                    className={`debug_${debugCounter}`} 
                >
                    JakeSaintG
                </p>
            </div>
            <NavigationMenu activePage='settings' connectionError={dbError}></NavigationMenu>
        </>
    );
}
