import styles from "./EntryPage.module.css";
import { DexHeader } from "../../DexHeader";
import { usePGlite } from "@electric-sql/pglite-react";
import { NavigationMenu } from "../../NavigationMenu";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { getEntryPageData } from "../../../repositories/pokemonRepository";

// const test_data: any = {};

export function EntryPage() {
    const dbContext = usePGlite();

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id")?.split('id=');

    useEffect(() => {
        // getPokedexPageData(dbContext).then(d => setPokedexPreviewData(d));
        getEntryPageData(dbContext)//.then(setSomething())
    }, []);

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
