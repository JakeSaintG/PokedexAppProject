import { Link } from 'react-router-dom';
import styles from './ConnectionWarning.module.css';

export function ConnectionWarning() {

    return (
        <div className={styles.con_warn}>
            <p>Warning!</p>
            <span>This POC app seems to have lost stored data. Please return to <Link to='../'>start</Link> or reload data in settings.</span>
        </div>
    );
}
