import styles from './DexHeader.module.css';
import dexHeaderLeft from "../../../assets/dexheader/dexheader_left.svg";

interface Props extends React.HTMLAttributes<HTMLElement>{
    title?: string
    remove_white_space?: boolean
}

const displayTitle = (title: string | undefined, remove_white_space: boolean | undefined) => {
    if (title) {
        return <h2 className={styles.page_title}>{title}</h2>
    }

    if (!title && !remove_white_space) {
        return <div className={styles.dex_header_white_space}></div>
    }

    return <></>
}

export function DexHeader(props: Props) {
    return (
        <>
            {displayTitle(props.title, props.remove_white_space)}
            <div className={styles.dex_header}>
                <img src={dexHeaderLeft} className={styles.dex_header_left} alt="Pokedex header with lights" />
            </div>
        </>
    );
}
