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
  setDarkMode: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
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
        set({ darkMode: !currentValue });
        console.log('Dark mode toggled:', !currentValue);
      },
      
      toggleNotifications: () => {
        const currentValue = get().notifications;
        set({ notifications: !currentValue });
        console.log('Notifications toggled:', !currentValue);
      },
      
      toggleEmailNotifications: () => {
        const currentValue = get().emailNotifications;
        set({ emailNotifications: !currentValue });
        console.log('Email notifications toggled:', !currentValue);
      },
      
      togglePushNotifications: () => {
        const currentValue = get().pushNotifications;
        set({ pushNotifications: !currentValue });
        console.log('Push notifications toggled:', !currentValue);
      },
      
      setDarkMode: (enabled: boolean) => {
        set({ darkMode: enabled });
        console.log('Dark mode set to:', enabled);
      },
      
      setNotifications: (enabled: boolean) => {
        set({ notifications: enabled });
        console.log('Notifications set to:', enabled);
      },
      
      setEmailNotifications: (enabled: boolean) => {
        set({ emailNotifications: enabled });
        console.log('Email notifications set to:', enabled);
      },
      
      setPushNotifications: (enabled: boolean) => {
        set({ pushNotifications: enabled });
        console.log('Push notifications set to:', enabled);
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);