import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import CategoryFilter from '@/components/CategoryFilter';
import Colors from '@/constants/colors';
import { categories } from '@/constants/categories';
import { MapPin, TrendingUp, Star } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    listings = [], 
    filteredListings = [], 
    fetchListings, 
    filterByCategory,
    filterBySearch,
  } = useListings();
  const { city, requestPermission } = useLocation();

  useEffect(() => {
    if (!Array.isArray(listings) || listings.length === 0) {
      fetchListings();
    }
  }, []);

  const handleSearch = (text: string) => {
    filterBySearch(text);
    if (text.trim()) {
      router.push('/search');
    }
  };

  const handleCategoryPress = (category: string) => {
    filterByCategory(category);
    router.push(`/search?category=${category}`);
  };

  const handleLocationPress = () => {
    requestPermission();
  };

  // Get recent listings (last 10)
  const recentListings = Array.isArray(filteredListings) 
    ? filteredListings.slice(0, 6) 
    : [];

  // Get featured categories
  const featuredCategories = categories.slice(0, 6);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Bonjour {user?.name ? user.name.split(' ')[0] : 'Utilisateur'} 👋
          </Text>
          <Text style={styles.subtitleText}>
            Trouvez les meilleurs prestataires pour vos événements
          </Text>
        </View>

        {city && (
          <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.locationText}>{city}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value=""
          onChangeText={handleSearch}
          onLocationPress={handleLocationPress}
          placeholder="Rechercher un service, un lieu..."
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catégories populaires</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {featuredCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.name)}
            >
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Listings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Annonces récentes</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recentListings.length > 0 ? (
          <FlatList
            data={recentListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.listingSeparator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Star size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Aucune annonce pour le moment</Text>
            <Text style={styles.emptyText}>
              Les nouvelles annonces apparaîtront ici
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/create')}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionEmoji}>✨</Text>
            </View>
            <Text style={styles.quickActionTitle}>Créer une annonce</Text>
            <Text style={styles.quickActionText}>Proposez vos services</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/search')}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionEmoji}>🔍</Text>
            </View>
            <Text style={styles.quickActionTitle}>Rechercher</Text>
            <Text style={styles.quickActionText}>Trouvez des prestataires</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcomeContainer: {
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 20,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  listingSeparator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});