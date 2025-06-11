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
  selectedCategory: string | null;
  searchQuery: string;
  locationFilter: {
    latitude: number | null;
    longitude: number | null;
    radius: number;
  };
  
  fetchListings: () => Promise<void>;
  refreshListings: () => Promise<void>;
  filterByCategory: (category: string | null) => void;
  filterBySearch: (query: string) => void;
  filterByLocation: (latitude: number, longitude: number, radius?: number) => void;
  clearFilters: () => void;
  
  createListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'status' | 'updatedAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
}

// Category mapping from French to English and vice versa
const categoryMapping: { [key: string]: string } = {
  'Tous': 'all',
  'DJ': 'DJ',
  'Traiteur': 'Catering',
  'Photographe': 'Photography',
  'Lieu': 'Venue',
  'Décoration': 'Decoration',
  'Musique': 'Music',
  'Animation': 'Entertainment',
  'Fleurs': 'Flowers',
  'Transport': 'Transport',
  'Sécurité': 'Security',
  'Nettoyage': 'Cleaning',
  'Matériel': 'Equipment',
  'Personnel': 'Staff',
  // Reverse mapping
  'all': 'Tous',
  'Catering': 'Traiteur',
  'Photography': 'Photographe',
  'Venue': 'Lieu',
  'Decoration': 'Décoration',
  'Music': 'Musique',
  'Entertainment': 'Animation',
  'Flowers': 'Fleurs',
  'Security': 'Sécurité',
  'Cleaning': 'Nettoyage',
  'Equipment': 'Matériel',
  'Staff': 'Personnel',
};

export const useListings = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      filteredListings: [],
      isLoading: false,
      selectedCategory: null,
      searchQuery: '',
      locationFilter: {
        latitude: null,
        longitude: null,
        radius: 50, // Default radius in km
      },
      
      fetchListings: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Combine mock listings with user-created listings
          const existingListings = get().listings;
          const userCreatedListings = existingListings.filter(listing => 
            !mockListings.find(mock => mock.id === listing.id)
          );
          
          const allListings = [...mockListings, ...userCreatedListings];
          
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
        const { fetchListings } = get();
        await fetchListings();
      },
      
      filterByCategory: (category: string | null) => {
        set({ selectedCategory: category });
        
        const { listings, searchQuery, locationFilter } = get();
        let filtered = [...listings];
        
        // Apply category filter
        if (category && category !== 'Tous' && category !== 'all') {
          // Map French category to English for filtering
          const englishCategory = categoryMapping[category] || category;
          const frenchCategory = categoryMapping[category] || category;
          
          filtered = filtered.filter(listing => {
            // Check both original category and mapped category
            return listing.category === category ||
                   listing.category === englishCategory ||
                   listing.category === frenchCategory ||
                   listing.category.toLowerCase() === category.toLowerCase() ||
                   listing.category.toLowerCase() === englishCategory.toLowerCase() ||
                   listing.category.toLowerCase() === frenchCategory.toLowerCase();
          });
        }
        
        // Keep existing search filter
        if (searchQuery) {
          filtered = applySearchFilter(filtered, searchQuery);
        }
        
        // Keep existing location filter
        if (locationFilter.latitude && locationFilter.longitude) {
          filtered = applyLocationFilter(
            filtered, 
            locationFilter.latitude, 
            locationFilter.longitude, 
            locationFilter.radius
          );
        }
        
        set({ filteredListings: filtered });
      },
      
      filterBySearch: (query: string) => {
        set({ searchQuery: query });
        
        const { listings, selectedCategory, locationFilter } = get();
        let filtered = [...listings];
        
        // Apply search filter
        if (query) {
          filtered = applySearchFilter(filtered, query);
        }
        
        // Keep existing category filter
        if (selectedCategory && selectedCategory !== 'Tous' && selectedCategory !== 'all') {
          const englishCategory = categoryMapping[selectedCategory] || selectedCategory;
          const frenchCategory = categoryMapping[selectedCategory] || selectedCategory;
          
          filtered = filtered.filter(listing => {
            return listing.category === selectedCategory ||
                   listing.category === englishCategory ||
                   listing.category === frenchCategory ||
                   listing.category.toLowerCase() === selectedCategory.toLowerCase() ||
                   listing.category.toLowerCase() === englishCategory.toLowerCase() ||
                   listing.category.toLowerCase() === frenchCategory.toLowerCase();
          });
        }
        
        // Keep existing location filter
        if (locationFilter.latitude && locationFilter.longitude) {
          filtered = applyLocationFilter(
            filtered, 
            locationFilter.latitude, 
            locationFilter.longitude, 
            locationFilter.radius
          );
        }
        
        set({ filteredListings: filtered });
      },
      
      filterByLocation: (latitude: number, longitude: number, radius: number = 50) => {
        set({ 
          locationFilter: {
            latitude,
            longitude,
            radius,
          } 
        });
        
        const { listings, selectedCategory, searchQuery } = get();
        let filtered = [...listings];
        
        // Apply location filter
        filtered = applyLocationFilter(filtered, latitude, longitude, radius);
        
        // Keep existing category filter
        if (selectedCategory && selectedCategory !== 'Tous' && selectedCategory !== 'all') {
          const englishCategory = categoryMapping[selectedCategory] || selectedCategory;
          const frenchCategory = categoryMapping[selectedCategory] || selectedCategory;
          
          filtered = filtered.filter(listing => {
            return listing.category === selectedCategory ||
                   listing.category === englishCategory ||
                   listing.category === frenchCategory ||
                   listing.category.toLowerCase() === selectedCategory.toLowerCase() ||
                   listing.category.toLowerCase() === englishCategory.toLowerCase() ||
                   listing.category.toLowerCase() === frenchCategory.toLowerCase();
          });
        }
        
        // Keep existing search filter
        if (searchQuery) {
          filtered = applySearchFilter(filtered, searchQuery);
        }
        
        set({ filteredListings: filtered });
      },
      
      clearFilters: () => {
        set({ 
          selectedCategory: null,
          searchQuery: '',
          locationFilter: {
            latitude: null,
            longitude: null,
            radius: 50,
          },
          filteredListings: get().listings,
        });
      },
      
      createListing: async (listingData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = useAuth.getState().user;
          if (!user) {
            console.error('User not found when creating listing');
            throw new Error('User must be logged in to create a listing');
          }
          
          console.log('Creating listing with data:', listingData);
          console.log('Current user:', user);
          
          const newListing: Listing = {
            id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'active',
            ...listingData,
          };
          
          console.log('New listing created:', newListing);
          
          const updatedListings = [...get().listings, newListing];
          
          set({ 
            listings: updatedListings,
            filteredListings: applyCurrentFilters(updatedListings, get()),
            isLoading: false 
          });
          
          console.log('Listing added to state successfully');
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
            filteredListings: applyCurrentFilters(updatedListings, get()),
            isLoading: false 
          });
          
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { listings } = get();
          const updatedListings = listings.filter(l => l.id !== id);
          
          set({ 
            listings: updatedListings,
            filteredListings: applyCurrentFilters(updatedListings, get()),
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          console.error('Error deleting listing:', error);
          set({ isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        listings: state.listings.filter(listing => 
          !mockListings.find(mock => mock.id === listing.id)
        ), // Only persist user-created listings
      }),
    }
  )
);

