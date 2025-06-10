import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';
import { useAuth } from './useAuth';

interface ListingsState {
  listings: Listing[];
  filteredListings: Listing[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  
  fetchListings: () => Promise<void>;
  refreshListings: () => Promise<void>;
  createListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  filterBySearch: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  clearFilters: () => void;
  getListingById: (id: string) => Listing | undefined;
  getUserListings: (userId: string) => Listing[];
}

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      filteredListings: [],
      isLoading: false,
      searchQuery: '',
      selectedCategory: null,
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get existing listings from state, or use mock data if empty
          const existingListings = get().listings;
          const listingsToUse = existingListings.length > 0 ? existingListings : mockListings;
          
          set({ 
            listings: listingsToUse,
            filteredListings: listingsToUse,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching listings:', error);
          set({ isLoading: false });
        }
      },
      
      refreshListings: async () => {
        await get().fetchListings();
      },
      
      createListing: async (listingData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const user = useAuth.getState().user;
          if (!user) throw new Error('User must be logged in to create a listing');
          
          const newListing: Listing = {
            id: `listing-${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'active',
            ...listingData,
          };
          
          set(state => {
            const updatedListings = [newListing, ...state.listings];
            return {
              listings: updatedListings,
              filteredListings: get().applyFilters(updatedListings),
              isLoading: false 
            };
          });
          
          console.log('Listing created successfully:', newListing);
          return newListing;
        } catch (error) {
          console.error('Error creating listing:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      updateListing: async (id: string, updates: Partial<Listing>) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const { listings } = get();
          const listingIndex = listings.findIndex(l => l.id === id);
          
          if (listingIndex === -1) {
            set({ isLoading: false });
            return false;
          }
          
          const updatedListings = [...listings];
          updatedListings[listingIndex] = {
            ...updatedListings[listingIndex],
            ...updates,
            updatedAt: Date.now(),
          };
          
          set({ 
            listings: updatedListings,
            filteredListings: get().applyFilters(updatedListings),
            isLoading: false 
          });
          
          console.log('Listing updated:', updatedListings[listingIndex]);
          return true;
        } catch (error) {
          console.error('Error updating listing:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      deleteListing: async (id: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { listings } = get();
          const updatedListings = listings.filter(l => l.id !== id);
          
          set({ 
            listings: updatedListings,
            filteredListings: get().applyFilters(updatedListings),
            isLoading: false 
          });
          
          console.log('Listing deleted:', id);
          return true;
        } catch (error) {
          console.error('Error deleting listing:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      filterBySearch: (query: string) => {
        set(state => {
          const newState = { ...state, searchQuery: query };
          return {
            ...newState,
            filteredListings: get().applyFilters(state.listings, query, state.selectedCategory),
          };
        });
      },
      
      filterByCategory: (category: string | null) => {
        set(state => {
          const newState = { ...state, selectedCategory: category };
          return {
            ...newState,
            filteredListings: get().applyFilters(state.listings, state.searchQuery, category),
          };
        });
      },
      
      clearFilters: () => {
        set(state => ({
          searchQuery: '',
          selectedCategory: null,
          filteredListings: state.listings,
        }));
      },
      
      getListingById: (id: string) => {
        return get().listings.find(listing => listing.id === id);
      },
      
      getUserListings: (userId: string) => {
        return get().listings.filter(listing => listing.createdBy === userId);
      },
      
      // Helper function to apply filters (not exposed in interface)
      applyFilters: (listings: Listing[], searchQuery?: string, category?: string | null) => {
        const state = get();
        const query = searchQuery !== undefined ? searchQuery : state.searchQuery;
        const cat = category !== undefined ? category : state.selectedCategory;
        
        let filtered = [...listings];
        
        // Apply search filter
        if (query.trim()) {
          const lowercaseQuery = query.toLowerCase();
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(lowercaseQuery) ||
            listing.description.toLowerCase().includes(lowercaseQuery) ||
            listing.creatorName.toLowerCase().includes(lowercaseQuery) ||
            (listing.tags && listing.tags.some(tag => 
              tag.toLowerCase().includes(lowercaseQuery)
            ))
          );
        }
        
        // Apply category filter
        if (cat) {
          filtered = filtered.filter(listing => listing.category === cat);
        }
        
        // Sort by creation date (newest first)
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        
        return filtered;
      },
    }),
    {
      name: 'listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        listings: state.listings,
      }),
    }
  )
);