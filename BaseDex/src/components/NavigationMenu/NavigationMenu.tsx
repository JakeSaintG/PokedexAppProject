import styles from './NavigationMenu.module.css';

// svgs below are courtesy of font awesome (free)
// downloading the svgs directly is likely safer and decreases the number of packages needed
import listUlSolid from "../../assets/list-ul-solid.svg";
import gearSolid from "../../assets/gear-solid.svg";
import grassSolid from "../../assets/grass.svg";
import userSolid from "../../assets/user-solid.svg";
import houseSolid from "../../assets/house-solid.svg";

export function NavigationMenu() {
    return (
        <nav className={styles.nav_menu}>
            <ul role="menubar">
                <li role="menuitem">
                    <img src={userSolid} alt="user icon for profile" className={styles.nav_img} height='35'/>
                </li>
                <li role="menuitem">
                    <img src={grassSolid} alt="grass icon for collecting pokemon" className={styles.nav_img} height='35'/>
                </li>
                <li className={styles.home_button} role="menuitem">
                    <img src={houseSolid} alt="house icon for returning to home page" className={styles.nav_img} height='35'/>
                </li>
                <li role="menuitem">
                    <img src={listUlSolid} alt="list icon for pokedex list view" className={styles.nav_img} height='35'/>
                </li>
                <li role="menuitem">
                    <img src={gearSolid} alt="gear icon for settings" className={styles.nav_img} height='35'/>
                </li>
            </ul>
        </nav>
    );
}
