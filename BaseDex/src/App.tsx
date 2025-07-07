import './App.css';
import { DexHeader } from './DexHeader';
import { HomePage } from './HomePage';
import { StartPage } from './StartPage';

export default function App() {
    return <div>
        <DexHeader></DexHeader>
        PokeDex
        <StartPage value='test'></StartPage>
        <HomePage value='also test'></HomePage>
    </div>;
}
