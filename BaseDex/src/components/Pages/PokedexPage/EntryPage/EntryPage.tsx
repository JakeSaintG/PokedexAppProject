import styles from "./EntryPage.module.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePGlite } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { DexHeader, NavigationMenu } from "../../../PageElements";
import { displayPkmnName, getEntryPageData, registerPokemon } from "../../../../repositories/pokemonRepository";
import type { PokedexEntryData } from "../../../../types/pokedexEntryData";
import { connectionCheck } from "../../../../repositories/configurationRepository";

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
        default_img_data: new Blob(['']), // TODO: no...not this way
        female_img_data: null,
        is_registered: true,
    }

    const [pokedexEntryData, setPokedexEntryData] = useState(placeholderEntry);
    const [dexDefaultImg, setDexDefaultImg] = useState('https://1.bp.blogspot.com/-d9W8PmlYaFQ/UiIiGoN043I/AAAAAAAAAK0/WFFm5tDQFjo/s1600/missingno.png');
    const [dexFemaleImg, setDexFemaleImg] = useState<string | null>(null);

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

        const defaultImgUrl = URL.createObjectURL(pokedexEntryData.default_img_data);
        setDexDefaultImg(defaultImgUrl);

        let femaleImgUrl: string;
        if (pokedexEntryData.has_gender_differences && pokedexEntryData.female_img_data !== null) {
            femaleImgUrl = URL.createObjectURL(pokedexEntryData.female_img_data);
            setDexFemaleImg(femaleImgUrl);
        }

        return () => { 
            URL.revokeObjectURL(defaultImgUrl);
            if (femaleImgUrl) URL.revokeObjectURL(femaleImgUrl);
        };
    }, [pokedexEntryData])

    const displayFemaleImg = () => {
        if (dexFemaleImg) {
            return <img src={dexFemaleImg} alt={`Image of female varient for ${pokedexEntryData.name}`} />
        }
        return <></>
    }

    const displayRegisterBtn = (context: PGliteWithLive, id: number) => {
        if (pokedexEntryData.is_registered) return <></>;
        return <button onClick={() => registerPkmn(context, id)} className={styles.register_button}>Register</button>;
    } 

    const registerPkmn = async (dbContext: PGliteWithLive, id: number) => {
        await registerPokemon(dbContext, id);
        setReloadEntry(1); 
    }   

    const displayTypeColor = (type_1: string, type_2?: string): React.CSSProperties => {
        if (type_1 != 'Ň̷̨ȕ̷͕l̷͇̑l̸̠̏' && type_1 != '???') {
            // I don't love these nested ifs but I think I'd rather not
            // have the browser draw the gradient if it doesn't have to.
            if (type_2 == undefined) {
                return {background: `var(--${type_1})`} as React.CSSProperties;
            }
            
            return {
                background: `
                    linear-gradient(
                        180deg, 
                        var(--${type_1}) 10%,
                        var(--${type_1}) 45%,
                        var(--${type_2}) 65%
                    )
                `
            } as React.CSSProperties;
        }

        return {backgroundColor: `rgba(29, 29, 29, 1)`, color: `white`} as React.CSSProperties;
    }

    const displaySecondaryType = (type_2?: string) => (type_2 != undefined) ? <p style={{backgroundColor: `var(--${type_2})`}}>{type_2}</p> : <></>;

    return (
        <>
            <DexHeader remove_white_space={true}/>
            <div className={styles.entry_display}>
                <div className={`${styles.banner}`} style={displayTypeColor(pokedexEntryData.type_1, pokedexEntryData.type_2)}>
                    <p className={styles.dex_no}>No. {id}</p>
                    <div className={`${styles[`${registered}`]} ${styles.dex_img}`}>
                        <img src={dexDefaultImg} alt={`Default Image of ${pokedexEntryData.name}`} />
                        {displayFemaleImg()}
                    </div>
                    <p className={styles.dex_name}>{previewName}</p>
                    <p className={styles.dex_description}>The {pokedexEntryData.genera}</p>
                </div>
                <div className={styles.types}>
                    <p style={displayTypeColor(pokedexEntryData.type_1)}>{pokedexEntryData.type_1}</p>
                    {displaySecondaryType(pokedexEntryData.type_2)}
                </div>
                <div className={styles.dex_details}>
                    <div className={styles.dex_details_group}>
                        <p>Height</p>
                        <p>{pokedexEntryData.height == -1 ? '???' : (pokedexEntryData.height / 10).toString()} meters</p> 
                    </div>
                    <div className={styles.dex_details_group}>
                        <p>Weight</p>
                        <p>{pokedexEntryData.weight == -1 ? '???' : (pokedexEntryData.weight / 10).toString()} kg</p> 
                    </div>
                </div>
                {/* TODO: only show it if debug is on */}
                {displayRegisterBtn(dbContext, pokedexEntryData.id)} 
            </div>
            <NavigationMenu activePage='entry' backButtonOverride="pokedex" backButtonLink={-1} connectionError={dbError}></NavigationMenu>
        </>
    );
}
