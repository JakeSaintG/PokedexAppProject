import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import { WelcomePage } from './components/WelcomePage';
import { HomePage } from './components/HomePage';
import { LoadingContentPage } from './components/LoadingContentPage';
import { ProfilePage } from './components/ProfilePage';
import { TallGrassPage } from './components/TallGrassPage/TallGrassPage';
import { PokedexPage } from './components/PokedexPage';
import { SettingsPage } from './components/SettingsPage';
import { EntryPage } from './components/PokedexPage/EntryPage';

import './index.css'
import App from './App';

const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path="/" element={<App />}>
          <Route index element={<WelcomePage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path="loading" element={<LoadingContentPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tall_grass" element={<TallGrassPage />} />

          <Route path="pokedex" element={<PokedexPage />} />
          <Route path="pokedex/entry" element={<EntryPage />} />

          <Route path="settings" element={<SettingsPage />} />
      </Route>
  )
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
