import styles from './PokedexPage.module.css';
import { DexHeader, NavigationMenu } from "../../PageElements";
import { PokedexPreview } from './PokedexPreview';
import type { PokedexPreviewData } from '../../../types/pokdexPreviewData';
import { usePGlite } from "@electric-sql/pglite-react";
import { useEffect, useState } from 'react';
import { getPokedexPageData } from '../../../repositories/pokemonRepository';
import { connectionCheck } from '../../../repositories/configurationRepository';

export function PokedexPage( ) {
    const dexTile: PokedexPreviewData[] = [];
    let key = 0;

    const dbContext = usePGlite();
    const [dbError, setDbError] = useState(false);
    const [pokedexPreviewData, setPokedexPreviewData] = useState(dexTile);
    
    // todo: finish gradient on preview; data is here now
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getPokedexPageData(dbContext).then(d => setPokedexPreviewData(d));
    }, []);
    
    return (
        <>
            <DexHeader title='Pokédex'/>
            <div className={styles.dex_previews}>
                {pokedexPreviewData.map((pkmn) => (
                        <PokedexPreview previewData={pkmn} key={key++}></PokedexPreview>
                ))}
            </div>
            <NavigationMenu activePage='pokedex' connectionError={dbError}></NavigationMenu>
        </>
    );
}
