import { Language } from '@/types';

export const LANGUAGES: Language[] = [
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
  },
];

export const TRANSLATIONS = {
  fr: {
    // Navigation
    home: 'Accueil',
    search: 'Recherche',
    create: 'Créer',
    messages: 'Messages',
    profile: 'Profil',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    edit: 'Modifier',
    delete: 'Supprimer',
    
    // Home
    greeting: 'Salut ! 👋',
    taglineProvider: 'Trouve ton prestataire parfait !',
    taglineBusiness: 'Développe ton business !',
    createListingProvider: '✨ Créer une annonce\nPartagez votre talent avec la communauté !',
    createListingBusiness: '🏢 Publier une offre\nAttirez de nouveaux clients !',
    
    // Auth
    login: 'Se connecter',
    register: "S'inscrire",
    logout: 'Déconnexion',
    
    // Profile
    editProfile: 'Modifier le profil',
    settings: 'Paramètres',
    
    // Settings
    appearance: 'Apparence',
    darkMode: 'Mode sombre',
    notifications: 'Notifications',
    language: 'Langue',
    privacy: 'Confidentialité',
    payments: 'Paiements',
    help: 'Aide & Support',
    about: 'À propos',
  },
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    create: 'Create',
    messages: 'Messages',
    profile: 'Profile',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    
    // Home
    greeting: 'Hello! 👋',
    taglineProvider: 'Find your perfect service provider!',
    taglineBusiness: 'Grow your business!',
    createListingProvider: '✨ Create a listing\nShare your talent with the community!',
    createListingBusiness: '🏢 Post an offer\nAttract new customers!',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Profile
    editProfile: 'Edit Profile',
    settings: 'Settings',
    
    // Settings
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    language: 'Language',
    privacy: 'Privacy',
    payments: 'Payments',
    help: 'Help & Support',
    about: 'About',
  },
  es: {
    // Navigation
    home: 'Inicio',
    search: 'Buscar',
    create: 'Crear',
    messages: 'Mensajes',
    profile: 'Perfil',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    
    // Home
    greeting: '¡Hola! 👋',
    taglineProvider: '¡Encuentra tu proveedor perfecto!',
    taglineBusiness: '¡Haz crecer tu negocio!',
    createListingProvider: '✨ Crear un anuncio\n¡Comparte tu talento con la comunidad!',
    createListingBusiness: '🏢 Publicar una oferta\n¡Atrae nuevos clientes!',
    
    // Auth
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    
    // Profile
    editProfile: 'Editar Perfil',
    settings: 'Configuración',
    
    // Settings
    appearance: 'Apariencia',
    darkMode: 'Modo Oscuro',
    notifications: 'Notificaciones',
    language: 'Idioma',
    privacy: 'Privacidad',
    payments: 'Pagos',
    help: 'Ayuda y Soporte',
    about: 'Acerca de',
  },
};