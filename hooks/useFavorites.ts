import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

interface FavoritesState {
  favorites: { [userId: string]: string[] };
  
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  getFavoriteIds: () => string[];
  isFavorite: (listingId: string) => boolean;
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
          if (!userFavorites.includes(listingId)) {
            return {
              favorites: {
                ...state.favorites,
                [user.id]: [...userFavorites, listingId],
              },
            };
          }
          return state;
        });
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
      },
      
      getFavoriteIds: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        return get().favorites[user.id] || [];
      },
      
      isFavorite: (listingId: string) => {
        const user = useAuth.getState().user;
        if (!user) return false;
        
        const userFavorites = get().favorites[user.id] || [];
        return userFavorites.includes(listingId);
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