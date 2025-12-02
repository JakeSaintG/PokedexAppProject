import styles from "./EntryPage.module.css";
import { DexHeader } from "../../DexHeader";
import { usePGlite } from "@electric-sql/pglite-react";
import { NavigationMenu } from "../../NavigationMenu";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEntryPageData } from "../../../repositories/pokemonRepository";
import type { PokedexEntryData } from "../../../types/pokedexEntryData";

// const test_data: any = {};

export function EntryPage() {
    const dbContext = usePGlite();

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id")!;

    const placeholderEntry: PokedexEntryData = {
        id: 0,
        name: "",
        dex_no: 0,
        habitat: "",
        has_gender_differences: false,
        generation: "",
        is_default: false,
        type_1: "",
        type_2: "",
        has_forms: false,
        male_sprite_url: 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png',
        female_sprite_url: null,
        is_registered: false,
    }

    const [pokedexEntryData, setPokedexEntryData] = useState(placeholderEntry);

    useEffect(() => {
        getEntryPageData(dbContext, id).then((d: PokedexEntryData) => setPokedexEntryData(d))
    }, []);

    const parsePkmnName = (name: string) => {
        //TODO: special names list like Mr. Mime

        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    const parseFemaleImg = () => {
        if (pokedexEntryData.female_sprite_url !== null) {
            return <img src={pokedexEntryData.female_sprite_url} alt={`Image of female variant for ${pokedexEntryData.name}`} />
        } else {
            return <></>
        }
    }

    return (
        /*
            Need to think of a way to return back to main dex page. Maybe have a <section id=`{$id}`>
            in each link with the ID in it. Then, when clicking the back, the ID is passed back to
            the pokedex page with the section id so that it is scrolled to roughly where they left off.
        */

        <div className={styles.entry}>
            <DexHeader/>
            <div className={styles.entry_display}>
                {/* TODO: allow this to force a dex registery if it is on in the settings */}

                <h2>{parsePkmnName(pokedexEntryData.name)}</h2>
                <img src={pokedexEntryData.male_sprite_url} alt={`Default Image of ${pokedexEntryData.name}`} />
                {parseFemaleImg()}
                <button>Register</button>
                <p>{id}</p>
                <Link className={styles.back} to={`../pokedex#${id}`}>
                    back
                </Link>
            </div>
            {/* TODO: back button instead */}
            <NavigationMenu activePage='entry'></NavigationMenu>
        </div>
    );
}
