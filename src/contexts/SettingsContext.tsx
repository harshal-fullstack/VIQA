import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Settings = {
  modelUri: string;
  apiKey: string;
  useLocalBlip: boolean;
  notifications: boolean;
  darkTheme: boolean;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const defaultSettings: Settings = {
  modelUri: 'http://127.0.0.1:8000',
  apiKey: '',
  useLocalBlip: true,
  notifications: true,
  darkTheme: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('viqa_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('viqa_settings', JSON.stringify(settings));
    // Apply dark class to html if necessary, depending on how index.css is configured.
    if (settings.darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
