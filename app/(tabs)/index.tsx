import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Plus, Sparkles } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    filteredListings, 
    isLoading, 
    fetchListings, 
    refreshListings,
    filterBySearch,
    filterByCategory 
  } = useListings();
  const { 
    latitude, 
    longitude, 
    city, 
    hasPermission, 
    requestPermission 
  } = useLocation();

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handleSearch = (query: string) => {
    filterBySearch(query);
  };

  const handleCategoryFilter = (category: string) => {
    filterByCategory(category);
  };

  const handleRefresh = async () => {
    await refreshListings();
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Bonjour {user.name.split(' ')[0]} !</Text>
            <Text style={styles.welcomeSubtext}>
              {user.userType === 'provider' ? 'Gérez vos services' :
               user.userType === 'business' ? 'Gérez vos offres' : 'Trouvez vos prestataires'}
            </Text>
          </View>
          
          {hasPermission && city && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.locationText}>{city}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Location Permission Request */}
      {!hasPermission && (
        <LocationPermissionRequest onRequestPermission={requestPermission} />
      )}

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter onCategorySelect={handleCategoryFilter} />
      </View>

      {/* Quick Actions */}
      {user.userType !== 'client' && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.quickActionText}>
                {user.userType === 'provider' ? 'Créer une annonce' : 'Publier une offre'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Listings */}
      <ScrollView 
        style={styles.listingsContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listingsHeader}>
          <Sparkles size={20} color={Colors.primary} />
          <Text style={styles.listingsTitle}>
            {filteredListings.length > 0 
              ? `${filteredListings.length} annonce${filteredListings.length > 1 ? 's' : ''} trouvée${filteredListings.length > 1 ? 's' : ''}`
              : 'Aucune annonce trouvée'
            }
          </Text>
        </View>

        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucune annonce disponible</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos filtres ou revenez plus tard
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 10,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  listingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 20,
  },
});