import { Link } from 'react-router-dom';
import styles from './ConnectionError.module.css';

interface Props extends React.HTMLAttributes<HTMLElement>{
    noConnection: boolean,
}

export function ConnectionError(props: Props) {
    if (props.noConnection) {
        return (
            <div className={styles.con_warn}>
                <p>Warning!</p>
                <p>This POC app seems to have its lost stored data. Please return to<Link to='../'>start</Link>or reload data in settings.</p>
            </div>
        )
    }
}
