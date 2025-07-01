import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  language: string;
  notifications: {
    messages: boolean;
    quotes: boolean;
    marketing: boolean;
  };
  
  toggleDarkMode: () => void;
  setLanguage: (language: string) => void;
  updateNotificationSettings: (settings: Partial<SettingsState['notifications']>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false, // FIXED: Default to light mode
      language: 'fr',
      notifications: {
        messages: true,
        quotes: true,
        marketing: false,
      },
      
      toggleDarkMode: () => {
        set(state => ({ darkMode: !state.darkMode }));
      },
      
      setLanguage: (language: string) => {
        set({ language });
      },
      
      updateNotificationSettings: (settings) => {
        set(state => ({
          notifications: { ...state.notifications, ...settings }
        }));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);