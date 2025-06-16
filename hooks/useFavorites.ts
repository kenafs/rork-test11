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
        
        // CRITICAL FIX: If userId is null (logout), don't clear all favorites, just set currentUserId to null
        if (userId === null) {
          console.log('User logged out, clearing current user but keeping favorites data');
        }
      },
      
      addToFavorites: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          console.warn('No current user set, cannot add to favorites');
          return;
        }
        
        // CRITICAL FIX: Ensure we're working with the correct user's favorites
        const currentUserFavorites = userFavorites[currentUserId] || [];
        if (!currentUserFavorites.includes(listingId)) {
          const newUserFavorites = {
            ...userFavorites,
            [currentUserId]: [...currentUserFavorites, listingId]
          };
          
          console.log(`Adding to favorites for user ${currentUserId}:`, listingId);
          console.log('Updated user favorites:', newUserFavorites[currentUserId]);
          
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
        
        // CRITICAL FIX: Ensure we're working with the correct user's favorites
        const currentUserFavorites = userFavorites[currentUserId] || [];
        const newFavorites = currentUserFavorites.filter(id => id !== listingId);
        
        const newUserFavorites = {
          ...userFavorites,
          [currentUserId]: newFavorites
        };
        
        console.log(`Removing from favorites for user ${currentUserId}:`, listingId);
        console.log('Updated user favorites:', newUserFavorites[currentUserId]);
        
        set({
          userFavorites: newUserFavorites
        });
      },
      
      isFavorite: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          return false;
        }
        
        // CRITICAL FIX: Only check favorites for the current user
        const currentUserFavorites = userFavorites[currentUserId] || [];
        const isFav = currentUserFavorites.includes(listingId);
        return isFav;
      },
      
      getFavoriteListings: () => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          console.log('No current user, returning empty favorites');
          return [];
        }
        
        // CRITICAL FIX: Only return favorites for the current user
        const currentUserFavoriteIds = userFavorites[currentUserId] || [];
        console.log(`Getting favorite listings for user ${currentUserId}:`, currentUserFavoriteIds);
        return mockListings.filter(listing => currentUserFavoriteIds.includes(listing.id));
      },
      
      getFavorites: () => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) {
          console.log('No current user, returning empty favorites array');
          return [];
        }
        
        // CRITICAL FIX: Only return favorites for the current user
        const currentUserFavorites = userFavorites[currentUserId] || [];
        console.log(`Getting favorites for user ${currentUserId}:`, currentUserFavorites);
        return currentUserFavorites;
      },
      
      clearUserFavorites: (userId: string) => {
        const { userFavorites } = get();
        const newUserFavorites = { ...userFavorites };
        delete newUserFavorites[userId];
        
        console.log('Clearing favorites for user:', userId);
        set({ userFavorites: newUserFavorites });
      },
      
      clearAllFavorites: () => {
        console.log('Clearing all favorites');
        set({ userFavorites: {}, currentUserId: null });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        userFavorites: state.userFavorites,
        // CRITICAL FIX: Don't persist currentUserId, it should be set on login
      }),
    }
  )
);