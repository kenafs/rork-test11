import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Dimensions, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavoritesComputed } from '@/hooks/useFavorites';
import { useSettings } from '@/hooks/useSettings';
import { getColors } from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import Button from '@/components/Button';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Plus, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
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
    error, 
    isLoading: locationLoading, 
    permissionStatus,
    requestPermission,
    hasPermission
  } = useLocation();
  const { t } = useLanguage();
  const { darkMode } = useSettings();
  const Colors = getColors(darkMode);
  
  const { favorites } = useFavoritesComputed();
  
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
      Alert.alert('Localisation', `Filtrage par votre position: ${city || 'Position actuelle'}`);
    }
  };
  
  const handleSearch = (query: string) => {
    filterBySearch(query);
  };
  
  const handleClearSearch = () => {
    filterBySearch('');
  };
  
  const safeFilteredListings = Array.isArray(filteredListings) ? filteredListings : [];
  
  const getWelcomeMessage = () => {
    const firstName = user?.name?.split(' ')[0] || 'Utilisateur';
    return `Salut ${firstName} 👋`;
  };
  
  const handleCreatePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (user?.userType === 'client') {
      router.push('/(tabs)/search');
    } else {
      router.push('/(tabs)/create');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <AnimatedScrollView 
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
      >
        {/* Welcome Header - Simple and clean */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.welcomeHeader}>
          <Text style={[styles.welcomeText, { color: Colors.text }]}>
            {getWelcomeMessage()}
          </Text>
        </Animated.View>
        
        {/* Search Bar */}
        <Animated.View entering={SlideInDown.delay(400)} style={styles.searchSection}>
          <SearchBar
            value={searchQuery || ''}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
            onLocationPress={handleLocationPress}
            placeholder="Où souhaitez-vous organiser votre événement ?"
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
            onSelectCategory={filterByCategory}
          />
        </Animated.View>
        
        {/* Listings Section */}
        <View style={styles.listingsSection}>
          <Animated.View entering={FadeIn.delay(1000)} style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              {selectedCategory ? 'Résultats filtrés' : 'Découvrir'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: Colors.textLight }]}>
              {safeFilteredListings.length} option{safeFilteredListings.length > 1 ? 's' : ''} disponible{safeFilteredListings.length > 1 ? 's' : ''}
            </Text>
          </Animated.View>
          
          {safeFilteredListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {safeFilteredListings.map((listing, index) => (
                <Animated.View
                  key={`listing-${listing.id}-${index}`}
                  entering={SlideInDown.delay(1200 + index * 100)}
                  style={styles.listingWrapper}
                >
                  <ListingCard listing={listing} />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeIn.delay(1400)} style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: Colors.text }]}>Aucun résultat</Text>
              <Text style={[styles.emptyText, { color: Colors.textLight }]}>
                Essayez de modifier vos critères de recherche
              </Text>
            </Animated.View>
          )}
        </View>
      </AnimatedScrollView>
      
      {/* Floating Action Button */}
      <Animated.View 
        entering={SlideInDown.delay(1600)}
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
      >
        <TouchableOpacity 
          style={[styles.fabButton, { backgroundColor: Colors.primary }]}
          onPress={handleCreatePress}
          activeOpacity={0.8}
        >
          {user?.userType === 'client' ? (
            <Search size={24} color="#fff" />
          ) : (
            <Plus size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  welcomeHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  listingsSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '400',
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});