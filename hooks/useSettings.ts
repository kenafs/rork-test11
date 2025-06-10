import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  
  setDarkMode: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setPushNotifications: (value: boolean) => void;
  setLanguage: (language: string) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleEmailNotifications: () => void;
  togglePushNotifications: () => void;
  resetSettings: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      language: 'fr',
      
      setDarkMode: (value: boolean) => {
        set({ darkMode: value });
        console.log('Dark mode set to:', value);
      },
      
      setNotifications: (value: boolean) => {
        set({ notifications: value });
        // If turning off notifications, also turn off email and push
        if (!value) {
          set({ emailNotifications: false, pushNotifications: false });
        }
        console.log('Notifications set to:', value);
      },
      
      setEmailNotifications: (value: boolean) => {
        set({ emailNotifications: value });
        // If turning on email notifications, also turn on general notifications
        if (value) {
          set({ notifications: true });
        }
        console.log('Email notifications set to:', value);
      },
      
      setPushNotifications: (value: boolean) => {
        set({ pushNotifications: value });
        // If turning on push notifications, also turn on general notifications
        if (value) {
          set({ notifications: true });
        }
        console.log('Push notifications set to:', value);
      },
      
      setLanguage: (language: string) => {
        set({ language });
        console.log('Language set to:', language);
      },
      
      toggleDarkMode: () => {
        const newValue = !get().darkMode;
        get().setDarkMode(newValue);
      },
      
      toggleNotifications: () => {
        const newValue = !get().notifications;
        get().setNotifications(newValue);
      },
      
      toggleEmailNotifications: () => {
        const newValue = !get().emailNotifications;
        get().setEmailNotifications(newValue);
      },
      
      togglePushNotifications: () => {
        const newValue = !get().pushNotifications;
        get().setPushNotifications(newValue);
      },
      
      resetSettings: () => {
        set({
          darkMode: false,
          notifications: true,
          emailNotifications: true,
          pushNotifications: true,
          language: 'fr',
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);