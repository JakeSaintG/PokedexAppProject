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
import { connectionCheck } from "../../../../repositories/configurationRepository";


// TODO: next up, need to work though defaults and ensuring ??? when not registered
export function EntryPage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id")!;
    const dbContext = usePGlite();

    const placeholderEntry: PokedexEntryData = {
        id: 0,
        name: "MissingNo",
        dex_no: 0,
        habitat: "UNIDENTIFIABLE",
        has_gender_differences: false,
        generation: "i",
        genera: "UNIDENTIFIABLE",
        is_default: false,
        type_1: "Ň̷̨ȕ̷͕l̷͇̑l̸̠̏",
        height: -1,
        weight: -1,
        has_forms: false,
        male_sprite_url: 'https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png',
        female_sprite_url: null,
        is_registered: true,
    }

    const [pokedexEntryData, setPokedexEntryData] = useState(placeholderEntry);
    const [dexImg, setDexImg] = useState(placeholderEntry.male_sprite_url);
    const [registered, setRegistered] = useState('not_registered');
    const [previewName, setPreviewName] = useState('not_registered');
    const [reloadEntry, setReloadEntry] = useState(0);
    const [dbError, setDbError] = useState(false);
    
    useEffect(() => {
        connectionCheck(dbContext).then((d: boolean) => setDbError(d));
        getEntryPageData(dbContext, id).then((d: PokedexEntryData) => setPokedexEntryData(d))
    }, [reloadEntry]);

    useEffect(() => {
        setRegistered(() => pokedexEntryData.is_registered ? 'registered' : 'not_registered');
        setPreviewName(() => pokedexEntryData.is_registered ? displayPkmnName(pokedexEntryData.name) : '???');
        setDexImg(pokedexEntryData.male_sprite_url);
    }, [pokedexEntryData])

    const displayRegisterBtn = (context: PGliteWithLive, id: number) => {
        if (pokedexEntryData.is_registered) return <></>;

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

    const displayPrimaryType = (type_1: string) => {
        if (type_1 != 'Ň̷̨ȕ̷͕l̷͇̑l̸̠̏' && type_1 != '???') {
            return {
                // backgroundColor: `var(--${pokedexEntryData.type_1})`

                background: `linear-gradient(0deg, var(--${pokedexEntryData.type_1}) 0%, var(--${pokedexEntryData.type_2}) 100%)`
            } as React.CSSProperties;
        }
        return {backgroundColor: `rgba(29, 29, 29, 1)`, color: `white`} as React.CSSProperties;
    }

    const displaySecondType = (type_2: string | undefined) => (type_2 != undefined) ? <p style={{backgroundColor: `var(--${type_2})`}}>{type_2}</p> : <></>;

    const displayMeasurement = (measurement: number): string => {
        if (measurement == -1) return '???';

        return (measurement / 10).toString();
    }

    return (
        <>
            <DexHeader remove_white_space={true}/>
            <div className={styles.entry_display}>
                <div className={`${styles.banner}`} style={displayPrimaryType(pokedexEntryData.type_1)}>
                    <p className={styles.dex_no}>No. {id}</p>
                    <img src={dexImg} alt={`Default Image of ${pokedexEntryData.name}`} className={`${styles[`${registered}`]} ${styles.dex_img}`}/>
                    <p className={styles.dex_name}>{previewName}</p>
                    <p className={styles.dex_description}>The {pokedexEntryData.genera}</p>
                    <div className={styles.change_form}>
                        {displayFormChangeButton(pokedexEntryData)}
                    </div>
                </div>
                <div className={styles.types}>
                    <p style={displayPrimaryType(pokedexEntryData.type_1)}>{pokedexEntryData.type_1}</p>
                    {displaySecondType(pokedexEntryData.type_2)}
                </div>
                <div className={styles.dex_details}>
                    <div className={styles.dex_details_group}>
                        <p>Height</p>
                        <p>{displayMeasurement(pokedexEntryData.height)} meters</p> 
                    </div>
                    <div className={styles.dex_details_group}>
                        <p>Weight</p>
                        <p>{displayMeasurement(pokedexEntryData.weight)} kg</p> 
                    </div>
                </div>
                {/* TODO: move this register button somewhere...also only show it if debug is on */}
                {displayRegisterBtn(dbContext, pokedexEntryData.id)} 
            </div>
            <NavigationMenu activePage='entry' backButtonOverride="pokedex" backButtonLink={-1} connectionError={dbError}></NavigationMenu>
        </>
    );
}
