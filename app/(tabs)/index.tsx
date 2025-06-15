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
  
  // Landing page for non-authenticated users
  if (!isAuthenticated || !user) {
    const features = [
      {
        icon: Users,
        title: 'Trouvez des prestataires',
        description: 'DJ, photographes, traiteurs... Tous les professionnels pour vos événements'
      },
      {
        icon: Calendar,
        title: 'Organisez vos événements',
        description: 'Mariages, anniversaires, soirées d\'entreprise... Planifiez facilement'
      },
      {
        icon: Heart,
        title: 'Communiquez directement',
        description: 'Échangez avec les prestataires et recevez des devis personnalisés'
      },
      {
        icon: Star,
        title: 'Avis vérifiés',
        description: 'Consultez les avis clients pour faire le meilleur choix'
      }
    ];

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.landingScrollContent}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={[Colors.primary, Colors.secondary] as const}
            style={styles.heroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIcon}>
                <Sparkles size={40} color="#fff" />
              </View>
              <Text style={styles.heroTitle}>EventApp</Text>
              <Text style={styles.heroSubtitle}>
                La plateforme qui connecte clients, prestataires et établissements pour des événements réussis
              </Text>
              
              <View style={styles.heroButtons}>
                <Button
                  title="Commencer"
                  onPress={() => router.push('/(auth)/register')}
                  style={styles.primaryButton}
                  textStyle={styles.primaryButtonText}
                />
                <Button
                  title="Essayer la démo"
                  variant="outline"
                  onPress={() => router.push('/(auth)/demo')}
                  style={styles.demoButton}
                  textStyle={styles.demoButtonText}
                />
              </View>
            </View>
          </LinearGradient>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Pourquoi choisir EventApp ?</Text>
            
            {features.map((feature, index) => (
              <View key={`feature-${index}`} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color={Colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* User Types Section */}
          <View style={styles.userTypesSection}>
            <Text style={styles.sectionTitle}>Pour qui ?</Text>
            
            <View style={styles.userTypeCard}>
              <Text style={styles.userTypeTitle}>👤 Clients</Text>
              <Text style={styles.userTypeDescription}>
                Trouvez facilement des prestataires et établissements pour vos événements. 
                Comparez les offres et recevez des devis personnalisés.
              </Text>
            </View>
            
            <View style={styles.userTypeCard}>
              <Text style={styles.userTypeTitle}>💼 Prestataires</Text>
              <Text style={styles.userTypeDescription}>
                Proposez vos services, créez des devis et développez votre clientèle. 
                DJ, photographes, traiteurs, animateurs...
              </Text>
            </View>
            
            <View style={styles.userTypeCard}>
              <Text style={styles.userTypeTitle}>🏢 Établissements</Text>
              <Text style={styles.userTypeDescription}>
                Proposez votre lieu pour des événements. Restaurants, salles de réception, 
                châteaux, domaines...
              </Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary] as const}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
              <Text style={styles.ctaSubtitle}>
                Rejoignez EventApp et donnez vie à vos événements
              </Text>
              
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.ctaButtonText}>Créer un compte</Text>
                  <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={styles.loginLinkText}>Déjà inscrit ? Se connecter</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // Authenticated user experience
  const getWelcomeMessage = () => {
    switch (user.userType) {
      case 'provider':
        return `Bonjour ${user.name.split(' ')[0]} 👋`;
      case 'business':
        return `Bienvenue ${user.name} 🏢`;
      case 'client':
        return `Salut ${user.name.split(' ')[0]} 😊`;
      default:
        return `Bonjour ${user.name.split(' ')[0]} 👋`;
    }
  };
  
  const getSubtitle = () => {
    switch (user.userType) {
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
    switch (user.userType) {
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
    if (user.userType === 'client') {
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
                <Text style={styles.statCardNumber}>{user.rating?.toFixed(1) || '4.8'}</Text>
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
            
            {user.userType !== 'client' && (
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
                key={`listing-${listing.id}-${index}`}
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
  landingScrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  heroButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  demoButton: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  userTypesSection: {
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
  },
  userTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  userTypeDescription: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  ctaSection: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  loginLink: {
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
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