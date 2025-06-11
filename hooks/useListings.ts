import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';

interface ListingsState {
  listings: Listing[];
  filteredListings: Listing[];
  selectedCategory: string | null;
  searchQuery: string | null;
  isLoading: boolean;
  
  fetchListings: () => Promise<void>;
  refreshListings: () => Promise<void>;
  createListing: (listingData: Omit<Listing, 'id' | 'createdAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  filterByCategory: (category: string | null) => void;
  filterBySearch: (query: string) => void;
  filterByLocation: (latitude: number, longitude: number, radius?: number) => void;
  clearFilters: () => void;
}

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      filteredListings: [],
      selectedCategory: null,
      searchQuery: null,
      isLoading: false,
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Use mock data for now
          const listings = mockListings;
          
          set({ 
            listings,
            filteredListings: listings,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching listings:', error);
          set({ isLoading: false });
        }
      },
      
      refreshListings: async () => {
        const { fetchListings } = get();
        await fetchListings();
      },
      
      createListing: async (listingData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newListing: Listing = {
            ...listingData,
            id: `listing-${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
          };
          
          set(state => {
            const updatedListings = [...state.listings, newListing];
            return {
              listings: updatedListings,
              filteredListings: updatedListings,
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => {
            const updatedListings = state.listings.map(listing =>
              listing.id === id ? { ...listing, ...updates } : listing
            );
            
            return {
              listings: updatedListings,
              filteredListings: updatedListings,
              isLoading: false
            };
          });
          
          console.log('Listing updated successfully:', id);
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
          
          set(state => {
            const updatedListings = state.listings.filter(listing => listing.id !== id);
            
            return {
              listings: updatedListings,
              filteredListings: updatedListings,
              isLoading: false
            };
          });
          
          console.log('Listing deleted successfully:', id);
          return true;
        } catch (error) {
          console.error('Error deleting listing:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      filterByCategory: (category: string | null) => {
        const { listings, searchQuery } = get();
        
        let filtered = [...listings];
        
        // Apply category filter
        if (category && category !== 'all') {
          filtered = filtered.filter(listing => 
            listing.category.toLowerCase() === category.toLowerCase()
          );
        }
        
        // Apply search filter if exists
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query) ||
            listing.category.toLowerCase().includes(query) ||
            listing.creatorName.toLowerCase().includes(query) ||
            (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(query)))
          );
        }
        
        set({ 
          selectedCategory: category,
          filteredListings: filtered 
        });
      },
      
      filterBySearch: (query: string) => {
        const { listings, selectedCategory } = get();
        
        let filtered = [...listings];
        
        // Apply category filter if exists
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(listing => 
            listing.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        
        // Apply search filter
        if (query.trim()) {
          const searchQuery = query.toLowerCase();
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(searchQuery) ||
            listing.description.toLowerCase().includes(searchQuery) ||
            listing.category.toLowerCase().includes(searchQuery) ||
            listing.creatorName.toLowerCase().includes(searchQuery) ||
            (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
          );
        }
        
        set({ 
          searchQuery: query,
          filteredListings: filtered 
        });
      },
      
      filterByLocation: (latitude: number, longitude: number, radius: number = 50) => {
        const { listings } = get();
        
        // Simple distance calculation (not precise but good for demo)
        const filtered = listings.filter(listing => {
          if (!listing.location) return true;
          
          const distance = Math.sqrt(
            Math.pow(listing.location.latitude - latitude, 2) +
            Math.pow(listing.location.longitude - longitude, 2)
          ) * 111; // Rough conversion to km
          
          return distance <= radius;
        });
        
        set({ filteredListings: filtered });
      },
      
      clearFilters: () => {
        const { listings } = get();
        set({ 
          filteredListings: listings,
          selectedCategory: null,
          searchQuery: null 
        });
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