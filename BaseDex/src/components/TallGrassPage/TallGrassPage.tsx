import styles from './TallGrassPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function TallGrassPage( ) {
    return (
        <div className={styles.tall_grass}>
            <DexHeader></DexHeader>
            <p>tall grass</p>
            <NavigationMenu activePage='tall_grass'></NavigationMenu>
        </div>
    );
}
