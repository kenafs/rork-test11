import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import Animated, { 
  FadeIn, 
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
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
  const scrollY = useSharedValue(0);
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.9],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -20],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  
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
      <AnimatedScrollView 
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { 
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 120
        }]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Animated.Text entering={FadeIn.delay(200)} style={styles.headerTitle}>
            Rechercher
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(300)} style={styles.headerSubtitle}>
            Trouvez le prestataire parfait pour votre événement
          </Animated.Text>
        </Animated.View>
        
        {/* Search Bar */}
        <Animated.View entering={SlideInDown.delay(400)} style={styles.searchSection}>
          <SearchBar
            value={searchQuery || ''}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
            onLocationPress={handleLocationPress}
            placeholder="Rechercher un prestataire..."
          />
        </Animated.View>
        
        {/* Location Permission Request */}
        {!hasPermission && (
          <Animated.View entering={FadeIn.delay(600)}>
            <LocationPermissionRequest onRequestPermission={requestPermission} />
          </Animated.View>
        )}
        
        {/* Category Filter */}
        <Animated.View entering={SlideInDown.delay(800)}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </Animated.View>
        
        {/* Results */}
        <View style={styles.resultsContainer}>
          <Animated.View entering={FadeIn.delay(1000)} style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {selectedCategory && selectedCategory !== 'all' 
                ? `${selectedCategory}` 
                : 'Tous les résultats'
              }
            </Text>
            <Text style={styles.resultsCount}>
              {safeFilteredListings.length} résultat{safeFilteredListings.length > 1 ? 's' : ''}
            </Text>
          </Animated.View>
          
          {safeFilteredListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {safeFilteredListings.map((listing, index) => (
                <Animated.View
                  key={`search-listing-${listing.id}-${index}`}
                  entering={SlideInDown.delay(1200 + index * 100)}
                  style={styles.listingWrapper}
                >
                  <ListingCard listing={listing} />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeIn.delay(1400)} style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}"`
                  : selectedCategory && selectedCategory !== 'all'
                  ? `Aucun résultat dans la catégorie "${selectedCategory}"`
                  : 'Essayez de modifier vos critères de recherche'
                }
              </Text>
            </Animated.View>
          )}
        </View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.textLight,
    lineHeight: 24,
    fontWeight: '400',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  resultsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  resultsCount: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 12,
    fontWeight: '500',
  },
  listingsGrid: {
    gap: 24,
  },
  listingWrapper: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
});