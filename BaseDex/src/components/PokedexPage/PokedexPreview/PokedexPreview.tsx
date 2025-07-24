import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import styles from './PokedexPreview.module.css';

interface Props extends React.HTMLAttributes<HTMLElement>{
    previewData: PokedexPreviewData
}

export function PokedexPreview(props: Props) {
    return (
        <div className={styles.pokedex_preview}>
            {props.previewData.name}
        </div>
    );
}
