import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing, UserType } from '@/types';
import { mockListings } from '@/mocks/listings';

interface ListingsState {
  listings: Listing[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  
  fetchListings: () => Promise<void>;
  createListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  searchListings: (query: string) => void;
  filterByCategory: (category: string) => void;
  getFilteredListings: () => Listing[];
  getUserListings: (userId: string) => Listing[];
  refreshListings: () => Promise<void>;
}

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      isLoading: false,
      searchQuery: '',
      selectedCategory: 'all',
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Merge mock listings with user-created listings
          const userListings = get().listings.filter(listing => 
            !mockListings.find(mock => mock.id === listing.id)
          );
          
          const allListings = [...mockListings, ...userListings];
          
          set({ 
            listings: allListings,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching listings:', error);
          set({ isLoading: false });
        }
      },
      
      createListing: async (listingData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newListing: Listing = {
            id: `listing-${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'active',
            ...listingData,
          };
          
          console.log('Creating new listing:', newListing);
          
          set(state => ({
            listings: [...state.listings, newListing],
            isLoading: false 
          }));
          
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
      
      searchListings: (query: string) => {
        set({ searchQuery: query });
      },
      
      filterByCategory: (category: string) => {
        set({ selectedCategory: category });
      },
      
      getFilteredListings: () => {
        const { listings, searchQuery, selectedCategory } = get();
        
        let filtered = listings.filter(listing => listing.status === 'active');
        
        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(listing => 
            listing.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query) ||
            listing.category.toLowerCase().includes(query) ||
            listing.creatorName.toLowerCase().includes(query) ||
            (listing.tags && listing.tags.some(tag => 
              tag.toLowerCase().includes(query)
            )) ||
            (listing.location && listing.location.city.toLowerCase().includes(query))
          );
        }
        
        // Sort by creation date (newest first)
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
      },
      
      getUserListings: (userId: string) => {
        const { listings } = get();
        return listings
          .filter(listing => listing.createdBy === userId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },
      
      refreshListings: async () => {
        await get().fetchListings();
      },
    }),
    {
      name: 'listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        listings: state.listings.filter(listing => 
          // Only persist user-created listings, not mock data
          !mockListings.find(mock => mock.id === listing.id)
        ),
      }),
    }
  )
);