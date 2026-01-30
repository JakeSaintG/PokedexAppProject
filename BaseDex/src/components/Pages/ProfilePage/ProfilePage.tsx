import styles from './ProfilePage.module.css';
import { DexHeader, NavigationMenu } from "../../PageElements";
import { useEffect, useState } from 'react';
import { connectionCheck } from '../../../repositories/configurationRepository';
import { usePGlite } from '@electric-sql/pglite-react';

const tempProfileImg = 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png';
const tempImgDsc = 'img description';

export function ProfilePage( ) {
    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
    },[]);
    
    return (
        <>
            <DexHeader title='Profile'/>
                <div className={styles.profile}>
                    <img src={tempProfileImg} alt={`User profile img of ${tempImgDsc}`} />
                    <h3>Name</h3>
                    <p className={styles.profile_bio}>Editable blurb about the user</p>
                </div>
            <NavigationMenu activePage='profile' connectionError={dbError}></NavigationMenu>
        </>
    );
}
