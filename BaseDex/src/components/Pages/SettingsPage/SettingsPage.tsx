import styles from './SettingsPage.module.css';
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useNavigate } from 'react-router-dom';
import { connectionCheck } from '../../../repositories/configurationRepository';
import { useEffect, useState } from 'react';
import { usePGlite } from '@electric-sql/pglite-react';

export function SettingsPage( ) {
    const navigate = useNavigate();
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
    },[]);

    // TODO: set verbose logging
    // TODO: view logs or dump to file
    // TODO: Make this look a little better
    
    return (
        <>
            <DexHeader title='Settings'/>
            <div className={styles.settings_menu}>
                <h3>Appearance</h3>
                <button onClick={() => console.log('not yet implemented')}>light mode(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>other(wip)</button>
                <h3>Debug</h3>
                {/* Warn that this may take some of the fun out of the app */}
                <button onClick={() => console.log('not yet implemented')}>activate debug options(wip)</button>
                <button onClick={() => navigate('../loading')}>Reload Data</button>
                <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>load all dex data(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Allow registery from dex page(wip)</button>
            </div>
            <NavigationMenu activePage='settings' connectionError={dbError}></NavigationMenu>
        </>
    );
}
