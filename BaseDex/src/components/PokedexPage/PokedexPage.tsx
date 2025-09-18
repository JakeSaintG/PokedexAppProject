import styles from './PokedexPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";
import { PokedexPreview } from './PokedexPreview';
import type { PokedexPreviewData } from '../../types/pokdexPreviewData';
import { usePGlite } from "@electric-sql/pglite-react";
import { useEffect, useState } from 'react';
import { getPokedexPageData } from '../../repositories/pokemonRepository';

export function PokedexPage( ) {
    const dbContext = usePGlite();

    const dexTile: PokedexPreviewData[] = [];
    const [pokedexPreviewData, setPokedexPreviewData] = useState(dexTile);
    
    let key = 0;
    
    useEffect(() => {
        getPokedexPageData(dbContext).then(d => setPokedexPreviewData(d));
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
