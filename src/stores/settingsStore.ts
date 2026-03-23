import { create } from 'zustand';
import type { Theme, EditorMode, PageSize } from '../types';

interface SettingsState {
  theme: Theme;
  defaultMode: EditorMode;
  autoSaveInterval: number;
  defaultPageSize: PageSize;
  defaultOrientation: 'portrait' | 'landscape';
  communityEnabled: boolean;

  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Omit<SettingsState, 'loadSettings' | 'updateSetting' | 'resetSettings'>>(
    key: K,
    value: SettingsState[K]
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaults = {
  theme: 'system' as Theme,
  defaultMode: 'nocode' as EditorMode,
  autoSaveInterval: 500,
  defaultPageSize: 'A4' as PageSize,
  defaultOrientation: 'portrait' as const,
  communityEnabled: true,
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  ...defaults,

  loadSettings: async () => {
    try {
      const { initDB, getSettingValue } = await import('../db');
      const db = await initDB();

      const [theme, defaultMode, autoSaveInterval, defaultPageSize, defaultOrientation, communityEnabled] = await Promise.all([
        getSettingValue(db, 'app.theme'),
        getSettingValue(db, 'app.defaultMode'),
        getSettingValue(db, 'app.autoSaveInterval'),
        getSettingValue(db, 'export.defaultPageSize'),
        getSettingValue(db, 'export.defaultOrientation'),
        getSettingValue(db, 'community.enableFetch'),
      ]);

      set({
        theme: (theme as Theme) || defaults.theme,
        defaultMode: (defaultMode as EditorMode) || defaults.defaultMode,
        autoSaveInterval: (autoSaveInterval as number) || defaults.autoSaveInterval,
        defaultPageSize: (defaultPageSize as PageSize) || defaults.defaultPageSize,
        defaultOrientation: (defaultOrientation as 'portrait' | 'landscape') || defaults.defaultOrientation,
        communityEnabled: (communityEnabled as boolean | undefined) ?? defaults.communityEnabled,
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  },

  updateSetting: async (key, value) => {
    try {
      const { initDB, setSettingValue } = await import('../db');
      const db = await initDB();

      const settingMap: Record<string, string> = {
        theme: 'app.theme',
        defaultMode: 'app.defaultMode',
        autoSaveInterval: 'app.autoSaveInterval',
        defaultPageSize: 'export.defaultPageSize',
        defaultOrientation: 'export.defaultOrientation',
        communityEnabled: 'community.enableFetch',
      };

      await setSettingValue(db, settingMap[key], value as string | number | boolean);
      set({ [key]: value } as Partial<SettingsState>);
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  },

  resetSettings: async () => {
    try {
      const { initDB } = await import('../db');
      const db = await initDB();
      const keys = ['app.theme', 'app.defaultMode', 'app.autoSaveInterval', 'export.defaultPageSize', 'export.defaultOrientation', 'community.enableFetch'];
      for (const key of keys) {
        await db.delete('settings', key);
      }
      set(defaults);
    } catch (err) {
      console.error('Failed to reset settings:', err);
    }
  },
}));
