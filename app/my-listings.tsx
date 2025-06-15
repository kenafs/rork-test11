import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import Colors from '@/constants/colors';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import { Plus, FileText } from 'lucide-react-native';

export default function MyListingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getUserListings, deleteListing, isLoading } = useListings();
  
  const userListings = getUserListings();
  
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Mes annonces" }} />
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginSubtitle}>
            Vous devez être connecté pour voir vos annonces
          </Text>
          <Button
            title="Se connecter"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }
  
  const handleDeleteListing = (listingId: string) => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(listingId);
              Alert.alert('Succès', 'Annonce supprimée avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          }
        }
      ]
    );
  };
  
  const getTitle = () => {
    switch (user.userType) {
      case 'provider':
        return 'Mes annonces';
      case 'business':
        return 'Mes offres';
      default:
        return 'Mes demandes';
    }
  };
  
  const getCreateButtonText = () => {
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
      <Stack.Screen options={{ 
        title: getTitle(),
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FileText size={32} color={Colors.primary} />
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>
            {userListings.length} {userListings.length > 1 ? 'annonces' : 'annonce'}
          </Text>
        </View>
        
        {userListings.length > 0 ? (
          <View style={styles.listingsContainer}>
            {userListings.map((listing, index) => (
              <ListingCard 
                key={`my-listing-${listing.id}-${index}`} 
                listing={listing} 
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {user.userType === 'provider' ? 'Aucune annonce' : 
               user.userType === 'business' ? 'Aucune offre' : 'Aucune demande'}
            </Text>
            <Text style={styles.emptyText}>
              {user.userType === 'provider' 
                ? "Vous n'avez pas encore publié d'annonces."
                : user.userType === 'business'
                ? "Vous n'avez pas encore publié d'offres."
                : "Vous n'avez pas encore publié de demandes."
              }
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/create')}
            >
              <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>{getCreateButtonText()}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {userListings.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={`+ ${getCreateButtonText()}`}
            onPress={() => router.push('/(tabs)/create')}
            fullWidth
            style={styles.footerButton}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  listingsContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  footerButton: {
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
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
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