import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, DemoAccount } from '@/types';
import { mockProviders, mockVenues, mockClients, demoAccounts } from '@/mocks/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithDemo: (demoAccount: DemoAccount) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
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
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user in mock data
          const allUsers = [...mockProviders, ...mockVenues, ...mockClients];
          const user = allUsers.find(u => u.email === email);
          
          if (user) {
            console.log('Login successful for user:', user);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            console.log('User not found for email:', email);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newUser: User = {
            id: `user-${Date.now()}`,
            createdAt: Date.now(),
            ...userData,
          };
          
          console.log('Registration successful for user:', newUser);
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
          set({ isLoading: true });
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('Clearing user data...');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          
          console.log('Logout completed successfully');
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if there's an error
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
      
      loginWithDemo: async (demoAccount: DemoAccount) => {
        console.log('Starting demo login with account:', demoAccount);
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const baseUser: User = {
            id: `demo-${demoAccount.userType}-${Date.now()}`,
            name: demoAccount.name,
            email: demoAccount.email,
            userType: demoAccount.userType,
            profileImage: demoAccount.profileImage,
            description: demoAccount.description,
            rating: demoAccount.rating,
            reviewCount: demoAccount.reviewCount,
            createdAt: Date.now(),
            city: demoAccount.city,
            location: {
              latitude: 48.8566,
              longitude: 2.3522,
              city: demoAccount.city,
            },
          };

          // Add optional fields if they exist
          if (demoAccount.website) {
            (baseUser as any).website = demoAccount.website;
          }
          if (demoAccount.instagram) {
            (baseUser as any).instagram = demoAccount.instagram;
          }
          
          // Add type-specific properties
          if (demoAccount.userType === 'provider') {
            if (demoAccount.services) {
              (baseUser as any).services = demoAccount.services;
            }
            if (demoAccount.priceRange) {
              (baseUser as any).priceRange = demoAccount.priceRange;
            }
            if (demoAccount.availability) {
              (baseUser as any).availability = demoAccount.availability;
            }
          }
          
          if (demoAccount.userType === 'business') {
            if (demoAccount.venueType) {
              (baseUser as any).venueType = demoAccount.venueType;
            }
            if (demoAccount.capacity) {
              (baseUser as any).capacity = demoAccount.capacity;
            }
            if (demoAccount.amenities) {
              (baseUser as any).amenities = demoAccount.amenities;
            }
            if (demoAccount.address) {
              (baseUser as any).address = demoAccount.address;
            }
          }
          
          console.log('Demo login successful for user:', baseUser);
          set({ 
            user: baseUser, 
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
      
      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { user } = get();
          if (!user) {
            set({ isLoading: false });
            return false;
          }
          
          const updatedUser = { ...user, ...updates };
          
          console.log('Profile updated successfully:', updatedUser);
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);