// Helper functions
function applySearchFilter(listings: Listing[], query: string): Listing[] {
  const lowerQuery = query.toLowerCase();
  return listings.filter(listing => 
    listing.title.toLowerCase().includes(lowerQuery) ||
    listing.description.toLowerCase().includes(lowerQuery) ||
    (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
}

function applyLocationFilter(
  listings: Listing[], 
  latitude: number, 
  longitude: number, 
  radiusInKm: number = 50
): Listing[] {
  return listings.filter(listing => {
    // Simple distance calculation (not accounting for Earth's curvature)
    const distance = Math.sqrt(
      Math.pow(listing.location.latitude - latitude, 2) + 
      Math.pow(listing.location.longitude - longitude, 2)
    ) * 111; // Rough conversion to kilometers
    return distance <= radiusInKm;
  });
}

function applyCurrentFilters(listings: Listing[], state: ListingsState): Listing[] {
  let filtered = [...listings];
  
  // Apply category filter - fix null check
  if (state.selectedCategory && state.selectedCategory !== 'Tous' && state.selectedCategory !== 'all') {
    const selectedCategory = state.selectedCategory; // Non-null assertion
    const englishCategory = categoryMapping[selectedCategory] || selectedCategory;
    const frenchCategory = categoryMapping[selectedCategory] || selectedCategory;
    
    filtered = filtered.filter(listing => {
      return listing.category === selectedCategory ||
             listing.category === englishCategory ||
             listing.category === frenchCategory ||
             listing.category.toLowerCase() === selectedCategory.toLowerCase() ||
             listing.category.toLowerCase() === englishCategory.toLowerCase() ||
             listing.category.toLowerCase() === frenchCategory.toLowerCase();
    });
  }
  
  // Apply search filter
  if (state.searchQuery) {
    filtered = applySearchFilter(filtered, state.searchQuery);
  }
  
  // Apply location filter
  if (state.locationFilter.latitude && state.locationFilter.longitude) {
    filtered = applyLocationFilter(
      filtered, 
      state.locationFilter.latitude, 
      state.locationFilter.longitude, 
      state.locationFilter.radius
    );
  }
  
  return filtered;
}