import styles from './SettingsPage.module.css';
import { DexHeader, NavigationMenu } from "../../PageElements";
import { useNavigate } from 'react-router-dom';
import { connectionCheck, getSettings, restoreDefaultSettings, toggleTutorial, updateSettings } from '../../../repositories/configurationRepository';
import { useEffect, useState } from 'react';
import { usePGlite } from '@electric-sql/pglite-react';
import type { Settings } from '../../../types/settings';
import type { PGliteWithLive } from '@electric-sql/pglite/live';
import { DEBUGtogglePkmnRegistered } from '../../../repositories/pokemonRepository';

export function SettingsPage( ) {
    const navigate = useNavigate();
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);

    // TODO: I'm going to be getting settings a lot...should probably
    // look into react's ContextApi or Signals
    const [settings, setSettings] = useState({} as Settings);
    const [debugCounter, setDebugCounter] = useState(0);
    const [reloadEntry, setReloadEntry] = useState(0);

    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getSettings(dbContext).then((r: Settings) => setSettings(r));
    },[reloadEntry]);
    
    useEffect(() => {
        // Triggers desired effects if, for some reason, the counter is already 0;
        if (debugCounter > 5) setDebugCounter(1);
        if (debugCounter == -1) setDebugCounter(0);
        
        if (settings.last_updated_dts && (debugCounter == 5 || debugCounter == 0)) {
            console.log(`updating debug settings: debug ${!settings.debug_active}`);
            settings.debug_active = !settings.debug_active;
            updateSettings(dbContext, settings).then((s: Settings) => setSettings(s));
        }

    },[debugCounter]);

    const toggleAllPkmnRegister = async (dbContext: PGliteWithLive) => {
        DEBUGtogglePkmnRegistered(dbContext);
    }

    const displayDebugOptions = () => {
        if (settings.debug_active) {
            return <div className={styles.debug_options}>
                <h3>Debug</h3>
                <p>NOTE! These settings may take the fun out of the app. Use with caution.</p>
                <button onClick={() => setDebugCounter(-1)}>Hide Debug Settings</button>
                <button onClick={() => toggleAllPkmnRegister(dbContext)}>Toggle All Pokémon registered</button>
                <button onClick={() => console.log('not yet implemented')}>Show regional forms from Pokédex page(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Allow registery from dex page(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>export logs(wip)</button>
            </div>;
        }

        return <></>;
    }

    const restoreDefault = async (dbContext: PGliteWithLive) => {
        await restoreDefaultSettings(dbContext).then(() => setReloadEntry(1));
    }

    return (
        <>
            <DexHeader title='Settings'/>
            <div className={styles.settings_menu}>
                {/* TODO: These should be slider/checkboxes... */}
                <h3>Appearance</h3>
                {/* The reload data button needs to not be debug in the web based version */}
                <button onClick={() => navigate('../loading')}>Reload Data</button>
                <button onClick={() => toggleTutorial(dbContext, settings).then((s: Settings) => setSettings(s))}>
                    {settings.tutorial_active ? 'Hide tutorial' : 'Restore tutorial'}
                </button>
                <button onClick={() => console.log('not yet implemented')}>light mode(wip)</button>
                <button onClick={() => restoreDefault(dbContext)}>Restore default settings</button>
                {displayDebugOptions()}

                <p 
                    onClick={() => setDebugCounter(debugCounter + 1)} 
                    className={styles[`debug_${debugCounter}`]} 
                >
                    JakeSaintG
                </p>
            </div>
            <NavigationMenu activePage='settings' connectionError={dbError}></NavigationMenu>
        </>
    );
}
