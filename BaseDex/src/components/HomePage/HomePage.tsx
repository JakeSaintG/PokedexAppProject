import styles from './HomePage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function HomePage( ) {
    return (
        <div className={styles.home}>
            <DexHeader></DexHeader>
            <p>HOME</p>
            <NavigationMenu activePage='home'></NavigationMenu>
        </div>
    );
}
