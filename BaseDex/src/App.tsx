import { Outlet } from "react-router-dom";
import styles from "./App.module.css";

export default function App() {
    return (
        /*
            Restricting myself to mobile-only views since this the whole point of 
            this is to stub-out making a mobile application.
        */ 
        <div className={styles.mobile_container}>
            <div className={styles.app}>
                <Outlet />
            </div>
        </div>
    );
}
