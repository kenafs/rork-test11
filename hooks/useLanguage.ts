import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageCode = 'fr' | 'en' | 'es';

interface LanguageState {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    search: 'Rechercher',
    create: 'Créer',
    messages: 'Messages',
    profile: 'Profil',
    settings: 'Paramètres',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    
    // Auth
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    
    // User types
    provider: 'Prestataire',
    business: 'Établissement',
    client: 'Client',
    
    // Categories
    dj_services: 'Services DJ',
    catering: 'Traiteur',
    venue_rental: 'Location de Lieu',
    staff_services: 'Services de Personnel',
    decoration: 'Décoration',
    entertainment: 'Animation',
  },
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    create: 'Create',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    
    // User types
    provider: 'Provider',
    business: 'Business',
    client: 'Client',
    
    // Categories
    dj_services: 'DJ Services',
    catering: 'Catering',
    venue_rental: 'Venue Rental',
    staff_services: 'Staff Services',
    decoration: 'Decoration',
    entertainment: 'Entertainment',
  },
  es: {
    // Navigation
    home: 'Inicio',
    search: 'Buscar',
    create: 'Crear',
    messages: 'Mensajes',
    profile: 'Perfil',
    settings: 'Configuración',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    
    // Auth
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Correo',
    password: 'Contraseña',
    
    // User types
    provider: 'Proveedor',
    business: 'Negocio',
    client: 'Cliente',
    
    // Categories
    dj_services: 'Servicios DJ',
    catering: 'Catering',
    venue_rental: 'Alquiler de Lugar',
    staff_services: 'Servicios de Personal',
    decoration: 'Decoración',
    entertainment: 'Entretenimiento',
  },
};

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',
      
      setLanguage: (language: LanguageCode) => {
        set({ currentLanguage: language });
      },
      
      t: (key: string) => {
        const { currentLanguage } = get();
        return translations[currentLanguage][key as keyof typeof translations.fr] || key;
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);