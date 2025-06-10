import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';
import Colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ListingCard from '@/components/ListingCard';
import LocationPermissionRequest from '@/components/LocationPermissionRequest';
import { Plus, MapPin, Filter } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    filteredListings, 
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
    hasPermission, 
    requestPermission 
  } = useLocation();
  const { t } = useLanguage();
  
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
  
  const getWelcomeMessage = () => {
    if (!user) return "Découvrez les meilleurs prestataires";
    
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
    if (!user) return "Trouvez le prestataire parfait pour votre événement";
    
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
    if (!user) return "Se connecter";
    
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
    if (!user) {
      router.push('/(auth)/login');
    } else if (user.userType === 'client') {
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
            <Text style={styles.subtitleText}>{getSubtitle()}</Text>
            
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
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          onLocationPress={handleLocationPress}
          onSearch={handleSearch}
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
              {filteredListings.length} résultat{filteredListings.length > 1 ? 's' : ''}
            </Text>
          </View>
          
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPress={() => router.push(`/listing/${listing.id}`)}
            />
          ))}
          
          {filteredListings.length === 0 && !isLoading && (
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
    bottom: 20,
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