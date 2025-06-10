import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  
  setDarkMode: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      language: 'fr',
      
      setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),
      setNotifications: (enabled: boolean) => set({ notifications: enabled }),
      setEmailNotifications: (enabled: boolean) => set({ emailNotifications: enabled }),
      setPushNotifications: (enabled: boolean) => set({ pushNotifications: enabled }),
      setLanguage: (language: string) => set({ language }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);