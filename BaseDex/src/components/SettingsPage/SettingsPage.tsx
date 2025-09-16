import styles from './SettingsPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";
import { useNavigate } from 'react-router-dom';

export function SettingsPage( ) {
    const navigate = useNavigate();

    // TODO: set verbose logging
    // TODO: view logs or dump to file
    // TODO: Make this look a little better
    
    return (
        <div className={styles.settings}>
            <DexHeader/>
            <div className={styles.settings}>
                <h2>SETTINGS</h2>

                <div className={styles.settings_menu}>
                    <button onClick={() => navigate('../loading')}>Reload Data</button>
                    <button onClick={() => console.log('not yet implemented')}>light mode(wip)</button>
                    <button onClick={() => console.log('not yet implemented')}>verbose logging(wip)</button>
                </div>
            </div>
            <NavigationMenu activePage='settings'></NavigationMenu>
        </div>
    );
}
