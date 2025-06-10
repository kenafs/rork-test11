import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { DemoAccount } from '@/types';
import Colors from '@/constants/colors';
import { Image } from 'expo-image';
import { Star, MapPin, Globe, Instagram, ArrowRight } from 'lucide-react-native';

const demoAccounts: DemoAccount[] = [
  {
    name: 'Sophie Martin - DJ Pro',
    email: 'sophie@djpro.com',
    userType: 'provider',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    description: 'DJ professionnelle spécialisée dans les événements d\'entreprise et mariages. Plus de 10 ans d\'expérience.',
    specialties: 'DJ, Animation, Sonorisation',
    website: 'djpro-sophie.com',
    instagram: '@djpro_sophie',
    rating: 4.8,
    reviewCount: 127,
    city: 'Paris',
    services: ['DJ', 'Animation', 'Sonorisation', 'Éclairage'],
    priceRange: { min: 300, max: 1500 },
    availability: ['Soir', 'Week-end', 'Jours fériés'],
  },
  {
    name: 'Restaurant Le Gourmet',
    email: 'contact@legourmet.com',
    userType: 'business',
    profileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    description: 'Restaurant gastronomique avec terrasse, spécialisé dans l\'organisation d\'événements privés et réceptions.',
    address: '15 Rue de la Paix, 75001 Paris',
    website: 'legourmet-paris.fr',
    instagram: '@legourmet_paris',
    rating: 4.6,
    reviewCount: 89,
    city: 'Paris',
    venueType: 'Restaurant',
    capacity: 80,
    amenities: ['Terrasse', 'Cuisine équipée', 'Bar', 'Parking', 'Climatisation'],
  },
  {
    name: 'Marc Dubois - Photographe',
    email: 'marc@photopro.com',
    userType: 'provider',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop',
    description: 'Photographe professionnel spécialisé dans les mariages et événements d\'entreprise.',
    specialties: 'Photographie, Vidéographie',
    website: 'photopro-marc.com',
    instagram: '@photopro_marc',
    rating: 4.9,
    reviewCount: 156,
    city: 'Lyon',
    services: ['Photographie', 'Vidéographie', 'Retouche', 'Drone'],
    priceRange: { min: 500, max: 2000 },
    availability: ['Journée', 'Soir', 'Week-end'],
  },
  {
    name: 'Salle des Fêtes Élégance',
    email: 'contact@elegance-events.com',
    userType: 'business',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
    description: 'Salle de réception moderne avec vue panoramique, parfaite pour vos événements d\'exception.',
    address: '42 Avenue des Champs, 69000 Lyon',
    website: 'elegance-events.com',
    instagram: '@elegance_events',
    rating: 4.7,
    reviewCount: 203,
    city: 'Lyon',
    venueType: 'Salle de réception',
    capacity: 150,
    amenities: ['Vue panoramique', 'Cuisine équipée', 'Bar', 'Parking privé', 'Sonorisation', 'Éclairage LED'],
  },
  {
    name: 'Emma Rousseau - Traiteur',
    email: 'emma@saveurs-events.com',
    userType: 'provider',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop',
    description: 'Chef traiteur passionnée, spécialisée dans la cuisine française moderne et les buffets créatifs.',
    specialties: 'Traiteur, Cuisine française, Buffets',
    website: 'saveurs-events.com',
    instagram: '@saveurs_events',
    rating: 4.9,
    reviewCount: 98,
    city: 'Marseille',
    services: ['Traiteur', 'Buffets', 'Cocktails', 'Service'],
    priceRange: { min: 25, max: 80 },
    availability: ['Journée', 'Soir', 'Week-end'],
  },
  {
    name: 'Pierre Moreau',
    email: 'pierre@client.com',
    userType: 'client',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    description: 'Organisateur d\'événements d\'entreprise, toujours à la recherche des meilleurs prestataires.',
    rating: 4.5,
    reviewCount: 23,
    city: 'Toulouse',
  },
];

export default function DemoAccountsScreen() {
  const router = useRouter();
  const { loginWithDemo, isLoading } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleDemoLogin = async (account: DemoAccount) => {
    setSelectedAccount(account.email);
    
    try {
      const success = await loginWithDemo(account);
      
      if (success) {
        Alert.alert(
          'Connexion réussie !',
          `Vous êtes maintenant connecté en tant que ${account.name}`,
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter avec ce compte démo');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setSelectedAccount(null);
    }
  };

  const renderAccount = (account: DemoAccount) => {
    const isSelected = selectedAccount === account.email;
    const isLoadingThis = isLoading && isSelected;

    return (
      <TouchableOpacity
        key={account.email}
        style={[styles.accountCard, isSelected && styles.selectedCard]}
        onPress={() => handleDemoLogin(account)}
        disabled={isLoading}
      >
        <View style={styles.accountHeader}>
          <Image source={{ uri: account.profileImage }} style={styles.profileImage} />
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.typeText}>
                {account.userType === 'provider' ? '🎯 Prestataire' : 
                 account.userType === 'business' ? '🏢 Établissement' : '👤 Client'}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{account.rating}</Text>
              <Text style={styles.reviewText}>({account.reviewCount} avis)</Text>
            </View>
          </View>
          {isLoadingThis ? (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>...</Text>
            </View>
          ) : (
            <ArrowRight size={20} color={Colors.primary} />
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {account.description}
        </Text>

        <View style={styles.accountDetails}>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.locationText}>{account.city}</Text>
          </View>

          {account.website && (
            <View style={styles.linkContainer}>
              <Globe size={14} color={Colors.primary} />
              <Text style={styles.linkText}>{account.website}</Text>
            </View>
          )}

          {account.instagram && (
            <View style={styles.linkContainer}>
              <Instagram size={14} color="#E4405F" />
              <Text style={styles.linkText}>{account.instagram}</Text>
            </View>
          )}
        </View>

        {account.userType === 'provider' && account.services && (
          <View style={styles.servicesContainer}>
            {account.services.slice(0, 3).map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
            {account.services.length > 3 && (
              <Text style={styles.moreServices}>+{account.services.length - 3}</Text>
            )}
          </View>
        )}

        {account.userType === 'business' && account.amenities && (
          <View style={styles.servicesContainer}>
            {account.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{amenity}</Text>
              </View>
            ))}
            {account.amenities.length > 3 && (
              <Text style={styles.moreServices}>+{account.amenities.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Comptes démo',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' }
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ Essayez avec un compte démo</Text>
          <Text style={styles.subtitle}>
            Découvrez l'application avec des profils pré-configurés pour chaque type d'utilisateur
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Prestataires</Text>
          <Text style={styles.sectionDescription}>
            Proposez vos services et créez des devis
          </Text>
          {demoAccounts
            .filter(account => account.userType === 'provider')
            .map(renderAccount)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Établissements</Text>
          <Text style={styles.sectionDescription}>
            Proposez vos lieux et espaces
          </Text>
          {demoAccounts
            .filter(account => account.userType === 'business')
            .map(renderAccount)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Clients</Text>
          <Text style={styles.sectionDescription}>
            Recherchez et contactez des prestataires
          </Text>
          {demoAccounts
            .filter(account => account.userType === 'client')
            .map(renderAccount)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Ces comptes sont pré-remplis avec des données d'exemple pour vous permettre de tester toutes les fonctionnalités de l'application.
          </Text>
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
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  typeContainer: {
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  accountDetails: {
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  linkText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: 'rgba(62, 146, 204, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  moreServices: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
    paddingVertical: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});