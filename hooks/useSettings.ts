import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  toggleDarkMode: () => void;
  setLanguage: (language: string) => void;
  toggleNotifications: () => void;
  toggleEmailNotifications: () => void;
  togglePushNotifications: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false, // Default to light mode
      language: 'fr',
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      
      toggleDarkMode: () => {
        set(state => ({ darkMode: !state.darkMode }));
      },
      
      setLanguage: (language: string) => {
        set({ language });
      },
      
      toggleNotifications: () => {
        set(state => ({ notifications: !state.notifications }));
      },
      
      toggleEmailNotifications: () => {
        set(state => ({ emailNotifications: !state.emailNotifications }));
      },
      
      togglePushNotifications: () => {
        set(state => ({ pushNotifications: !state.pushNotifications }));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);