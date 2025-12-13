import { useEffect, useState } from 'react';
import type { PokedexPreviewData } from '../../../../types/pokdexPreviewData';
import styles from './PokedexPreview.module.css';
import { Link } from 'react-router-dom';
import { displayPkmnName } from '../../../../repositories/pokemonRepository';

interface Props extends React.HTMLAttributes<HTMLElement>{
    previewData: PokedexPreviewData
}

export function PokedexPreview(props: Props) {

    const [imageSrc, setImageSrc] = useState('https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png');
    const [registered, setRegistered] = useState('not_registered');
    const [previewName, setPreviewName] = useState('not_registered');
    
    // TODO: Use the stored blobs instead of the URL....................
    useEffect(() => {
        // const url = URL.createObjectURL(props.previewData.img_data);
        // setImageSrc(url);
        // return () => URL.revokeObjectURL(url);

        setImageSrc(props.previewData.img_url);
        setRegistered(() => props.previewData.is_registered ? 'registered' : 'not_registered');
        setPreviewName(() => props.previewData.is_registered ? props.previewData.name : '???');
    }, [])

    let style: React.CSSProperties;

    if (props.previewData.is_registered) {
        style = {backgroundColor: `var(--${props.previewData.primary_type})`} as React.CSSProperties;
    } else {
        style = {} as React.CSSProperties;
    }

    return (
        <section>

        <Link className={`${styles.pokedex_preview} ${styles[`${registered}`]}`} style={style} to={`/pokedex/entry?id=${props.previewData.id}`}>
            <img src={imageSrc} alt={`Image of ${props.previewData.name}`}/>
            <span className={styles.preview_name}>{props.previewData.dex_no}. {displayPkmnName(previewName)}</span>
        </Link>
        </section>
    );
}

