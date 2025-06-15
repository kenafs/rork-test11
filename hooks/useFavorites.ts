import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';

interface UserFavorites {
  [userId: string]: string[];
}

interface FavoritesState {
  userFavorites: UserFavorites;
  currentUserId: string | null;
  
  setCurrentUser: (userId: string | null) => void;
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  getFavoriteListings: () => Listing[];
  getFavorites: () => string[];
  clearUserFavorites: (userId: string) => void;
  clearAllFavorites: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      userFavorites: {},
      currentUserId: null,
      
      setCurrentUser: (userId: string | null) => {
        console.log('Setting current user in favorites:', userId);
        set({ currentUserId: userId });
      },
      
      addToFavorites: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          console.warn('No current user set, cannot add to favorites');
          return;
        }
        
        const currentFavorites = userFavorites[currentUserId] || [];
        if (!currentFavorites.includes(listingId)) {
          const newUserFavorites = {
            ...userFavorites,
            [currentUserId]: [...currentFavorites, listingId]
          };
          
          console.log('Adding to favorites for user', currentUserId, ':', listingId);
          console.log('New favorites state:', newUserFavorites);
          
          set({
            userFavorites: newUserFavorites
          });
        }
      },
      
      removeFromFavorites: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          console.warn('No current user set, cannot remove from favorites');
          return;
        }
        
        const currentFavorites = userFavorites[currentUserId] || [];
        const newFavorites = currentFavorites.filter(id => id !== listingId);
        
        const newUserFavorites = {
          ...userFavorites,
          [currentUserId]: newFavorites
        };
        
        console.log('Removing from favorites for user', currentUserId, ':', listingId);
        console.log('New favorites state:', newUserFavorites);
        
        set({
          userFavorites: newUserFavorites
        });
      },
      
      isFavorite: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          return false;
        }
        
        const currentFavorites = userFavorites[currentUserId] || [];
        return currentFavorites.includes(listingId);
      },
      
      getFavoriteListings: () => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          return [];
        }
        
        const favoriteIds = userFavorites[currentUserId] || [];
        return mockListings.filter(listing => favoriteIds.includes(listing.id));
      },
      
      getFavorites: () => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          return [];
        }
        
        return userFavorites[currentUserId] || [];
      },
      
      clearUserFavorites: (userId: string) => {
        const { userFavorites } = get();
        const newUserFavorites = { ...userFavorites };
        delete newUserFavorites[userId];
        
        set({ userFavorites: newUserFavorites });
      },
      
      clearAllFavorites: () => {
        set({ userFavorites: {}, currentUserId: null });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        userFavorites: state.userFavorites,
        // Don't persist currentUserId - it should be set on login
      }),
    }
  )
);