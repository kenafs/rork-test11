import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import CategoryFilter from '@/components/CategoryFilter';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function SearchScreen() {
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { 
    listings = [], 
    filteredListings = [], 
    isLoading, 
    fetchListings, 
    filterByCategory, 
    filterBySearch,
    filterByLocation,
    selectedCategory,
    searchQuery: storeSearchQuery,
  } = useListings();
  
  const { 
    latitude, 
    longitude, 
    city, 
    requestPermission, 
  } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch listings on mount if not already loaded
  useEffect(() => {
    if (!Array.isArray(listings) || listings.length === 0) {
      fetchListings();
    }
  }, []);
  
  // Apply initial category filter if provided
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      filterByCategory(initialCategory);
    }
  }, [initialCategory]);
  
  // Update local search query when store search query changes
  useEffect(() => {
    setSearchQuery(storeSearchQuery || '');
  }, [storeSearchQuery]);
  
  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    
    // Debounce search to avoid too many updates
    const debounce = setTimeout(() => {
      filterBySearch(text);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(debounce);
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    filterBySearch('');
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    filterByCategory(category);
  };
  
  // Handle location filter
  const handleLocationFilter = () => {
    if (latitude && longitude) {
      filterByLocation(latitude, longitude);
    } else {
      requestPermission();
    }
  };
  
  // Ensure filteredListings is always an array
  const safeFilteredListings = Array.isArray(filteredListings) ? filteredListings : [];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          onLocationPress={handleLocationFilter}
          placeholder="Rechercher un service, un lieu..."
        />
      </View>
      
      <View style={styles.categorySection}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </View>
      
      {city && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Résultats près de <Text style={styles.cityText}>{city}</Text>
          </Text>
          <Button 
            title="Modifier" 
            variant="outline" 
            size="small" 
            onPress={requestPermission}
            style={styles.locationButton}
          />
        </View>
      )}
      
      <FlatList
        data={safeFilteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading || isSearching ? (
            <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
              <Text style={styles.emptyText}>
                Essayez de modifier vos critères de recherche ou d'élargir votre zone géographique.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    paddingTop: 8,
  },
  categorySection: {
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  cityText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  locationButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});