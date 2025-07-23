import styles from './PokedexPage.module.css';
import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

const test_data = [
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
    }
]

export function PokedexPage( ) {
    return (
        <div className={styles.pokedex}>
            <DexHeader></DexHeader>
            <div className={styles.dex_previews}>
                {test_data.map((pkmn) => (
                        <div>{pkmn.name}</div>
                    ))}
            </div>
            <NavigationMenu activePage='pokedex'></NavigationMenu>
        </div>
    );
}
