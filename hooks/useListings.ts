import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';

interface ListingsState {
  listings: Listing[];
  filteredListings: Listing[];
  isLoading: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  
  fetchListings: () => Promise<void>;
  refreshListings: () => Promise<void>;
  createListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  filterByCategory: (category: string | null) => void;
  filterBySearch: (query: string) => void;
  filterByLocation: (latitude: number, longitude: number, radius?: number) => void;
  getListingById: (id: string) => Listing | undefined;
  getUserListings: (userId: string) => Listing[];
}

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      filteredListings: [],
      isLoading: false,
      selectedCategory: null,
      searchQuery: '',
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get existing listings from state and merge with mock data
          const existingListings = get().listings;
          const allListings = [...mockListings, ...existingListings.filter(l => !mockListings.find(m => m.id === l.id))];
          
          set({ 
            listings: allListings,
            filteredListings: allListings,
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
          await new Promise(resolve => setTimeout(resolve, 500));
          
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
            filteredListings: updatedListings,
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
            filteredListings: updatedListings,
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
      
      filterByCategory: (category: string | null) => {
        const { listings, searchQuery } = get();
        let filtered = [...listings];
        
        if (category && category !== 'all') {
          filtered = filtered.filter(listing => listing.category === category);
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query) ||
            listing.creatorName.toLowerCase().includes(query) ||
            listing.tags.some(tag => tag.toLowerCase().includes(query))
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
        
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(listing => listing.category === selectedCategory);
        }
        
        if (query) {
          const searchQuery = query.toLowerCase();
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(searchQuery) ||
            listing.description.toLowerCase().includes(searchQuery) ||
            listing.creatorName.toLowerCase().includes(searchQuery) ||
            listing.tags.some(tag => tag.toLowerCase().includes(searchQuery))
          );
        }
        
        set({ 
          searchQuery: query,
          filteredListings: filtered 
        });
      },
      
      filterByLocation: (latitude: number, longitude: number, radius: number = 50) => {
        const { listings } = get();
        
        // Calculate distance between two points using Haversine formula
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // Earth's radius in kilometers
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        const filtered = listings.filter(listing => {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            listing.location.latitude, 
            listing.location.longitude
          );
          return distance <= radius;
        });
        
        set({ filteredListings: filtered });
      },
      
      getListingById: (id: string) => {
        return get().listings.find(listing => listing.id === id);
      },
      
      getUserListings: (userId: string) => {
        return get().listings.filter(listing => listing.createdBy === userId);
      },
    }),
    {
      name: 'listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        listings: state.listings.filter(l => !l.id.startsWith('mock-')), // Don't persist mock data
      }),
    }
  )
);