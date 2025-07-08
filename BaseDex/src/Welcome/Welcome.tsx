import { DexHeader } from '../DexHeader';
import styles from './Welcome.module.css';

export function Welcome( ) {
    const foo = () => {
        console.log('Navigating...')
    }
    
    return (
        <div onClick={foo} className={styles.welcome}>
            <DexHeader></DexHeader>
            <div>
                <h2>
                    PokeDex
                </h2>
                <p>
                    Touch to begin!
                </p>
            </div>
        </div>
    );
}
