import styles from './PokedexPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";
import { PokedexPreview } from './PokedexPreview';
import type { PokedexPreviewData } from '../../types/pokdexPreviewData';

const test_data: PokedexPreviewData[] = [
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "bulbasaur",
        "dex_no": 1,
        "id": 1
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    },
    {
        "name": "pikachu",
        "dex_no": 25,
        "id": 25
    }
]

export function PokedexPage( ) {
    return (
        <div className={styles.pokedex}>
            <DexHeader></DexHeader>
            <div className={styles.dex_previews}>
                {test_data.map((pkmn) => (
                        <PokedexPreview previewData={pkmn}></PokedexPreview>
                ))}
            </div>
            <NavigationMenu activePage='pokedex'></NavigationMenu>
        </div>
    );
}
