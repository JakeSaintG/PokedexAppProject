import styles from './NavigationMenu.module.css';

// svgs below are courtesy of font awesome (free)
// downloading the svgs directly is likely safer and decreases the number of packages needed
import listUlSolid from "../../assets/list-ul-solid.svg";
import gearSolid from "../../assets/gear-solid.svg";
import grassSolid from "../../assets/grass.svg";
import userSolid from "../../assets/user-solid.svg";
import houseSolid from "../../assets/house-solid.svg";
import { Link } from 'react-router-dom';

interface Props extends React.HTMLAttributes<HTMLElement>{
    activePage: string
}

export function NavigationMenu(props: Props) {

    // TODO: Indicate on the nav which page is loaded.
    // Passing in a prop for page and parsing it will probably do the trick
    console.log(`navigating to ${props.activePage}`);

    return (
        <nav className={styles.nav_menu}>
            <ul role="menubar">
                <li role="menuitem">
                    <Link className={styles.nav_link} to={'../profile'}>
                        <img src={userSolid} alt="user icon for profile" className={styles.nav_img} height='38'/>
                    </Link>
                </li>
                <li role="menuitem">
                    <Link className={styles.nav_link} to={'../tall_grass'}>
                        <img src={grassSolid} alt="grass icon for collecting pokemon" className={styles.nav_img} height='38'/>
                    </Link>
                </li>
                <li className={styles.home_button} role="menuitem">
                    <Link className={styles.nav_link} to={'../home'}>
                        <img src={houseSolid} alt="house icon for returning to home page" className={styles.nav_img} height='38'/>
                    </Link>
                </li>
                <li role="menuitem">
                    <Link className={styles.nav_link} to={'../pokedex'}>
                        <img src={listUlSolid} alt="list icon for pokedex list view" className={styles.nav_img} height='38'/>
                    </Link>
                </li>
                <li role="menuitem">
                    <Link className={styles.nav_link} to={'../'}>
                        <img src={gearSolid} alt="gear icon for settings" className={styles.nav_img} height='38'/>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
