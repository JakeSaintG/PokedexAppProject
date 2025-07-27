import { DexHeader } from '../DexHeader';
import { useNavigate } from 'react-router-dom';
import styles from './WelcomePage.module.css';
import reactFont from '../../assets/reactfont.png'
import pokdexFont from '../../assets/pokedexfont.png'
import reactSvg from '../../assets/react.svg'

export function WelcomePage() {
    const navigate = useNavigate();
    const loadData = () => navigate('loading');

    return (
        <div onClick={loadData} className={styles.load}>
            <DexHeader></DexHeader>
            <div className={styles.welcome}>
                {/* TODO: styles these with the blue outline and add the triangle on the right */}
                {/* TODO: change this to grid and tweak the sizes */}
                {/* TODO: make the other lang images: fontsz.com/pokemon-font-generator*/}
                <img className={styles.font_image}src={reactSvg} alt='stylized font of the word "react"'/>
                <img className={styles.font_image}src={reactFont} alt='stylized font of the word "react"'/>
                <img className={styles.font_image}src={pokdexFont} alt='stylized font of the word "PokéDex"'/>
                <p>Touch to begin!</p>
            </div>
        </div>
    );
}
