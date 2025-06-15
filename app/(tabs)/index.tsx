import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavorites } from '@/hooks/useFavorites';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, MapPin, Star, Users, Calendar, Heart, TrendingUp, Sparkles, ArrowRight } from 'lucide-react-native';

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
  
  // Authenticated user experience - CRITICAL FIX: Remove landing page for authenticated users
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
    if (user?.userType === 'client') {
      router.push('/(tabs)/search');
    } else {
      router.push('/(tabs)/create');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
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
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
            <Text style={styles.subtitleText}>{getSubtitle()}</Text>
            
            {/* Enhanced Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Heart size={16} color="#FF6B6B" />
                <Text style={styles.statCardNumber}>{safeFavorites.length || 0}</Text>
                <Text style={styles.statCardLabel}>Favoris</Text>
              </View>
              <View style={styles.statCard}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.statCardNumber}>{user?.rating?.toFixed(1) || '4.8'}</Text>
                <Text style={styles.statCardLabel}>Note</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={16} color="#10B981" />
                <Text style={styles.statCardNumber}>{safeFilteredListings.length}</Text>
                <Text style={styles.statCardLabel}>Offres</Text>
              </View>
              <View style={styles.statCard}>
                <Sparkles size={16} color="#8B5CF6" />
                <Text style={styles.statCardNumber}>12</Text>
                <Text style={styles.statCardLabel}>En ligne</Text>
              </View>
            </View>
            
            {user && user.userType !== 'client' && (
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreatePress}
                activeOpacity={0.8}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.createButtonText}>{getCreateButtonText()}</Text>
              </TouchableOpacity>
            )}
          </View>
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
        
        {/* Listings */}
        <View style={styles.listingsContainer}>
          <View style={styles.listingsHeader}>
            <Text style={styles.listingsTitle}>
              {selectedCategory ? 'Résultats filtrés' : 'Annonces récentes'}
            </Text>
            <Text style={styles.listingsCount}>
              {safeFilteredListings.length} résultat{safeFilteredListings.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          {safeFilteredListings.length > 0 ? (
            safeFilteredListings.map((listing, index) => (
              <ListingCard
                key={`listing-${listing.id}-${index}-${listing.createdAt}`}
                listing={listing}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>
                Essayez de modifier vos critères de recherche
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button for Clients */}
      {user && user.userType === 'client' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleCreatePress}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
  headerContent: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCardNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingsContainer: {
    padding: 16,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  listingsCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});