import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
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
import { BlurView } from 'expo-blur';
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

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const router = useRouter();
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
  
  // FIXED: Use the computed favorites hook
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
      [0, -10],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
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
  
  // Ensure arrays are always defined
  const safeFilteredListings = Array.isArray(filteredListings) ? filteredListings : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  
  // Authenticated user experience - CRITICAL FIX: Compact header design
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
  
  const getSubtitle = () => {
    switch (user?.userType) {
      case 'provider':
        return "Gérez vos annonces et développez votre activité";
      case 'business':
        return "Proposez vos services et attirez de nouveaux clients";
      case 'client':
        return "Trouvez le prestataire parfait pour votre événement";
      default:
        return "Trouvez le prestataire parfait pour votre événement";
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
      
      {/* FIXED: Much more compact and elegant header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <BlurView intensity={80} style={styles.headerBlur}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View entering={FadeIn.delay(200)} style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
                <Text style={styles.subtitleText}>{getSubtitle()}</Text>
              </View>
              
              {/* FIXED: Much more compact stats row */}
              <Animated.View entering={SlideInDown.delay(400)} style={styles.statsRow}>
                {[
                  { icon: Heart, value: safeFavorites.length || 0, label: 'Favoris', color: '#FF6B6B' },
                  { icon: Star, value: user?.rating?.toFixed(1) || '4.8', label: 'Note', color: '#FFD700' },
                  { icon: TrendingUp, value: safeFilteredListings.length, label: 'Offres', color: '#10B981' },
                  { icon: Sparkles, value: '12', label: 'En ligne', color: '#8B5CF6' }
                ].map((stat, index) => (
                  <Animated.View 
                    key={`stat-${index}`}
                    entering={ZoomIn.delay(600 + index * 100)}
                    style={styles.statCardWrapper}
                  >
                    <BlurView intensity={30} style={styles.statCard}>
                      <stat.icon size={12} color={stat.color} />
                      <Text style={styles.statCardNumber}>{stat.value}</Text>
                      <Text style={styles.statCardLabel}>{stat.label}</Text>
                    </BlurView>
                  </Animated.View>
                ))}
              </Animated.View>
              
              {user && user.userType !== 'client' && (
                <Animated.View entering={SlideInDown.delay(800)} style={styles.createButtonContainer}>
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={handleCreatePress}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={40} style={styles.createButtonBlur}>
                      <Plus size={16} color="#fff" />
                      <Text style={styles.createButtonText}>{getCreateButtonText()}</Text>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
      
      <AnimatedScrollView 
        style={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar with Enhanced Design */}
        <Animated.View entering={SlideInDown.delay(1000)}>
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
          <Animated.View entering={FadeIn.delay(1200)}>
            <LocationPermissionRequest onRequestPermission={requestPermission} />
          </Animated.View>
        )}
        
        {/* Category Filter */}
        <Animated.View entering={SlideInDown.delay(1400)}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={filterByCategory}
          />
        </Animated.View>
        
        {/* Listings with Staggered Animation */}
        <View style={styles.listingsContainer}>
          <Animated.View entering={FadeIn.delay(1600)} style={styles.listingsHeader}>
            <Text style={styles.listingsTitle}>
              {selectedCategory ? 'Résultats filtrés' : 'Annonces récentes'}
            </Text>
            <BlurView intensity={20} style={styles.countBadge}>
              <Text style={styles.listingsCount}>
                {safeFilteredListings.length}
              </Text>
            </BlurView>
          </Animated.View>
          
          {safeFilteredListings.length > 0 ? (
            safeFilteredListings.map((listing, index) => (
              <Animated.View
                key={`listing-${listing.id}-${index}-${listing.createdAt}`}
                entering={SlideInDown.delay(1800 + index * 100)}
              >
                <ListingCard listing={listing} />
              </Animated.View>
            ))
          ) : (
            <Animated.View entering={FadeIn.delay(2000)} style={styles.emptyState}>
              <BlurView intensity={20} style={styles.emptyStateCard}>
                <Text style={styles.emptyTitle}>Aucun résultat</Text>
                <Text style={styles.emptyText}>
                  Essayez de modifier vos critères de recherche
                </Text>
              </BlurView>
            </Animated.View>
          )}
        </View>
      </AnimatedScrollView>
      
      {/* Enhanced Floating Action Button for Clients */}
      {user && user.userType === 'client' && (
        <Animated.View style={[styles.fab, fabStyle]}>
          <TouchableOpacity 
            style={styles.fabButton}
            onPress={handleCreatePress}
            activeOpacity={0.8}
          >
            <BlurView intensity={80} style={styles.fabBlur}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.fabGradient}
              >
                <Plus size={24} color="#fff" />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    paddingTop: 45, // FIXED: Reduced from 50 to 45
    paddingBottom: 12, // FIXED: Reduced from 16 to 12
    zIndex: 10,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12, // FIXED: Reduced from 16 to 12
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 12, // FIXED: Reduced from 16 to 12
    width: '100%',
  },
  welcomeText: {
    fontSize: 24, // FIXED: Reduced from 28 to 24
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4, // FIXED: Reduced from 6 to 4
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14, // FIXED: Reduced from 15 to 14
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18, // FIXED: Reduced from 20 to 18
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8, // FIXED: Reduced from 10 to 8
    marginBottom: 12, // FIXED: Reduced from 16 to 12
    width: '100%',
    paddingHorizontal: 10,
  },
  statCardWrapper: {
    flex: 1,
    maxWidth: 60, // FIXED: Reduced from 70 to 60
    minWidth: 55, // FIXED: Reduced from 65 to 55
  },
  statCard: {
    borderRadius: 12, // FIXED: Reduced from 14 to 12
    padding: 8, // FIXED: Reduced from 10 to 8
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 60, // FIXED: Reduced from 70 to 60
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCardNumber: {
    fontSize: 12, // FIXED: Reduced from 14 to 12
    fontWeight: '700',
    color: '#fff',
    marginTop: 2, // FIXED: Reduced from 3 to 2
    marginBottom: 1,
    textAlign: 'center',
  },
  statCardLabel: {
    fontSize: 8, // FIXED: Reduced from 9 to 8
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  createButtonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  createButton: {
    borderRadius: 20, // FIXED: Reduced from 22 to 20
    overflow: 'hidden',
    minWidth: 160, // FIXED: Reduced from 180 to 160
  },
  createButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // FIXED: Reduced from 10 to 8
    paddingHorizontal: 16, // FIXED: Reduced from 18 to 16
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14, // FIXED: Reduced from 15 to 14
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  listingsContainer: {
    padding: 16,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listingsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  listingsCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 10,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  fabBlur: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
});