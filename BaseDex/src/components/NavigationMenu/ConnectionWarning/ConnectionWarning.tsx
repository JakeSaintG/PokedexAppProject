import { Link } from 'react-router-dom';
import styles from './ConnectionWarning.module.css';

interface Props extends React.HTMLAttributes<HTMLElement>{
    noConnection: boolean,
}

export function ConnectionWarning(props: Props) {
    if (props.noConnection) {
        console.log(props.noConnection)

        return (
            <div className={styles.con_warn}>
                <p>Warning!</p>
                <p>This POC app seems to have lost stored data. Please return to <Link to='../'>start</Link> or reload data in settings.</p>
            </div>
        )
    }
}
