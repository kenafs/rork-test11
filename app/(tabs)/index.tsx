import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import { MapPin, Plus, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    filteredListings, 
    isLoading, 
    fetchListings, 
    refreshListings,
    filterBySearch,
    filterByCategory,
    clearFilters 
  } = useListings();
  const { city, hasPermission, requestPermission } = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshListings();
    setRefreshing(false);
  };

  // Handle search
  const handleSearch = (query: string) => {
    filterBySearch(query);
  };

  // Handle category filter
  const handleCategoryFilter = (category: string | null) => {
    filterByCategory(category);
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Get appropriate CTA text based on user type
  const getCreateButtonText = () => {
    if (!user) return 'Créer une annonce';
    
    switch (user.userType) {
      case 'provider':
        return 'Créer une annonce';
      case 'business':
        return 'Publier une offre';
      default:
        return 'Créer une demande';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>
              {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </Text>
            <Text style={styles.subtitle}>
              Trouvez les meilleurs prestataires pour vos événements
            </Text>
          </View>
          
          {city && (
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
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => {
            if (!isAuthenticated) {
              router.push('/(auth)/login');
            } else {
              router.push('/(tabs)/create');
            }
          }}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary] as const}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>{getCreateButtonText()}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Sparkles size={20} color={Colors.primary} />
          <Text style={styles.exploreButtonText}>Explorer tout</Text>
        </TouchableOpacity>
      </View>

      {/* Listings */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listingsHeader}>
          <Text style={styles.listingsTitle}>
            ✨ Annonces récentes
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        {isLoading && filteredListings.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des annonces...</Text>
          </View>
        ) : filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
            <Text style={styles.emptyText}>
              Essayez de modifier vos filtres ou créez la première annonce !
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => {
                if (!isAuthenticated) {
                  router.push('/(auth)/login');
                } else {
                  router.push('/(tabs)/create');
                }
              }}
            >
              <Text style={styles.emptyButtonText}>{getCreateButtonText()}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        )}

        {/* Bottom spacing */}
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    gap: 16,
  },
  greetingSection: {
    gap: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 16,
    gap: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  createButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
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
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listingsGrid: {
    gap: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});