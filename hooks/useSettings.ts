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
        const currentValue = get().darkMode;
        const newValue = !currentValue;
        set({ darkMode: newValue });
        console.log('Dark mode toggled from:', currentValue, 'to:', newValue);
      },
      
      toggleNotifications: () => {
        const currentValue = get().notifications;
        const newValue = !currentValue;
        set({ notifications: newValue });
        console.log('Notifications toggled from:', currentValue, 'to:', newValue);
      },
      
      toggleEmailNotifications: () => {
        const currentValue = get().emailNotifications;
        const newValue = !currentValue;
        set({ emailNotifications: newValue });
        console.log('Email notifications toggled from:', currentValue, 'to:', newValue);
      },
      
      togglePushNotifications: () => {
        const currentValue = get().pushNotifications;
        const newValue = !currentValue;
        set({ pushNotifications: newValue });
        console.log('Push notifications toggled from:', currentValue, 'to:', newValue);
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