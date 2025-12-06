import styles from "./EntryPage.module.css";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePGlite } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import backArrow from "../../../assets/icons/arrow-left-solid-full.svg";
import { displayPkmnName, getEntryPageData, registerPokemon } from "../../../repositories/pokemonRepository";
import type { PokedexEntryData } from "../../../types/pokedexEntryData";


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
        has_forms: false,
        male_sprite_url: 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png',
        female_sprite_url: null,
        is_registered: false,
    }

    const [pokedexEntryData, setPokedexEntryData] = useState(placeholderEntry);
    const [registered, setRegistered] = useState('not_registered');
    const [previewName, setPreviewName] = useState('not_registered');
    const [reloadEntry, setReloadEntry] = useState(0);

    useEffect(() => {
        getEntryPageData(dbContext, id).then((d: PokedexEntryData) => setPokedexEntryData(d))
    }, [reloadEntry]);

    useEffect(() => {
        setRegistered(() => pokedexEntryData.is_registered ? 'registered' : 'not_registered');
        setPreviewName(() => pokedexEntryData.is_registered ? displayPkmnName(pokedexEntryData.name) : '???');
    }, [pokedexEntryData])

    const parseFemaleImg = () => {
        if (pokedexEntryData.has_gender_differences && pokedexEntryData.female_sprite_url) {
            return <img src={pokedexEntryData.female_sprite_url} alt={`Image of female variant for ${pokedexEntryData.name}`} />
        }

        return <></>
    }

    const displayRegisterBtn = (context: PGliteWithLive, id: number) => {
        if (pokedexEntryData.is_registered) {
            return <></>;
        }

        return <button onClick={() => registerPkmn(context, id)} className={styles.register_button}>Register</button>;
    } 

    const registerPkmn = async (dbContext: PGliteWithLive, id: number) => {
        await registerPokemon(dbContext, id);
        setReloadEntry(1); 
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
                {displayRegisterBtn(dbContext, pokedexEntryData.id)}
                <Link className={styles.back} to={`../pokedex#${id}`}>
                    <img src={backArrow} alt="arrow icon for returning to previous page" className={styles.back_img} height='38'/>
                </Link>
                <h2>{id}. {previewName}</h2>
                <img src={pokedexEntryData.male_sprite_url} alt={`Default Image of ${pokedexEntryData.name}`} className={styles[`${registered}`]}/>
                {parseFemaleImg()}
            </div>
            {/* TODO: back button instead */}
            <NavigationMenu activePage='entry'></NavigationMenu>
        </div>
    );
}
