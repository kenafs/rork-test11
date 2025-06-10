import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { Heart, Trash2 } from 'lucide-react-native';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { favoriteListings, clearFavorites } = useFavorites();
  
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Favoris' }} />
        <View style={styles.loginPrompt}>
          <Heart size={64} color={Colors.textLight} />
          <Text style={styles.loginTitle}>Connectez-vous pour voir vos favoris</Text>
          <Text style={styles.loginDescription}>
            Sauvegardez vos annonces préférées et retrouvez-les facilement.
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
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Mes favoris',
          headerRight: () => (
            favoriteListings.length > 0 ? (
              <TouchableOpacity onPress={clearFavorites} style={styles.clearButton}>
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      {favoriteListings.length > 0 ? (
        <FlatList
          data={favoriteListings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore ajouté d'annonces à vos favoris.
          </Text>
          <Text style={styles.emptyHint}>
            Appuyez sur le ❤️ sur une annonce pour l'ajouter à vos favoris.
          </Text>
          <Button 
            title="Découvrir les annonces" 
            onPress={() => router.push('/(tabs)/search')}
            style={styles.discoverButton}
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
  listContent: {
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
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  discoverButton: {
    backgroundColor: Colors.primary,
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
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
});