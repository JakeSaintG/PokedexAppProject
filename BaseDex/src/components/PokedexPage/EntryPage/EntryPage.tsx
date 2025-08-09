import styles from "./EntryPage.module.css";
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";
import { Link, useSearchParams } from "react-router-dom";

// const test_data: any = {};

export function EntryPage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id")?.split('id=');

    return (
        /*
            Need to think of a way to return back to main dex page. Maybe have a <section id=`{$id}`>
            in each link with the ID in it. Then, when clicking the back, the ID is passed back to
            the pokedex page with the section id so that it is scrolled to roughly where they left off.
        */

        <div className={styles.entry}>
            <DexHeader/>
            <div className={styles.entry_display}>
                foo
                <Link className={styles.back} to={`../pokedex#${id}`}>
                    back
                </Link>
            </div>
            {/* TODO: back button instead */}
            <NavigationMenu activePage='entry'></NavigationMenu>
        </div>
    );
}
