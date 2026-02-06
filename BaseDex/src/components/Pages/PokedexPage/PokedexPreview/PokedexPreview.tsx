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
    
    // TODO: Use the stored blobs instead of the URL..
    useEffect(() => {
        const url = URL.createObjectURL(props.previewData.img_data);
        setImageSrc(url);
        
        // setImageSrc(props.previewData.img_url);
        
        setRegistered(() => props.previewData.is_registered ? 'registered' : 'not_registered');
        setPreviewName(() => props.previewData.is_registered ? props.previewData.name : '???');
        return () => URL.revokeObjectURL(url);
    }, [])

    const displayPreviewBackground = (previewData: PokedexPreviewData) => {
        if (previewData.is_registered && previewData.primary_type != 'none') {
            // I don't love these nested ifs but I think I'd rather not
            // have the browser draw the gradient if it doesn't have to.
            if (previewData.secondary_type == undefined) {
                return {background: `var(--${previewData.primary_type})`} as React.CSSProperties;
            }
            
            return {
                background: `
                    linear-gradient(
                        180deg, 
                        var(--${previewData.primary_type}) 10%,
                        var(--${previewData.primary_type}) 45%,
                        var(--${previewData.secondary_type}) 65%
                    )
                `
            } as React.CSSProperties;
        } else if (previewData.primary_type == 'none') {
            return {backgroundColor: `rgba(29, 29, 29, 1)`, color: `white`} as React.CSSProperties;
        }
    }

    return (
        <section>
            <Link className={`${styles.pokedex_preview} ${styles[`${registered}`]}`} style={displayPreviewBackground(props.previewData)} to={`/pokedex/entry?id=${props.previewData.id}`}>
                <img src={imageSrc} alt={`Image of ${props.previewData.name}`}/>
                <span className={styles.preview_name}>{props.previewData.dex_no}. {displayPkmnName(previewName)}</span>
            </Link>
        </section>
    );
}

