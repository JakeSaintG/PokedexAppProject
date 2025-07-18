import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { Welcome } from './components/Welcome';
import { HomePage } from './components/HomePage';
import { LoadingContentPage } from './components/LoadingContentPage';
import App from './App';
import { ProfilePage } from './components/ProfilePage';
import { TallGrassPage } from './components/TallGrassPage/TallGrassPage';
import { PokedexPage } from './components/PokedexPage';

const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path="/" element={<App />}>
          <Route index element={<Welcome />} />
          <Route path='/home' element={<HomePage />} />
          <Route path="loading" element={<LoadingContentPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tall_grass" element={<TallGrassPage />} />
          <Route path="pokedex" element={<PokedexPage />} />
      </Route>
  )
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
