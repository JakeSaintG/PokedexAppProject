import styles from './DexHeader.module.css';
import dexHeaderLeft from "../../assets/dexheader/dexheader_left.svg";

export function DexHeader( ) {
    return (
        <div className={styles.dex_header}>
            <img src={dexHeaderLeft} className={styles.dex_header_left} alt="Pokedex header with lights" />
        </div>
    );
}
