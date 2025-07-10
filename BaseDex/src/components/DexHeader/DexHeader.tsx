import styles from './DexHeader.module.css';
import dexHeaderSvg from "../../assets/combined_dexheader.svg";

export function DexHeader( ) {
    return (
        // TODO: break up the SVG into the header and the lights.
        // - Allow the header to scale width of the screen
        // - Keep the lights scaled to the height
        // - only allow lights to take up a fixed widith
        <div className={styles.dex_header}>
            <img src={dexHeaderSvg} alt="Pokedex header with lights" />
        </div>
    );
}
