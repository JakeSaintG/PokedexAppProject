import styles from './SettingsPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function SettingsPage( ) {
    return (
        <div className={styles.settings}>
            <DexHeader/>
            <p>SETTINGS</p>
            <NavigationMenu activePage='settings'></NavigationMenu>
        </div>
    );
}
