import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import missingNo from '../../../assets/MISSINGNO.webp'
import styles from './PokedexPreview.module.css';

interface Props extends React.HTMLAttributes<HTMLElement>{
    previewData: PokedexPreviewData
}

export function PokedexPreview(props: Props) {
    return (
        <div className={styles.pokedex_preview}>
            <p>{props.previewData.dex_no} </p>
            <img src={missingNo} alt="placeholder dex image" />
            <p>{props.previewData.name} </p>
        </div>
    );
}
