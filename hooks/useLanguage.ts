import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from '@/constants/languages';

type LanguageCode = 'fr' | 'en' | 'es';

interface LanguageState {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',
      
      setLanguage: (language: LanguageCode) => {
        set({ currentLanguage: language });
      },
      
      t: (key: string) => {
        const { currentLanguage } = get();
        const translations = TRANSLATIONS[currentLanguage];
        return translations[key as keyof typeof translations] || key;
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);