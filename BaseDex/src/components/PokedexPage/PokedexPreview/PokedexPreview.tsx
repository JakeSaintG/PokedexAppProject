import { useEffect, useState } from 'react';
import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import styles from './PokedexPreview.module.css';
import { Link } from 'react-router-dom';

interface Props extends React.HTMLAttributes<HTMLElement>{
    previewData: PokedexPreviewData
}

export function PokedexPreview(props: Props) {

    const [imageSrc, setImageSrc] = useState('https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png');
    const [registered, setRegistered] = useState('not_registered');
    
    // TODO: Use the stored blobs instead of the URL....................
    useEffect(() => {
        // const url = URL.createObjectURL(props.previewData.img_data);
        // setImageSrc(url);
        // return () => URL.revokeObjectURL(url);

        setImageSrc(props.previewData.img_url);
        setRegistered(() => props.previewData.is_registered ? 'registered' : 'not_registered');
    }, [])

    const capitalizeWords = (str: string) => {
        return str
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <Link className={styles.pokedex_preview} to={`/pokedex/entry?id=${props.previewData.id}`}>
            <img src={imageSrc} alt={`Image of ${props.previewData.name}`} className={styles[`${registered}`]}/>
            <span className={styles.preview_name}>{props.previewData.dex_no}. {capitalizeWords(props.previewData.name)}</span>
        </Link>
    );
}
