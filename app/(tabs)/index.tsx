import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import { MapPin, Plus, Star, TrendingUp, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { listings, isLoading, fetchListings } = useListings();
  const { latitude, longitude, city, permissionStatus, requestPermission } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if we have location permission
  const hasPermission = permissionStatus === 'granted';

  // Filter listings based on selected category
  const filteredListings = selectedCategory 
    ? listings.filter(listing => listing.category === selectedCategory)
    : listings;

  // Get featured listings (top rated)
  const featuredListings = listings
    .filter(listing => listing.creatorRating && listing.creatorRating >= 4.5)
    .slice(0, 5);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  // Get greeting based on user type
  const getGreeting = () => {
    if (!user) return "Découvrez les meilleurs prestataires";
    
    switch (user.userType) {
      case 'provider':
        return `Bonjour ${user.name.split(' ')[0]} ! 🎵`;
      case 'business':
        return `Bonjour ${user.name} ! 🏢`;
      case 'client':
        return `Bonjour ${user.name.split(' ')[0]} ! 👋`;
      default:
        return `Bonjour ${user.name.split(' ')[0]} !`;
    }
  };

  // Get subtitle based on user type
  const getSubtitle = () => {
    if (!user) return "Trouvez le prestataire parfait pour votre événement";
    
    switch (user.userType) {
      case 'provider':
        return "Gérez vos annonces et développez votre activité";
      case 'business':
        return "Gérez votre établissement et vos offres";
      case 'client':
        return "Trouvez le prestataire parfait pour votre événement";
      default:
        return "Bienvenue sur votre plateforme événementielle";
    }
  };

  // Get create button text based on user type
  const getCreateButtonText = () => {
    if (!user) return "✨ Créer une annonce";
    
    switch (user.userType) {
      case 'provider':
        return "✨ Créer une annonce";
      case 'business':
        return "🏢 Publier une offre";
      case 'client':
        return "🔍 Rechercher des services";
      default:
        return "✨ Créer une annonce";
    }
  };

  // Get create button subtitle based on user type
  const getCreateButtonSubtitle = () => {
    if (!user) return "Partagez votre talent avec la communauté !";
    
    switch (user.userType) {
      case 'provider':
        return "Partagez votre talent avec la communauté !";
      case 'business':
        return "Proposez vos services et espaces !";
      case 'client':
        return "Trouvez les meilleurs prestataires !";
      default:
        return "Rejoignez notre communauté !";
    }
  };

  // Handle create button press based on user type
  const handleCreatePress = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (user?.userType === 'client') {
      router.push('/(tabs)/search');
    } else {
      router.push('/create-listing');
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(tabs)/search',
        params: { query: searchQuery }
      });
    } else {
      router.push('/(tabs)/search');
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (!hasPermission) {
    return <LocationPermissionRequest onRequestPermission={requestPermission} />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </View>
          
          {city && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.locationText}>{city}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
          onLocationPress={handleSearch}
          placeholder="Rechercher des prestataires..."
        />
      </View>

      {/* Quick Action Card */}
      <View style={styles.quickActionContainer}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleCreatePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.accent, '#FF7F50'] as const}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionContent}>
              <View style={styles.quickActionIcon}>
                <Plus size={24} color="#fff" />
              </View>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>{getCreateButtonText()}</Text>
                <Text style={styles.quickActionSubtitle}>{getCreateButtonSubtitle()}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Featured Section */}
      {featuredListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Star size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>⭐ Prestataires recommandés</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/search')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {featuredListings.map((listing) => (
              <View key={listing.id} style={styles.featuredCard}>
                <ListingCard listing={listing} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Listings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>🔥 Dernières annonces</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/search')}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : filteredListings.length > 0 ? (
          filteredListings.slice(0, 6).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
            <Text style={styles.emptyText}>
              {selectedCategory 
                ? 'Aucune annonce dans cette catégorie pour le moment.'
                : 'Soyez le premier à publier une annonce !'}
            </Text>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>📊 Notre communauté</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Prestataires</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color={Colors.accent} />
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Événements</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.secondary} />
            <Text style={styles.statNumber}>4.8/5</Text>
            <Text style={styles.statLabel}>Satisfaction</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
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
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
  },
  quickActionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    padding: 20,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});