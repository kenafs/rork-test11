import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, DemoAccount, Provider, Venue, Client } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  loginWithDemo: (userData: DemoAccount) => Promise<boolean>;
  register: (userData: Partial<User>, password: string, userType: UserType) => Promise<boolean>;
  logout: () => Promise<void>;
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
    services: ['DJ', 'Animation', 'Sonorisation'],
    priceRange: { min: 300, max: 1500 },
    availability: ['Soir', 'Week-end'],
  } as Provider,
  {
    id: 'business-1',
    name: 'Restaurant Le Gourmet',
    email: 'contact@legourmet.com',
    userType: 'business',
    profileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
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
    venueType: 'Restaurant',
    capacity: 80,
    amenities: ['Terrasse', 'Cuisine équipée', 'Bar'],
  } as Venue,
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
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
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      loginWithDemo: async (userData: DemoAccount) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          let demoUser: User;
          
          if (userData.userType === 'provider') {
            demoUser = {
              id: `demo-${Date.now()}`,
              name: userData.name,
              email: userData.email,
              userType: userData.userType,
              profileImage: userData.profileImage,
              description: userData.description,
              specialties: userData.specialties,
              website: userData.website,
              instagram: userData.instagram,
              rating: userData.rating,
              reviewCount: userData.reviewCount,
              location: {
                latitude: 48.8566,
                longitude: 2.3522,
                city: userData.city,
              },
              city: userData.city,
              createdAt: Date.now(),
              services: userData.services || ['DJ', 'Animation', 'Sonorisation'],
              priceRange: userData.priceRange,
              availability: userData.availability,
            } as Provider;
          } else if (userData.userType === 'business') {
            demoUser = {
              id: `demo-${Date.now()}`,
              name: userData.name,
              email: userData.email,
              userType: userData.userType,
              profileImage: userData.profileImage,
              description: userData.description,
              address: userData.address,
              website: userData.website,
              instagram: userData.instagram,
              rating: userData.rating,
              reviewCount: userData.reviewCount,
              location: {
                latitude: 48.8566,
                longitude: 2.3522,
                city: userData.city,
              },
              city: userData.city,
              createdAt: Date.now(),
              venueType: userData.venueType || 'Restaurant',
              capacity: userData.capacity,
              amenities: userData.amenities,
            } as Venue;
          } else {
            demoUser = {
              id: `demo-${Date.now()}`,
              name: userData.name,
              email: userData.email,
              userType: userData.userType,
              profileImage: userData.profileImage,
              description: userData.description,
              rating: userData.rating,
              reviewCount: userData.reviewCount,
              location: {
                latitude: 48.8566,
                longitude: 2.3522,
                city: userData.city,
              },
              city: userData.city,
              createdAt: Date.now(),
            } as Client;
          }
          
          set({ 
            user: demoUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } catch (error) {
          console.error('Demo login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      register: async (userData: Partial<User>, password: string, userType: UserType) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          let newUser: User;
          
          if (userType === 'provider') {
            newUser = {
              id: `user-${Date.now()}`,
              name: userData.name || '',
              email: userData.email || '',
              userType,
              phone: userData.phone,
              profileImage: userData.profileImage,
              description: userData.description,
              specialties: (userData as any).specialties,
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
              services: (userData as any).services || [],
              priceRange: (userData as any).priceRange,
              availability: (userData as any).availability,
            } as Provider;
          } else if (userType === 'business') {
            newUser = {
              id: `user-${Date.now()}`,
              name: userData.name || '',
              email: userData.email || '',
              userType,
              phone: userData.phone,
              profileImage: userData.profileImage,
              description: userData.description,
              address: (userData as any).address,
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
              venueType: (userData as any).venueType || 'Lieu',
              capacity: (userData as any).capacity,
              amenities: (userData as any).amenities || [],
            } as Venue;
          } else {
            newUser = {
              id: `user-${Date.now()}`,
              name: userData.name || '',
              email: userData.email || '',
              userType,
              phone: userData.phone,
              profileImage: userData.profileImage,
              description: userData.description,
              rating: 0,
              reviewCount: 0,
              location: {
                latitude: 48.8566,
                longitude: 2.3522,
                city: userData.city || 'Paris',
              },
              createdAt: Date.now(),
            } as Client;
          }
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: async () => {
        try {
          console.log('Starting logout process...');
          
          // Clear all auth data immediately
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false
          });
          
          // Clear persisted storage
          try {
            await AsyncStorage.clear();
            console.log('All storage cleared successfully');
          } catch (storageError) {
            console.error('Error clearing storage:', storageError);
          }
          
          console.log('User logged out successfully');
        } catch (error) {
          console.error('Error during logout:', error);
          // Even if there's an error, ensure user is logged out
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false
          });
        }
      },
      
      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return false;
        
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const updatedUser = { ...user, ...updates };
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          set({ isLoading: false });
          return false;
        }
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