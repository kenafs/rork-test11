import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  setDarkMode: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setPushNotifications: (value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      
      setDarkMode: (value: boolean) => set({ darkMode: value }),
      setNotifications: (value: boolean) => set({ notifications: value }),
      setEmailNotifications: (value: boolean) => set({ emailNotifications: value }),
      setPushNotifications: (value: boolean) => set({ pushNotifications: value }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);