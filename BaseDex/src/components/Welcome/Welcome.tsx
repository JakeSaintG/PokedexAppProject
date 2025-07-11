import { DexHeader } from '../DexHeader';
import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';

export function Welcome() {
    const navigate = useNavigate();
    const loadData = () => navigate('loading');

    return (
        <div onClick={loadData} className={styles.welcome}>
            <DexHeader></DexHeader>
            <div>
                <h2>PokeDex</h2>
                <p>Touch to begin!</p>
            </div>
        </div>
    );
}
