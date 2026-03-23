import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DBProvider } from '@db/DBProvider';
import App from './App';
import './styles/index.css';

function applyTheme(theme: string) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else if (theme === 'light') {
    document.body.classList.remove('dark');
  } else if (theme === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}

function Root() {
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { initDB, getSettingValue } = await import('./db');
        const db = await initDB();
        
        const theme = await getSettingValue(db, 'app.theme');
        applyTheme((theme as string) || 'system');
      } catch (err) {
        console.error('Failed to load settings:', err);
        applyTheme('system');
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  if (!settingsLoaded) {
    return null;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DBProvider>
        <Root />
      </DBProvider>
    </BrowserRouter>
  </React.StrictMode>
);
