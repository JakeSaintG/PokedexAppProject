import styles from './NavigationMenu.module.css';

// svgs below are courtesy of font awesome (free)
// downloading the svgs directly is likely safer and decreases the number of packages needed
import listUlSolid from "../../assets/icons/list-ul-solid.svg";
import gearSolid from "../../assets/icons/gear-solid.svg";
import grassSolid from "../../assets/icons/grass.svg";
import userSolid from "../../assets/icons/user-solid.svg";
import houseSolid from "../../assets/icons/house-solid.svg";
import backArrow from "../../assets/icons/arrow-left-solid-full.svg";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ConnectionError } from './ConnectionWarning';

interface Props extends React.HTMLAttributes<HTMLElement>{
    activePage: string,
    connectionError: boolean,
    backButtonOverride?: string,
    backButtonLink?: string
}

export function NavigationMenu(props: Props) {
    // TODO: Indicate on the nav which page is loaded.
    // Passing in a prop for page and parsing it will probably do the trick
    
    const [activeLink, setActiveLink] = useState(`home`);
    
    useEffect(() => {
        setActiveLink(props.activePage)
    }, [])

    //TODO: WIP
    const showActiveNavLink = (active: string) => activeLink == active ? styles.active : styles.inactive;


    const backButton = (backButtonLink: string) => {
        return <Link className={styles.nav_link} to={backButtonLink}>
            <img src={backArrow} alt="arrow icon for returning to previous page" className={styles.back_img}/>
        </Link>
    }

    const navButton = (
        buttonName: string,
        buttonLink: string,
        buttonImg: string,
        buttonAltTxt: string,
        backOverride: string | undefined,
        backButtonLink: string | undefined
    ) => {
        if (backOverride != undefined && backButtonLink != undefined && backOverride.includes(buttonName)) return backButton(backButtonLink);

        return <Link className={`${styles.nav_link} ${showActiveNavLink(buttonName)}`} to={buttonLink}>
            <img src={buttonImg} alt={buttonAltTxt} className={styles.nav_img} height='38'/>
        </Link>
    }

    return (
        <>
            <ConnectionError noConnection={props.connectionError}></ConnectionError>
            <nav className={styles.nav_menu}>
                <ul role="menubar">
                    <li role="menuitem">
                        {navButton(
                            'profile',
                            '../profile',
                            userSolid,
                            'User image to go to profile page',
                            props.backButtonOverride,
                            props.backButtonLink
                        )}
                    </li>
                    <li role="menuitem">
                        {navButton(
                            'tall_grass',
                            '../tall_grass',
                            grassSolid,
                            'Tall grass icon to catch Pokemon',
                            props.backButtonOverride,
                            props.backButtonLink
                        )}
                    </li>
                    <li className={styles.home_button} role="menuitem">
                        <Link className={`${styles.nav_link} ${showActiveNavLink('home')}`} to={'../home'}>
                            <img src={houseSolid} alt="house icon for returning to home page" className={styles.nav_img} height='38'/>
                        </Link>
                    </li>
                    <li role="menuitem">
                        {navButton(
                            'pokedex',
                            '../pokedex',
                            listUlSolid,
                            'List icon to view registered Pokemon',
                            props.backButtonOverride,
                            props.backButtonLink
                        )}
                    </li>
                    <li role="menuitem">
                        {navButton(
                            'settings',
                            '../settings',
                            gearSolid,
                            'Gear icon to navigate to settings',
                            props.backButtonOverride,
                            props.backButtonLink
                        )}
                    </li>
                </ul>
            </nav>
        </>
    );
}
