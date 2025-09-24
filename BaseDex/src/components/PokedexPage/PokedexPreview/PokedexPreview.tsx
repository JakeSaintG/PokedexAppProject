import { useEffect, useState } from 'react';
import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import styles from './PokedexPreview.module.css';
import { Link } from 'react-router-dom';

interface Props extends React.HTMLAttributes<HTMLElement>{
    previewData: PokedexPreviewData
}

export function PokedexPreview(props: Props) {

    const [imageSrc, setImageSrc] = useState('https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png');
    
    useEffect(() => {
        const url = URL.createObjectURL(props.previewData.img_data);
        setImageSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [])
    
    return (
        <Link className={styles.pokedex_preview} to={`/pokedex/entry?id=${props.previewData.id}`}>
            <div id={`${props.previewData.id}`}>
                <p>{props.previewData.dex_no} </p>
                <img src={imageSrc} alt={`Image of ${props.previewData.name}`} />
                <p>{props.previewData.name} </p>
            </div>
        </Link>
    );
}
