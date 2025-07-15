import styles from './DexHeader.module.css';
import dexHeaderLeft from "../../assets/dexheader_left.svg";
import dexHeaderMiddle from "../../assets/dexheader_middle_fill.svg";
import dexHeaderRight from "../../assets/dexheader_right.svg";

export function DexHeader( ) {
    return (
        // TODO: break up the SVG. split it out into 3 chunks. 
        // The left most would be from the end to passed the middle after the curve. 
        // The right most would be basically just the tip of the right end. 
        // Everything in between should connect the two and would stretch with
        // different screen sizes.
        <div className={styles.dex_header}>
            {/* TODO: Wrap these three SVGs in a single alt text if possible */}
            {/* Or aria hide them...because they don't really serve a functional purpose */}
            <img src={dexHeaderLeft} className={styles.dex_left} alt="Pokedex header with lights" />
            <img src={dexHeaderMiddle} className={styles.dex_middle} alt="Pokedex header with lights" />
            <img src={dexHeaderRight} className={styles.dex_right} alt="Pokedex header with lights" />
        </div>
    );
}
