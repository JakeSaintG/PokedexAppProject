import styles from './DexHeader.module.css';
import dexHeaderLeft from "../../assets/dexheader/dexheader_left.svg";

interface Props extends React.HTMLAttributes<HTMLElement>{
    title?: string
}

const displayTitle = (title: string | undefined) => {
    if (title) {
        return <h2 className={styles.page_title}>{title}</h2>
    }

    return <div className={styles.dex_header_white_space}></div>
}

export function DexHeader(props: Props) {
    return (
        <>
            {displayTitle(props.title)}
            <div className={styles.dex_header}>
                <img src={dexHeaderLeft} className={styles.dex_header_left} alt="Pokedex header with lights" />
            </div>
        </>
    );
}
