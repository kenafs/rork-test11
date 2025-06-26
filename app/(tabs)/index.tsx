import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavoritesComputed } from '@/hooks/useFavorites';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Plus, MapPin, Star, Users, Calendar, Heart, TrendingUp, Sparkles, ArrowRight } from 'lucide-react-native';

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
  
  const { favorites } = useFavoritesComputed();
  
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const fabScale = useSharedValue(1);
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });
  
  const fabStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ scale: fabScale.value }],
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
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  
  const getWelcomeMessage = () => {
    switch (user?.userType) {
      case 'provider':
        return `Bonjour ${user.name.split(' ')[0]} 👋`;
      case 'business':
        return `Bienvenue ${user.name} 🏢`;
      case 'client':
        return `Salut ${user.name.split(' ')[0]} 😊`;
      default:
        return `Bonjour ${user?.name.split(' ')[0] || 'Utilisateur'} 👋`;
    }
  };
  
  const getCreateButtonText = () => {
    switch (user?.userType) {
      case 'provider':
        return "✨ Créer une annonce";
      case 'business':
        return "🏢 Ajouter un service";
      case 'client':
        return "🔍 Rechercher";
      default:
        return "✨ Créer une annonce";
    }
  };
  
  const handleCreatePress = () => {
    fabScale.value = withSpring(0.9, { damping: 15 }, () => {
      fabScale.value = withSpring(1);
    });
    
    if (user?.userType === 'client') {
      router.push('/(tabs)/search');
    } else {
      router.push('/(tabs)/create');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Compact Modern Header - Now Scrollable */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 20 }, headerStyle]}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View entering={FadeIn.delay(200)} style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
            </View>
            
            {user && user.userType !== 'client' && (
              <Animated.View entering={SlideInDown.delay(400)} style={styles.createButtonContainer}>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={handleCreatePress}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.createButtonText}>{getCreateButtonText()}</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      
      <AnimatedScrollView 
        style={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 140 }]}
      >
        {/* Search Bar */}
        <Animated.View entering={SlideInDown.delay(600)}>
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
          <Animated.View entering={FadeIn.delay(800)}>
            <LocationPermissionRequest onRequestPermission={requestPermission} />
          </Animated.View>
        )}
        
        {/* Category Filter */}
        <Animated.View entering={SlideInDown.delay(1000)}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={filterByCategory}
          />
        </Animated.View>
        
        {/* Listings */}
        <View style={styles.listingsContainer}>
          <Animated.View entering={FadeIn.delay(1200)} style={styles.listingsHeader}>
            <Text style={styles.listingsTitle}>
              {selectedCategory ? 'Résultats filtrés' : 'Annonces récentes'}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.listingsCount}>
                {safeFilteredListings.length}
              </Text>
            </View>
          </Animated.View>
          
          {safeFilteredListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {safeFilteredListings.map((listing, index) => (
                <Animated.View
                  key={`listing-${listing.id}-${index}-${listing.createdAt}`}
                  entering={SlideInDown.delay(1400 + index * 100)}
                  style={styles.listingWrapper}
                >
                  <ListingCard listing={listing} />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeIn.delay(1600)} style={styles.emptyState}>
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyTitle}>Aucun résultat</Text>
                <Text style={styles.emptyText}>
                  Essayez de modifier vos critères de recherche
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </AnimatedScrollView>
      
      {/* Floating Action Button for Clients */}
      {user && user.userType === 'client' && (
        <Animated.View style={[styles.fab, fabStyle]}>
          <TouchableOpacity 
            style={styles.fabButton}
            onPress={handleCreatePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.fabGradient}
            >
              <Plus size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  createButtonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  listingsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listingsCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  listingsGrid: {
    gap: 16,
  },
  listingWrapper: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateCard: {
    backgroundColor: Colors.backgroundAlt,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 280,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});