import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { useAuth } from './useAuth';
import { useListings } from './useListings';

interface FavoritesState {
  favorites: { [userId: string]: string[] };
  
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  getUserFavorites: () => Listing[];
  getFavoriteIds: () => string[];
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      
      addToFavorites: (listingId: string) => {
        const user = useAuth.getState().user;
        if (!user) return;
        
        set(state => {
          const userFavorites = state.favorites[user.id] || [];
          if (userFavorites.includes(listingId)) return state;
          
          return {
            favorites: {
              ...state.favorites,
              [user.id]: [...userFavorites, listingId],
            },
          };
        });
        
        console.log('Added to favorites:', listingId);
      },
      
      removeFromFavorites: (listingId: string) => {
        const user = useAuth.getState().user;
        if (!user) return;
        
        set(state => {
          const userFavorites = state.favorites[user.id] || [];
          
          return {
            favorites: {
              ...state.favorites,
              [user.id]: userFavorites.filter(id => id !== listingId),
            },
          };
        });
        
        console.log('Removed from favorites:', listingId);
      },
      
      isFavorite: (listingId: string) => {
        const user = useAuth.getState().user;
        if (!user) return false;
        
        const userFavorites = get().favorites[user.id] || [];
        return userFavorites.includes(listingId);
      },
      
      getFavoriteIds: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        return get().favorites[user.id] || [];
      },
      
      getUserFavorites: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        const userFavoriteIds = get().favorites[user.id] || [];
        const { getAllListings } = useListings.getState();
        const allListings = getAllListings();
        
        return allListings.filter(listing => userFavoriteIds.includes(listing.id));
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);