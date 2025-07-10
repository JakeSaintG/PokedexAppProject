import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoadingContentPage.module.css';

export function LoadingContentPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // const timeoutId = setTimeout(() => {
        //     navigate('../home');
        // }, 1000);

        // return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={styles.loading_page}>
            <p>Checking for data to load...</p>
        </div>
    );
}
