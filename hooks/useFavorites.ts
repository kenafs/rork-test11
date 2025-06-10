import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';

interface FavoritesState {
  favorites: string[];
  favoriteListings: Listing[];
  
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  loadFavoriteListings: () => void;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteListings: [],
      
      addToFavorites: (listingId: string) => {
        const currentFavorites = get().favorites;
        if (!currentFavorites.includes(listingId)) {
          const newFavorites = [...currentFavorites, listingId];
          set({ favorites: newFavorites });
          get().loadFavoriteListings();
        }
      },
      
      removeFromFavorites: (listingId: string) => {
        const currentFavorites = get().favorites;
        const newFavorites = currentFavorites.filter(id => id !== listingId);
        set({ favorites: newFavorites });
        get().loadFavoriteListings();
      },
      
      isFavorite: (listingId: string) => {
        return get().favorites.includes(listingId);
      },
      
      loadFavoriteListings: () => {
        const favoriteIds = get().favorites;
        const favoriteListings = mockListings.filter(listing => 
          favoriteIds.includes(listing.id)
        );
        set({ favoriteListings });
      },
      
      clearFavorites: () => {
        set({ favorites: [], favoriteListings: [] });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loadFavoriteListings();
        }
      },
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);