import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleEmailNotifications: () => void;
  togglePushNotifications: () => void;
  resetSettings: () => void;
  setDarkMode: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setPushNotifications: (value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      
      toggleDarkMode: () => {
        const newValue = !get().darkMode;
        set({ darkMode: newValue });
        console.log('Dark mode toggled to:', newValue);
      },
      
      toggleNotifications: () => {
        const newValue = !get().notifications;
        set({ notifications: newValue });
        console.log('Notifications toggled to:', newValue);
      },
      
      toggleEmailNotifications: () => {
        const newValue = !get().emailNotifications;
        set({ emailNotifications: newValue });
        console.log('Email notifications toggled to:', newValue);
      },
      
      togglePushNotifications: () => {
        const newValue = !get().pushNotifications;
        set({ pushNotifications: newValue });
        console.log('Push notifications toggled to:', newValue);
      },
      
      setDarkMode: (value: boolean) => {
        set({ darkMode: value });
        console.log('Dark mode set to:', value);
      },
      
      setNotifications: (value: boolean) => {
        set({ notifications: value });
        console.log('Notifications set to:', value);
      },
      
      setEmailNotifications: (value: boolean) => {
        set({ emailNotifications: value });
        console.log('Email notifications set to:', value);
      },
      
      setPushNotifications: (value: boolean) => {
        set({ pushNotifications: value });
        console.log('Push notifications set to:', value);
      },
      
      resetSettings: () => {
        set({
          darkMode: false,
          notifications: true,
          emailNotifications: true,
          pushNotifications: true,
        });
        console.log('Settings reset to defaults');
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);