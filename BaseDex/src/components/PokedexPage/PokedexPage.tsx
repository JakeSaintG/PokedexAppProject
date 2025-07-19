import styles from './PokedexPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

export function PokedexPage( ) {
    return (
        <div className={styles.pokedex}>
            <DexHeader></DexHeader>
            <p>dex</p>
            <NavigationMenu activePage='pokedex'></NavigationMenu>
        </div>
    );
}
