import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { applyTheme, DEFAULT_BRAND_SEED, resolveTheme } from './theme';
import './styles.css';

const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(DEFAULT_BRAND_SEED, resolveTheme('system', systemDark));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
