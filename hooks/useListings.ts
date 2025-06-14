import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing } from '@/types';
import { mockListings } from '@/mocks/listings';
import { useAuth } from './useAuth';
import { getCategoryFilter } from '@/constants/categories';

interface UserListingsData {
  userCreatedListings: Listing[];
}

interface ListingsState {
  userListings: { [userId: string]: UserListingsData };
  filteredListings: Listing[];
  selectedCategory: string | null;
  searchQuery: string | null;
  isLoading: boolean;
  
  fetchListings: () => Promise<void>;
  refreshListings: () => Promise<void>;
  addListing: (listingData: Omit<Listing, 'id' | 'createdAt'>) => Promise<Listing>;
  createListing: (listingData: Omit<Listing, 'id' | 'createdAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  filterByCategory: (category: string | null) => void;
  filterBySearch: (query: string) => void;
  filterByLocation: (latitude: number, longitude: number, radius?: number) => void;
  clearFilters: () => void;
  getAllListings: () => Listing[];
  getUserListings: (userId: string) => Listing[];
  listings: Listing[];
}

const getEmptyUserData = (): UserListingsData => ({
  userCreatedListings: [],
});

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      userListings: {},
      filteredListings: [],
      selectedCategory: null,
      searchQuery: null,
      isLoading: false,
      listings: [],
      
      getAllListings: () => {
        const { userListings } = get();
        
        // Combine all user-created listings with mock listings
        const allUserListings: Listing[] = [];
        Object.values(userListings).forEach(userData => {
          allUserListings.push(...userData.userCreatedListings);
        });
        
        const combined = [...mockListings, ...allUserListings];
        
        // Update listings property
        set({ listings: combined });
        
        return combined;
      },
      
      getUserListings: (userId: string) => {
        const { userListings } = get();
        return userListings[userId]?.userCreatedListings || [];
      },
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const allListings = get().getAllListings();
          
          set({ 
            filteredListings: allListings,
            listings: allListings,
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
      
      addListing: async (listingData) => {
        return get().createListing(listingData);
      },
      
      createListing: async (listingData) => {
        const user = useAuth.getState().user;
        if (!user) throw new Error('User must be logged in to create a listing');
        
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newListing: Listing = {
            ...listingData,
            id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
          };
          
          set(state => {
            const updatedUserListings = { ...state.userListings };
            if (!updatedUserListings[user.id]) {
              updatedUserListings[user.id] = getEmptyUserData();
            }
            
            updatedUserListings[user.id].userCreatedListings.push(newListing);
            
            const allListings = get().getAllListings();
            const updatedAllListings = [...allListings, newListing];
            
            return {
              userListings: updatedUserListings,
              filteredListings: updatedAllListings,
              listings: updatedAllListings,
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
        const user = useAuth.getState().user;
        if (!user) return false;
        
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => {
            const updatedUserListings = { ...state.userListings };
            
            if (updatedUserListings[user.id]) {
              updatedUserListings[user.id].userCreatedListings = updatedUserListings[user.id].userCreatedListings.map(listing =>
                listing.id === id ? { ...listing, ...updates } : listing
              );
            }
            
            const allListings = get().getAllListings();
            
            return {
              userListings: updatedUserListings,
              filteredListings: allListings,
              listings: allListings,
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
        const user = useAuth.getState().user;
        if (!user) return false;
        
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => {
            const updatedUserListings = { ...state.userListings };
            
            if (updatedUserListings[user.id]) {
              updatedUserListings[user.id].userCreatedListings = updatedUserListings[user.id].userCreatedListings.filter(listing => listing.id !== id);
            }
            
            const allListings = get().getAllListings();
            
            return {
              userListings: updatedUserListings,
              filteredListings: allListings,
              listings: allListings,
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
        const { searchQuery } = get();
        const allListings = get().getAllListings();
        
        let filtered = [...allListings];
        
        // Apply category filter
        if (category && category !== 'all' && category !== 'Tous') {
          filtered = filtered.filter(listing => 
            getCategoryFilter(category, listing.category)
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
        const { selectedCategory } = get();
        const allListings = get().getAllListings();
        
        let filtered = [...allListings];
        
        // Apply category filter if exists
        if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'Tous') {
          filtered = filtered.filter(listing => 
            getCategoryFilter(selectedCategory, listing.category)
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
        const allListings = get().getAllListings();
        
        // Simple distance calculation (not precise but good for demo)
        const filtered = allListings.filter(listing => {
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
        const allListings = get().getAllListings();
        set({ 
          filteredListings: allListings,
          selectedCategory: null,
          searchQuery: null 
        });
      },
    }),
    {
      name: 'listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userListings: state.userListings,
      }),
    }
  )
);