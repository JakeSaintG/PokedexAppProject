import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoadingContentPage.module.css';
import { DexHeader } from '../DexHeader';

export function LoadingContentPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            navigate('../home');
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <>
            <DexHeader></DexHeader>
            <div className={styles.loading_page}>
                <div className={styles.dex_display_frame}>
                    <div className={styles.dex_display_screen}>
                        <p>Checking for data to load...</p>
                    </div>
                </div>
            </div>
        </>
    );
}
