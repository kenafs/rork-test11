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
        set({ currentUserId: userId });
      },
      
      addToFavorites: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) return;
        
        const currentFavorites = userFavorites[currentUserId] || [];
        if (!currentFavorites.includes(listingId)) {
          set({
            userFavorites: {
              ...userFavorites,
              [currentUserId]: [...currentFavorites, listingId]
            }
          });
        }
      },
      
      removeFromFavorites: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) return;
        
        const currentFavorites = userFavorites[currentUserId] || [];
        const newFavorites = currentFavorites.filter(id => id !== listingId);
        
        set({
          userFavorites: {
            ...userFavorites,
            [currentUserId]: newFavorites
          }
        });
      },
      
      isFavorite: (listingId: string) => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) return false;
        
        const currentFavorites = userFavorites[currentUserId] || [];
        return currentFavorites.includes(listingId);
      },
      
      getFavoriteListings: () => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) return [];
        
        const favoriteIds = userFavorites[currentUserId] || [];
        return mockListings.filter(listing => favoriteIds.includes(listing.id));
      },
      
      getFavorites: () => {
        const { currentUserId, userFavorites } = get();
        if (!currentUserId) return [];
        
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
      partialize: (state) => ({ userFavorites: state.userFavorites }),
    }
  )
);