import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useLanguage } from '@/hooks/useLanguage';
import ListingCard from '@/components/ListingCard';
import CategoryFilter from '@/components/CategoryFilter';
import Button from '@/components/Button';
import Colors, { gradients } from '@/constants/colors';
import { Sparkles, Users, MapPin, Calendar, Star, Plus, Zap, Music, Utensils, Camera, Palette, PartyPopper, Mic, Heart, Gift, Rocket, Crown, Flame, Coffee, Headphones, Gamepad2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const { 
    listings, 
    filteredListings, 
    isLoading, 
    fetchListings, 
    filterByCategory, 
    filterBySearch,
    filterByLocation,
    selectedCategory,
  } = useListings();
  const { 
    latitude, 
    longitude, 
    city, 
    permissionStatus, 
    requestPermission, 
    isLoading: isLocationLoading 
  } = useLocation();
  const { favorites } = useFavorites();
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch listings on mount
  useEffect(() => {
    fetchListings();
  }, []);
  
  // Apply location filter when location is available
  useEffect(() => {
    if (latitude && longitude) {
      filterByLocation(latitude, longitude);
    }
  }, [latitude, longitude]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };
  
  // Handle category selection with navigation
  const handleCategorySelect = (category: string | null) => {
    filterByCategory(category);
    // Navigate to search page with the selected category
    router.push({
      pathname: '/(tabs)/search',
      params: { category: category || 'all' }
    });
  };

  // Get stats for display
  const totalListings = listings.length;
  const activeProviders = new Set(listings.map(l => l.createdBy)).size;
  const averageRating = listings.reduce((acc, l) => acc + (l.creatorRating || 0), 0) / listings.length || 0;

  // Featured categories with modern card design
  const featuredCategories = [
    { 
      id: 'dj_services', 
      name: 'DJ & Musique', 
      icon: Music, 
      gradient: gradients.music,
      emoji: '🎵',
      description: 'Ambiance garantie',
      illustration: '🎧'
    },
    { 
      id: 'catering', 
      name: 'Traiteur', 
      icon: Utensils, 
      gradient: gradients.catering,
      emoji: '🍽️',
      description: 'Saveurs d\'exception',
      illustration: '👨‍🍳'
    },
    { 
      id: 'venue_rental', 
      name: 'Lieux', 
      icon: Calendar, 
      gradient: gradients.venue,
      emoji: '🏛️',
      description: 'Espaces magiques',
      illustration: '🏰'
    },
    { 
      id: 'staff_services', 
      name: 'Personnel', 
      icon: Users, 
      gradient: gradients.staff,
      emoji: '👥',
      description: 'Service premium',
      illustration: '💼'
    },
  ];

  // Quick actions for authenticated users
  const quickActions = [
    { 
      title: user?.userType === 'business' ? 'Publier' : 'Créer', 
      icon: Plus, 
      color: Colors.primary, 
      action: () => router.push('/(tabs)/create'), 
      bg: '#EEF2FF' 
    },
    { title: 'Favoris', icon: Heart, color: Colors.neonPink, action: () => router.push('/favorites'), bg: '#FDF2F8' },
    { title: 'Messages', icon: Mic, color: Colors.electricBlue, action: () => router.push('/(tabs)/messages'), bg: '#EFF6FF' },
  ];

  // Render compact header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={gradients.primary}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <View style={styles.titleRow}>
              <Text style={styles.greeting}>{t('greeting')}</Text>
              {city && (
                <TouchableOpacity style={styles.locationChip} onPress={requestPermission}>
                  <MapPin size={12} color="#fff" />
                  <Text style={styles.locationChipText}>{city}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.tagline}>
              {user?.userType === 'business' ? t('taglineBusiness') : t('taglineProvider')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Render hero section with stats
  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}
          onPress={() => router.push('/(tabs)/search')}
        >
          <View style={[styles.statIcon, { backgroundColor: Colors.vibrantOrange }]}>
            <Rocket size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{totalListings}</Text>
          <Text style={styles.statLabel}>Annonces actives</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}
          onPress={() => router.push('/reviews')}
        >
          <View style={[styles.statIcon, { backgroundColor: Colors.accent }]}>
            <Star size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render featured categories with modern cards
  const renderFeaturedCategories = () => (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Catégories populaires</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {featuredCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { marginLeft: index === 0 ? 20 : 16 }]}
            onPress={() => handleCategorySelect(category.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={category.gradient}
              style={styles.categoryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.categoryTop}>
                <Text style={styles.categoryIllustration}>{category.illustration}</Text>
                <View style={styles.categorySparkle}>
                  <Sparkles size={14} color="#fff" fill="#fff" />
                </View>
              </View>
              <View style={styles.categoryBottom}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render quick actions for authenticated users
  const renderQuickActions = () => {
    if (!isAuthenticated) return null;
    
    return (
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { backgroundColor: action.bg }]}
              onPress={action.action}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <action.icon size={20} color="#fff" />
              </View>
              <Text style={[styles.quickActionText, { color: action.color }]}>{action.title}</Text>
              {action.title === 'Favoris' && favorites.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{favorites.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // If not authenticated, show enhanced login prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderHeroSection()}
          {renderFeaturedCategories()}
          
          <View style={styles.loginPromptModern}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.loginContent}>
                <Text style={styles.loginEmoji}>🚀</Text>
                <Text style={styles.loginTitle}>Rejoins la communauté !</Text>
                <Text style={styles.loginDescription}>
                  Découvre les meilleurs prestataires et organise des événements mémorables
                </Text>
                
                <View style={styles.loginFeatures}>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✨</Text>
                    <Text style={styles.featureText}>Accès illimité</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>💬</Text>
                    <Text style={styles.featureText}>Chat direct</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>⭐</Text>
                    <Text style={styles.featureText}>Avis vérifiés</Text>
                  </View>
                </View>
                
                <View style={styles.buttonContainer}>
                  <Button 
                    title="🎉 Commencer maintenant" 
                    onPress={() => router.push('/(auth)/register')}
                    style={styles.primaryActionButton}
                  />
                  <Button 
                    title="Compte démo" 
                    variant="outline"
                    onPress={() => router.push('/(auth)/demo')}
                    style={styles.secondaryActionButton}
                  />
                  <Button 
                    title="J'ai déjà un compte" 
                    variant="outline"
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.secondaryActionButton}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
          
          <View style={styles.previewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Aperçu des annonces</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listingsContainer}>
              {filteredListings.slice(0, 3).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // Main authenticated view
  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeroSection()}
        {renderQuickActions()}
        {renderFeaturedCategories()}
        
        <View style={styles.listingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Dernières annonces</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
          ) : filteredListings.length > 0 ? (
            <View style={styles.listingsContainer}>
              {filteredListings.slice(0, 5).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎭</Text>
              <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
              <Text style={styles.emptyText}>
                {user?.userType === 'business' 
                  ? 'Publiez votre première offre pour attirer des clients !'
                  : 'Essaie de modifier tes filtres ou crée la première annonce !'}
              </Text>
              <Button 
                title={user?.userType === 'business' ? '🏢 Publier une offre' : '🎯 Créer une annonce'}
                onPress={() => router.push('/(tabs)/create')}
                style={styles.createButton}
              />
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
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  headerGradient: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    paddingTop: 8,
  },
  welcomeSection: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  locationChipText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    color: '#FFD700',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  featuredSection: {
    marginBottom: 32,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryCard: {
    width: 160,
    height: 180,
    marginRight: 16,
  },
  categoryGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryIllustration: {
    fontSize: 36,
  },
  categorySparkle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
  },
  categoryBottom: {
    marginTop: 'auto',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  quickActionsSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  loginPromptModern: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  loginGradient: {
    padding: 28,
  },
  loginContent: {
    alignItems: 'center',
  },
  loginEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 28,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryActionButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  secondaryActionButton: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  listingsSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  listingsContainer: {
    alignItems: 'center',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
});