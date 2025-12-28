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
                <button onClick={() => navigate('../loading')}>Reload Data</button>
                <button onClick={() => console.log('not yet implemented')}>light mode(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                <button onClick={() => console.log('not yet implemented')}>Allow registery from dex page(wip)</button>
            </div>
            <NavigationMenu activePage='settings' connectionError={dbError}></NavigationMenu>
        </>
    );
}
