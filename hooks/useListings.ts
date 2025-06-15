import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';
import { useAuth } from './useAuth';

interface ListingsState {
  listings: { [userId: string]: Listing[] };
  filteredListings: Listing[];
  isLoading: boolean;
  selectedCategory: string | null;
  searchQuery: string | null;
  
  fetchListings: () => Promise<void>;
  refreshListings: () => Promise<void>;
  createListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  filterByCategory: (category: string | null) => void;
  filterBySearch: (query: string) => void;
  filterByLocation: (latitude: number, longitude: number, radius?: number) => void;
  getAllListings: () => Listing[];
  getUserListings: () => Listing[];
  getListingById: (id: string) => Listing | undefined;
}

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: {},
      filteredListings: [],
      isLoading: false,
      selectedCategory: null,
      searchQuery: null,
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get all listings from all users plus mock listings
          const allUserListings = Object.values(get().listings).flat();
          const allListings = [...mockListings, ...allUserListings];
          
          set({ 
            filteredListings: allListings,
            isLoading: false 
          });
          
          console.log('Listings fetched:', allListings.length);
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
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const user = useAuth.getState().user;
          if (!user) throw new Error('User must be logged in to create a listing');
          
          // Generate a unique ID with timestamp and random string
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substr(2, 9);
          const uniqueId = `listing-${timestamp}-${randomId}`;
          
          const newListing: Listing = {
            ...listingData,
            id: uniqueId,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          
          console.log('Creating new listing with ID:', uniqueId);
          console.log('Listing data:', newListing);
          
          // Add to user's listings
          set(state => {
            const userListings = state.listings[user.id] || [];
            const updatedUserListings = [...userListings, newListing];
            
            // Also update filtered listings immediately
            const allUserListings = Object.values({
              ...state.listings,
              [user.id]: updatedUserListings,
            }).flat();
            const allListings = [...mockListings, ...allUserListings];
            
            console.log('Updated user listings count:', updatedUserListings.length);
            console.log('All listings after creation:', allListings.length);
            console.log('New listing stored with ID:', newListing.id);
            
            return {
              listings: {
                ...state.listings,
                [user.id]: updatedUserListings,
              },
              filteredListings: allListings,
              isLoading: false,
            };
          });
          
          // Verify the listing was stored correctly
          const storedListing = get().getListingById(uniqueId);
          console.log('Verification - stored listing found:', !!storedListing);
          if (storedListing) {
            console.log('Stored listing ID matches:', storedListing.id === uniqueId);
          }
          
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return false;
          }
          
          const userListings = get().listings[user.id] || [];
          const listingIndex = userListings.findIndex(l => l.id === id);
          
          if (listingIndex === -1) {
            set({ isLoading: false });
            return false;
          }
          
          const updatedListings = [...userListings];
          updatedListings[listingIndex] = {
            ...updatedListings[listingIndex],
            ...updates,
            updatedAt: Date.now(),
          };
          
          set(state => ({
            listings: {
              ...state.listings,
              [user.id]: updatedListings,
            },
            isLoading: false,
          }));
          
          // Refresh filtered listings
          await get().fetchListings();
          
          console.log('Listing updated successfully');
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
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return false;
          }
          
          const userListings = get().listings[user.id] || [];
          const updatedListings = userListings.filter(l => l.id !== id);
          
          set(state => ({
            listings: {
              ...state.listings,
              [user.id]: updatedListings,
            },
            isLoading: false,
          }));
          
          // Refresh filtered listings
          await get().fetchListings();
          
          console.log('Listing deleted successfully');
          return true;
        } catch (error) {
          console.error('Error deleting listing:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      filterByCategory: (category: string | null) => {
        const allListings = get().getAllListings();
        
        let filtered = allListings;
        if (category && category !== 'all') {
          filtered = allListings.filter(listing => listing.category === category);
        }
        
        // Apply search filter if active
        const { searchQuery } = get();
        if (searchQuery) {
          filtered = filtered.filter(listing =>
            listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        set({ 
          selectedCategory: category,
          filteredListings: filtered 
        });
        
        console.log('Filtered by category:', category, filtered.length);
      },
      
      filterBySearch: (query: string) => {
        const allListings = get().getAllListings();
        
        let filtered = allListings;
        if (query.trim()) {
          filtered = allListings.filter(listing =>
            listing.title.toLowerCase().includes(query.toLowerCase()) ||
            listing.description.toLowerCase().includes(query.toLowerCase()) ||
            listing.creatorName.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        // Apply category filter if active
        const { selectedCategory } = get();
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(listing => listing.category === selectedCategory);
        }
        
        set({ 
          searchQuery: query,
          filteredListings: filtered 
        });
        
        console.log('Filtered by search:', query, filtered.length);
      },
      
      filterByLocation: (latitude: number, longitude: number, radius: number = 50) => {
        const allListings = get().getAllListings();
        
        const filtered = allListings.filter(listing => {
          if (!listing.location) return false;
          
          const distance = calculateDistance(
            latitude,
            longitude,
            listing.location.latitude,
            listing.location.longitude
          );
          
          return distance <= radius;
        });
        
        set({ filteredListings: filtered });
        console.log('Filtered by location:', filtered.length);
      },
      
      getAllListings: () => {
        const allUserListings = Object.values(get().listings).flat();
        const allListings = [...mockListings, ...allUserListings];
        console.log('Getting all listings:', allListings.length, 'mock:', mockListings.length, 'user:', allUserListings.length);
        return allListings;
      },
      
      getUserListings: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        return get().listings[user.id] || [];
      },
      
      getListingById: (id: string) => {
        const allListings = get().getAllListings();
        const listing = allListings.find(listing => listing.id === id);
        console.log('Looking for listing with ID:', id);
        console.log('Found listing:', !!listing);
        if (!listing) {
          console.log('Available listing IDs:', allListings.map(l => l.id));
          console.log('Total listings available:', allListings.length);
        } else {
          console.log('Found listing title:', listing.title);
        }
        return listing;
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

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return d;
}