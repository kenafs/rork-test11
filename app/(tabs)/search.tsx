import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useFavorites } from '@/hooks/useFavorites';
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
  const { favorites = [] } = useFavorites();
  
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
  
  // Ensure arrays are always defined
  const safeFilteredListings = Array.isArray(filteredListings) ? filteredListings : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  
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
            Trouvez le prestataire ou établissement parfait
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
        
        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={filterByCategory}
        />
        
        {/* Results */}
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {selectedCategory && selectedCategory !== 'all' 
                ? `Résultats pour "${selectedCategory}"` 
                : searchQuery 
                ? `Résultats pour "${searchQuery}"`
                : 'Toutes les annonces'
              }
            </Text>
            <Text style={styles.resultsCount}>
              {safeFilteredListings.length} résultat{safeFilteredListings.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          {safeFilteredListings.length > 0 ? (
            safeFilteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
              <Text style={styles.emptyText}>
                {selectedCategory && selectedCategory !== 'all'
                  ? `Aucune annonce trouvée dans la catégorie "${selectedCategory}"`
                  : searchQuery
                  ? `Aucune annonce trouvée pour "${searchQuery}"`
                  : 'Aucune annonce disponible pour le moment'
                }
              </Text>
              <Text style={styles.emptyHint}>
                💡 Essayez de modifier vos critères de recherche ou explorez d'autres catégories
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
    paddingBottom: 120,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});