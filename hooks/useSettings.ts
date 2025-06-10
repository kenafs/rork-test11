import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Appearance
  darkMode: boolean;
  
  // Notifications
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleEmailNotifications: () => void;
  togglePushNotifications: () => void;
  
  // Reset
  resetSettings: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      darkMode: false,
      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      
      // Actions
      toggleDarkMode: () => {
        set(state => ({ darkMode: !state.darkMode }));
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
      
      resetSettings: () => {
        set({
          darkMode: false,
          notifications: true,
          emailNotifications: true,
          pushNotifications: true,
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);