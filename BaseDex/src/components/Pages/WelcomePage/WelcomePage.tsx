import { DexHeader } from '../../DexHeader';
import { useNavigate } from 'react-router-dom';
import styles from './WelcomePage.module.css';
import reactFont from '../../../assets/reactfont.png'
import pokdexFont from '../../../assets/pokedexfont.png'
import reactSvg from '../../../assets/react.svg'
import dexCoverTriangle from '../../../assets/dex_cover_triangle.svg'

export function WelcomePage() {
    const navigate = useNavigate();
    const loadData = () => navigate('loading');

    return (
        <div onClick={loadData} className={styles.load}>
            <DexHeader/>
            <div className={styles.welcome}>
                <div>
                    <img className={`${styles.font_image} ${styles.react_logo}`}src={reactSvg} alt='React Logo of a blue atom with three orbits.'/>
                    <img className={styles.font_image}src={reactFont} alt='Stylized font of the word "react".'/>
                    <img className={styles.font_image}src={pokdexFont} alt='Stylized font of the word "PokéDex".'/>
                </div>
                <img className={styles.dex_triangle}src={dexCoverTriangle} alt='stylized font of the word "PokéDex"'/>
                <p>Touch to begin!</p>
            </div>
        </div>
    );
}
