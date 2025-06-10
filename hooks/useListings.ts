import { create } from 'zustand';
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

export const useListings = create<ListingsState>((set, get) => ({
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set({ 
      listings: mockListings,
      filteredListings: mockListings,
      isLoading: false 
    });
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
    if (category && category !== 'Tous') {
      filtered = filtered.filter(listing => 
        listing.category === category ||
        listing.category.toLowerCase() === category.toLowerCase()
      );
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
    if (selectedCategory && selectedCategory !== 'Tous') {
      filtered = filtered.filter(listing => 
        listing.category === selectedCategory ||
        listing.category.toLowerCase() === selectedCategory.toLowerCase()
      );
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
    if (selectedCategory && selectedCategory !== 'Tous') {
      filtered = filtered.filter(listing => 
        listing.category === selectedCategory ||
        listing.category.toLowerCase() === selectedCategory.toLowerCase()
      );
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = useAuth.getState().user;
    if (!user) throw new Error('User must be logged in to create a listing');
    
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      ...listingData,
    };
    
    const updatedListings = [...get().listings, newListing];
    
    set({ 
      listings: updatedListings,
      filteredListings: applyCurrentFilters(updatedListings, get()),
      isLoading: false 
    });
    
    return newListing;
  },
  
  updateListing: async (id: string, updates: Partial<Listing>) => {
    set({ isLoading: true });
    
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
  },
  
  deleteListing: async (id: string) => {
    set({ isLoading: true });
    
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
  },
}));

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
  
  // Apply category filter
  if (state.selectedCategory && state.selectedCategory !== 'Tous') {
    filtered = filtered.filter(listing => 
      listing.category === state.selectedCategory ||
      listing.category.toLowerCase() === state.selectedCategory.toLowerCase()
    );
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