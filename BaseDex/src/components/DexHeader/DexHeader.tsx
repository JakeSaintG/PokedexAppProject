import styles from './DexHeader.module.css';
import dexHeaderSvg from "../../assets/combined_dexheader.svg";

export function DexHeader( ) {
    return (
        // TODO: break up the SVG. split it out into 3 chunks. 
        // The left most would be from the end to passed the middle after the curve. 
        // The right most would be basically just the tip of the right end. 
        // Everything in between should connect the two and would stretch with
        // different screen sizes.
        <div className={styles.dex_header}>
            <img src={dexHeaderSvg} alt="Pokedex header with lights" />
        </div>
    );
}
