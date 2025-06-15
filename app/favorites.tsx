import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import Colors from '@/constants/colors';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import { Heart, User } from 'lucide-react-native';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getFavoriteListings, setCurrentUser } = useFavorites();
  
  // Set current user when component mounts or user changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user.id);
    }
  }, [user, setCurrentUser]);
  
  const favoriteListings = getFavoriteListings();
  
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Favoris" }} />
        <View style={styles.loginPrompt}>
          <User size={64} color={Colors.textLight} />
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginDescription}>
            Connectez-vous pour voir vos favoris
          </Text>
          <Button 
            title="Se connecter" 
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }
  
  const renderFavoriteItem = ({ item }: { item: any }) => (
    <ListingCard listing={item} />
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Mes favoris",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      {favoriteListings.length > 0 ? (
        <FlatList
          data={favoriteListings}
          keyExtractor={(item) => `favorite-${item.id}`}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore ajouté d'annonces à vos favoris.
            Explorez les annonces et ajoutez celles qui vous intéressent !
          </Text>
          <Button 
            title="Explorer les annonces"
            onPress={() => router.push('/(tabs)/search')}
            style={styles.exploreButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    paddingHorizontal: 32,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
});