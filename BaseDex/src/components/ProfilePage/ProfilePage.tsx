import styles from './ProfilePage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function ProfilePage( ) {
    return (
        <div className={styles.profile}>
            <DexHeader/>
            <p>PROFILE</p>
            <NavigationMenu activePage='profile'></NavigationMenu>
        </div>
    );
}
