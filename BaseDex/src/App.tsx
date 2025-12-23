import { Outlet } from "react-router-dom";
import styles from "./App.module.css";

import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";

const dbContext = await PGlite.create({
    extensions: { live },
});

export default function App() {
    return (
        /*
            Restricting app to mobile-only views since this the whole point of 
            this is to stub-out making a mobile application.
        */
        <PGliteProvider db={dbContext}>
            <div className={styles.mobile_container}>
                <div className={styles.app}>
                    <Outlet />
                </div>
            </div>
        </PGliteProvider>
    );
}
