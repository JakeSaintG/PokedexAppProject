import styles from './SettingsPage.module.css';
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useNavigate } from 'react-router-dom';
import { connectionCheck, getSettings } from '../../../repositories/configurationRepository';
import { useEffect, useState } from 'react';
import { usePGlite } from '@electric-sql/pglite-react';

export function SettingsPage( ) {
    const navigate = useNavigate();
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    
    const [settings, setSettings] = useState('');

    const [debugActivation, setDebugActivation] = useState(false);
    const [debugCounter, setDebugCounter] = useState(0);
    const [debugClass, setDebugClass] = useState('debug_zero');

    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));

        getSettings(dbContext);
    },[]);
    
    useEffect(() => {
        if (debugCounter == 1) setDebugClass('debug_one');
        if (debugCounter == 2) setDebugClass('debug_two');
        if (debugCounter == 3) setDebugClass('debug_three');
        if (debugCounter == 4) setDebugClass('debug_four');
        if (debugCounter == 5) {
            setDebugActivation(true);
            setDebugClass('debug_five');
        }
        if (debugCounter > 5) setDebugCounter(5);
    },[debugCounter]);

    const displayDebugOptions = () => {
        // TODO: pivot to db call
        if (debugActivation) {
            return <div className={styles.debug_options}>
                <h3>Debug</h3>
                <button onClick={() => navigate('../loading')}>Reload Data</button>
                <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>load all dex data(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Allow registery from dex page(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>export logs(wip)</button>
            </div>
        }

        return <></>
    }

    return (
        <>
            <DexHeader title='Settings'/>
            <div className={styles.settings_menu}>
                <h3>Appearance</h3>
                <button onClick={() => console.log('not yet implemented')}>light mode(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Bring tutorial back(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Restore default settings(wip)</button>

                {/* TODO: Warn that this may take some of the fun out of the app */}
                {displayDebugOptions()}

                <p onClick={() => setDebugCounter(debugCounter + 1)} className={styles[debugClass]} >JakeSaintG</p>
            </div>
            <NavigationMenu activePage='settings' connectionError={dbError}></NavigationMenu>
        </>
    );
}
