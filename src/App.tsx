import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { useSettingsStore } from './stores/settingsStore';

function App() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor/:docId" element={<EditorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
    </Routes>
  );
}

export default App;
