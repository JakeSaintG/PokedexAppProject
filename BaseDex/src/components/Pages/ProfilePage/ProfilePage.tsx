import styles from './ProfilePage.module.css';
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { useEffect, useState } from 'react';
import { connectionCheck } from '../../../repositories/configurationRepository';
import { usePGlite } from '@electric-sql/pglite-react';

export function ProfilePage( ) {
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
    },[]);
    
    return (
        <div className={styles.profile}>
            <DexHeader/>
            <p className={styles.placeholder}>PROFILE</p>
            <NavigationMenu activePage='profile' connectionError={dbError}></NavigationMenu>
        </div>
    );
}
