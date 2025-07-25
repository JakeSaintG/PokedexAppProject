import styles from './EntryPage.module.css';
import { DexHeader } from "../../DexHeader";
import { NavigationMenu } from "../../NavigationMenu";

const test_data: any = []

export function EntryPage( ) {
    return (
        <div className={styles.entry}>
            <DexHeader></DexHeader>
                <div className={styles.entry_display}>
                    foo
                </div>
            <NavigationMenu activePage='entry'></NavigationMenu>
        </div>
    );
}