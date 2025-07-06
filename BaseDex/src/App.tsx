import './App.css';
import { HomePage } from './HomePage';
import { StartPage } from './StartPage';

export default function App() {
    return <div className="App">
        Vite APP
        <StartPage value='test'></StartPage>
        <HomePage value='also test'></HomePage>
    </div>;
}
