import styles from './PokedexPage.module.css';
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { PokedexPreview } from './PokedexPreview';
import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import { usePGlite } from "@electric-sql/pglite-react";
import { useEffect, useState } from 'react';
import { getPokedexPageData } from '../../../repositories/pokemonRepository';

export function PokedexPage( ) {
    const dbContext = usePGlite();

    const dexTile: PokedexPreviewData[] = [

    ];

    const [pokedexPreviewData, setPokedexPreviewData] = useState(dexTile);
    
    let key = 0;
    
    useEffect(() => {
        try {
            getPokedexPageData(dbContext).then(d => setPokedexPreviewData(d));
            console.log('beep')
        } catch {
            // TODO: Need to hand this up as part of getPokedexPageData. try/catch seems to not be working
            setPokedexPreviewData([
                        {
                    name: 'MissingNo',
                    primary_type: 'none',
                    dex_no: 0,
                    id: 0,
                    img_url: 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png',
                    is_registered: true,
                }
            ])
        }
    }, []);
    
    return (
        <div className={styles.pokedex}>
            <DexHeader/>
            <div className={styles.dex_previews}>
                {pokedexPreviewData.map((pkmn) => (
                        <PokedexPreview previewData={pkmn} key={key++}></PokedexPreview>
                ))}
            </div>
            <NavigationMenu activePage='pokedex'></NavigationMenu>
        </div>
    );
}
