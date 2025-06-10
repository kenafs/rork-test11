import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  loginWithDemo: (userData: Partial<User>) => Promise<boolean>;
  register: (userData: Partial<User>, password: string, userType: UserType) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    userType: 'client',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop',
    rating: 4.5,
    reviewCount: 23,
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'provider-1',
    name: 'Marie Martin - DJ Pro',
    email: 'marie@djpro.com',
    userType: 'provider',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    description: 'DJ professionnelle spécialisée dans les événements d\'entreprise et mariages.',
    specialties: 'DJ, Animation, Sonorisation',
    website: 'https://djpro-marie.com',
    instagram: '@djpro_marie',
    rating: 4.8,
    reviewCount: 127,
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
    },
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'business-1',
    name: 'Restaurant Le Gourmet',
    email: 'contact@legourmet.com',
    userType: 'business',
    profileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop',
    description: 'Restaurant gastronomique avec terrasse, spécialisé dans l\'organisation d\'événements privés.',
    address: '15 Rue de la Paix, 75001 Paris',
    website: 'https://legourmet-paris.fr',
    instagram: '@legourmet_paris',
    rating: 4.6,
    reviewCount: 89,
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
    },
    createdAt: Date.now() - 86400000 * 90,
  },
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by email
        const user = mockUsers.find(u => u.email === email);
        
        if (user && password === 'password') {
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },
      
      loginWithDemo: async (userData: Partial<User>) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          name: userData.name || 'Demo User',
          email: userData.email || 'demo@example.com',
          userType: userData.userType || 'provider',
          profileImage: userData.profileImage,
          description: userData.description,
          specialties: userData.specialties,
          address: userData.address,
          website: userData.website,
          instagram: userData.instagram,
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
          location: {
            latitude: 48.8566,
            longitude: 2.3522,
            city: userData.city || 'Paris',
          },
          createdAt: Date.now(),
        };
        
        set({ 
          user: demoUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return true;
      },
      
      register: async (userData: Partial<User>, password: string, userType: UserType) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: userData.name || '',
          email: userData.email || '',
          userType,
          phone: userData.phone,
          profileImage: userData.profileImage,
          description: userData.description,
          specialties: userData.specialties,
          address: userData.address,
          website: userData.website,
          instagram: userData.instagram,
          rating: 0,
          reviewCount: 0,
          location: {
            latitude: 48.8566,
            longitude: 2.3522,
            city: userData.city || 'Paris',
          },
          createdAt: Date.now(),
        };
        
        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return true;
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },
      
      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return false;
        
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedUser = { ...user, ...updates };
        set({ 
          user: updatedUser, 
          isLoading: false 
        });
        return true;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);