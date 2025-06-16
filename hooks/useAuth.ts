import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, DemoAccount } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  loginWithDemo: (demoAccount: DemoAccount) => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const mockUser: User = {
            id: `user-${Date.now()}`,
            name: 'Utilisateur Test',
            email,
            userType: 'client',
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            description: 'Utilisateur de test pour EventApp',
            rating: 0,
            reviewCount: 0,
            location: {
              latitude: 48.8566,
              longitude: 2.3522,
              city: 'Paris',
            },
            createdAt: Date.now(),
          };
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          // Set current user in favorites store
          const { useFavorites } = await import('@/hooks/useFavorites');
          useFavorites.getState().setCurrentUser(mockUser.id);
          
          console.log('User logged in successfully:', mockUser);
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      register: async (userData: Omit<User, 'id' | 'createdAt'>) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const newUser: User = {
            ...userData,
            id: `user-${Date.now()}`,
            rating: 0,
            reviewCount: 0,
            createdAt: Date.now(),
          };
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          // Set current user in favorites store
          const { useFavorites } = await import('@/hooks/useFavorites');
          useFavorites.getState().setCurrentUser(newUser.id);
          
          console.log('User registered successfully:', newUser);
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          console.log('Starting logout process...');
          
          // Clear favorites for current user
          const { useFavorites } = await import('@/hooks/useFavorites');
          useFavorites.getState().setCurrentUser(null);
          
          // Simulate logout delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Clear all auth state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          
          console.log('User logged out successfully');
          
          // CRITICAL FIX: Force redirect to landing page after logout
          const { router } = await import('expo-router');
          
          // Use replace to ensure we can't go back to authenticated screens
          router.replace('/');
          
          console.log('Redirected to landing page');
          
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if there's an error
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          
          // Still try to redirect even if there was an error
          try {
            const { router } = await import('expo-router');
            router.replace('/');
          } catch (redirectError) {
            console.error('Redirect error:', redirectError);
          }
        }
      },
      
      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            set({ isLoading: false });
            return false;
          }
          
          const updatedUser = { ...currentUser, ...updates };
          
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
          
          console.log('Profile updated successfully:', updatedUser);
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      loginWithDemo: async (demoAccount: DemoAccount) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const demoUser: User = {
            id: `demo-${demoAccount.userType}-${Date.now()}`,
            name: demoAccount.name,
            email: demoAccount.email,
            userType: demoAccount.userType,
            profileImage: demoAccount.profileImage,
            description: demoAccount.description,
            website: demoAccount.website,
            instagram: demoAccount.instagram,
            rating: 0,
            reviewCount: 0,
            location: {
              latitude: 48.8566,
              longitude: 2.3522,
              city: demoAccount.city,
            },
            createdAt: Date.now(),
          };
          
          // Add type-specific properties
          if (demoAccount.userType === 'provider') {
            (demoUser as any).specialties = demoAccount.specialties;
            (demoUser as any).services = demoAccount.services;
            (demoUser as any).priceRange = demoAccount.priceRange;
            (demoUser as any).availability = demoAccount.availability;
          } else if (demoAccount.userType === 'business') {
            (demoUser as any).address = demoAccount.address;
            (demoUser as any).venueType = demoAccount.venueType;
            (demoUser as any).capacity = demoAccount.capacity;
            (demoUser as any).amenities = demoAccount.amenities;
          }
          
          set({ 
            user: demoUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          // Set current user in favorites store
          const { useFavorites } = await import('@/hooks/useFavorites');
          useFavorites.getState().setCurrentUser(demoUser.id);
          
          console.log('Demo user logged in successfully:', demoUser);
          return true;
        } catch (error) {
          console.error('Demo login error:', error);
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);