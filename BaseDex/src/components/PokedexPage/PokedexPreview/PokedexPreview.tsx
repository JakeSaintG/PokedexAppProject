import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import missingNo from '../../../assets/MISSINGNO.webp'
import styles from './PokedexPreview.module.css';
import { Link } from 'react-router-dom';

interface Props extends React.HTMLAttributes<HTMLElement>{
    previewData: PokedexPreviewData
}

export function PokedexPreview(props: Props) {
    return (
        <Link className={styles.pokedex_preview} to={`/pokedex/entry?id=${props.previewData.id}`}>
            <section id={`${props.previewData.id}`}>
                <p>{props.previewData.dex_no} </p>
                <img src={missingNo} alt="placeholder dex image" />
                <p>{props.previewData.name} </p>
            </section>
        </Link>
    );
}
