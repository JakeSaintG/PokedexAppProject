import styles from './SettingsPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function SettingsPage( ) {
    // TODO: set verbose logging
    // TODO: view logs or dump to file
    
    return (
        <div className={styles.settings}>
            <DexHeader/>
            <p>SETTINGS</p>
            <NavigationMenu activePage='settings'></NavigationMenu>
        </div>
    );
}
