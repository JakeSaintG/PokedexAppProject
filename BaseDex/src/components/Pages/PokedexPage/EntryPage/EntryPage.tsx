import styles from "./EntryPage.module.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePGlite } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { DexHeader } from "../../../DexHeader";
import { NavigationMenu } from "../../../NavigationMenu";
import swapArrow from "../../../../assets/icons/arrows-rotate-solid-full.svg";
import { displayPkmnName, getEntryPageData, registerPokemon } from "../../../../repositories/pokemonRepository";
import type { PokedexEntryData } from "../../../../types/pokedexEntryData";

export function EntryPage() {
    const missingNoImg = 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png';
    
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
        male_sprite_url: missingNoImg,
        female_sprite_url: null,
        is_registered: false,
    }

    const [pokedexEntryData, setPokedexEntryData] = useState(placeholderEntry);
    const [dexImg, setDexImg] = useState(missingNoImg);
    const [registered, setRegistered] = useState('not_registered');
    const [previewName, setPreviewName] = useState('not_registered');
    const [reloadEntry, setReloadEntry] = useState(0);

    useEffect(() => {
        getEntryPageData(dbContext, id).then((d: PokedexEntryData) => setPokedexEntryData(d))
    }, [reloadEntry]);

    useEffect(() => {
        setRegistered(() => pokedexEntryData.is_registered ? 'registered' : 'not_registered');
        setPreviewName(() => pokedexEntryData.is_registered ? displayPkmnName(pokedexEntryData.name) : '???');
        setDexImg(pokedexEntryData.male_sprite_url);
    }, [pokedexEntryData])

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

    const displayFormChangeButton = (pokedexEntryData: PokedexEntryData) => {
        if (pokedexEntryData.has_gender_differences && pokedexEntryData.female_sprite_url && pokedexEntryData.is_registered) {
            let url: string;

            if (dexImg == pokedexEntryData.male_sprite_url) {
                url = pokedexEntryData.female_sprite_url
            } else {
                url = pokedexEntryData.male_sprite_url
            }

            return <button onClick={() => setDexImg(url)}>
                <img src={swapArrow} alt="circular arrow icon for swapping between gendered images" className={styles.back_img}/>
            </button>
        }

        return <></>
    }

    const style = { backgroundColor: `var(--${pokedexEntryData.type_1})`} as React.CSSProperties;

    return (
        /*
            Need to think of a way to return back to main dex page. Maybe have a <section id=`{$id}`>
            in each link with the ID in it. Then, when clicking the back, the ID is passed back to
            the pokedex page with the section id so that it is scrolled to roughly where they left off.
        */

        <div className={styles.entry}>
            <DexHeader/>
            <div className={styles.entry_display}>
                <div className={`${styles.banner}`} style={style}>
                    <p className={styles.dex_no}>No #{id}</p>
                    <img src={dexImg} alt={`Default Image of ${pokedexEntryData.name}`} className={`${styles[`${registered}`]} ${styles.dex_img}`}/>
                    <p className={styles.dex_name}>{previewName}</p>
                    <div className={styles.change_form}>
                        {displayFormChangeButton(pokedexEntryData)}
                    </div>
                </div>
            </div>
            {displayRegisterBtn(dbContext, pokedexEntryData.id)}
            <NavigationMenu activePage='entry' backButtonOverride="pokedex" backButtonLink={`../pokedex#${id}`}></NavigationMenu>
        </div>
    );
}
