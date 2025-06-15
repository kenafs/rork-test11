import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';

export default function SearchScreen() {
  const { 
    filteredListings = [], 
    isLoading, 
    fetchListings, 
    refreshListings,
    filterByCategory, 
    filterBySearch, 
    filterByLocation,
    selectedCategory,
    searchQuery 
  } = useListings();
  const { 
    latitude, 
    longitude, 
    city, 
    hasPermission,
    requestPermission
  } = useLocation();
  
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshListings();
    setRefreshing(false);
  };
  
  const handleLocationPress = () => {
    if (!hasPermission) {
      requestPermission();
    } else if (latitude && longitude) {
      filterByLocation(latitude, longitude);
    }
  };
  
  const handleSearch = (query: string) => {
    filterBySearch(query);
  };
  
  const handleClearSearch = () => {
    filterBySearch('');
  };
  
  const handleCategorySelect = (category: string | null) => {
    filterByCategory(category);
  };
  
  // Ensure arrays are always defined
  const safeFilteredListings = Array.isArray(filteredListings) ? filteredListings : [];
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 Rechercher</Text>
          <Text style={styles.headerSubtitle}>
            Trouvez le prestataire parfait pour votre événement
          </Text>
        </View>
        
        {/* Search Bar */}
        <SearchBar
          value={searchQuery || ''}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          onLocationPress={handleLocationPress}
          placeholder="Rechercher un prestataire..."
        />
        
        {/* Location Permission Request */}
        {!hasPermission && (
          <LocationPermissionRequest onRequestPermission={requestPermission} />
        )}
        
        {/* Category Filter - CRITICAL FIX: Better scrolling */}
        <View style={styles.categorySection}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </View>
        
        {/* Results */}
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {selectedCategory && selectedCategory !== 'all' 
                ? `Résultats pour "${selectedCategory}"` 
                : 'Tous les résultats'
              }
            </Text>
            <Text style={styles.resultsCount}>
              {safeFilteredListings.length} résultat{safeFilteredListings.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          {safeFilteredListings.length > 0 ? (
            safeFilteredListings.map((listing, index) => (
              <ListingCard
                key={`search-listing-${listing.id}-${index}`}
                listing={listing}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}"`
                  : selectedCategory && selectedCategory !== 'all'
                  ? `Aucun résultat dans la catégorie "${selectedCategory}"`
                  : 'Essayez de modifier vos critères de recherche'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for tab bar
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  categorySection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});