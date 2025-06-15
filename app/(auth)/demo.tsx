import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { DemoAccount } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { User, Building, Briefcase } from 'lucide-react-native';

const demoAccounts: DemoAccount[] = [
  // Client Demo Accounts
  {
    userType: 'client',
    name: 'Sophie Martin',
    email: 'sophie.martin@demo.com',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    description: 'Organisatrice d\'événements privés, toujours à la recherche de nouveaux prestataires de qualité.',
    city: 'Paris',
    rating: 4.7,
    reviewCount: 15,
  },
  {
    userType: 'client',
    name: 'Thomas Leroy',
    email: 'thomas.leroy@demo.com',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    description: 'Responsable événementiel en entreprise. Organise régulièrement des séminaires, team building et soirées d\'entreprise.',
    city: 'Toulouse',
    rating: 4.6,
    reviewCount: 28,
  },
  {
    userType: 'client',
    name: 'Emma Dubois',
    email: 'emma.dubois@demo.com',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop',
    description: 'Future mariée en recherche de prestataires pour son mariage. Passionnée par l\'organisation d\'événements.',
    city: 'Lyon',
    rating: 4.8,
    reviewCount: 12,
  },
  
  // Provider Demo Accounts
  {
    userType: 'provider',
    name: 'Alexandre Dubois - DJ Pro',
    email: 'alex.dubois@djpro.com',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop',
    description: 'DJ professionnel avec 10 ans d\'expérience. Spécialisé dans les mariages, soirées d\'entreprise et événements privés.',
    specialties: 'DJ, Animation, Sonorisation',
    website: 'djpro-alexandre.com',
    instagram: '@djpro_alexandre',
    city: 'Lyon',
    rating: 4.9,
    reviewCount: 156,
    services: ['DJ', 'Animation', 'Sonorisation', 'Éclairage'],
    priceRange: { min: 400, max: 2000 },
    availability: ['Soir', 'Week-end', 'Jours fériés'],
  },
  {
    userType: 'provider',
    name: 'Camille Rousseau - Photographe',
    email: 'camille@photo-events.fr',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop',
    description: 'Photographe spécialisée dans les événements. Mariages, baptêmes, anniversaires, événements d\'entreprise. Style naturel et authentique.',
    specialties: 'Photographie, Reportage, Portrait',
    website: 'photo-events-camille.fr',
    instagram: '@camille_photo_events',
    city: 'Marseille',
    rating: 4.8,
    reviewCount: 92,
    services: ['Photographie', 'Reportage', 'Portrait', 'Retouche'],
    priceRange: { min: 300, max: 1200 },
    availability: ['Journée', 'Soir', 'Week-end'],
  },
  {
    userType: 'provider',
    name: 'Julien Moreau - Traiteur',
    email: 'julien@traiteur-moreau.fr',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop',
    description: 'Chef traiteur avec 15 ans d\'expérience. Cuisine française raffinée pour tous vos événements. Service complet avec personnel.',
    specialties: 'Traiteur, Cuisine française, Service',
    website: 'traiteur-moreau.fr',
    instagram: '@traiteur_moreau',
    city: 'Nice',
    rating: 4.9,
    reviewCount: 203,
    services: ['Traiteur', 'Service', 'Cuisine française', 'Buffet'],
    priceRange: { min: 25, max: 80 },
    availability: ['Journée', 'Soir', 'Week-end'],
  },
  
  // Business Demo Accounts
  {
    userType: 'business',
    name: 'Château de Malmaison',
    email: 'events@chateau-malmaison.fr',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f29c8e8d4b?w=800&auto=format&fit=crop',
    description: 'Château historique du 18ème siècle proposant ses salons et jardins pour vos événements d\'exception. Mariages, séminaires, réceptions.',
    address: '1 Avenue du Château, 92500 Rueil-Malmaison',
    website: 'chateau-malmaison-events.fr',
    instagram: '@chateau_malmaison_events',
    city: 'Rueil-Malmaison',
    rating: 4.8,
    reviewCount: 89,
    venueType: 'Château',
    capacity: 200,
    amenities: ['Jardins', 'Parking', 'Cuisine équipée', 'Terrasse', 'Salon de réception', 'Hébergement'],
  },
  {
    userType: 'business',
    name: 'Villa Bella Vista',
    email: 'contact@villa-bellavista.com',
    profileImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    description: 'Villa moderne avec vue panoramique sur la mer. Idéale pour mariages, anniversaires et événements privés. Piscine, terrasse et jardin.',
    address: '25 Corniche des Palmiers, 06400 Cannes',
    website: 'villa-bellavista.com',
    instagram: '@villa_bellavista',
    city: 'Cannes',
    rating: 4.9,
    reviewCount: 67,
    venueType: 'Villa',
    capacity: 120,
    amenities: ['Piscine', 'Vue mer', 'Terrasse', 'Jardin', 'Parking', 'Cuisine équipée'],
  },
  {
    userType: 'business',
    name: 'Domaine des Oliviers',
    email: 'contact@domaine-oliviers.fr',
    profileImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&auto=format&fit=crop',
    description: 'Domaine viticole en Provence avec salle de réception et vignobles. Cadre authentique pour mariages et événements d\'entreprise.',
    address: '123 Route des Vignes, 84000 Avignon',
    website: 'domaine-oliviers.fr',
    instagram: '@domaine_oliviers',
    city: 'Avignon',
    rating: 4.7,
    reviewCount: 134,
    venueType: 'Domaine viticole',
    capacity: 150,
    amenities: ['Vignobles', 'Salle de réception', 'Terrasse', 'Parking', 'Dégustation'],
  },
];

export default function DemoScreen() {
  const router = useRouter();
  const { loginWithDemo, isLoading } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount | null>(null);

  const handleDemoLogin = async () => {
    if (!selectedAccount) {
      Alert.alert('Erreur', 'Veuillez sélectionner un compte démo');
      return;
    }

    try {
      const success = await loginWithDemo(selectedAccount);
      if (success) {
        Alert.alert(
          'Connexion réussie',
          `Bienvenue ${selectedAccount.name} !`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter avec ce compte démo');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    }
  };

  const getAccountIcon = (userType: string) => {
    switch (userType) {
      case 'client':
        return <User size={24} color={Colors.primary} />;
      case 'provider':
        return <Briefcase size={24} color={Colors.primary} />;
      case 'business':
        return <Building size={24} color={Colors.primary} />;
      default:
        return <User size={24} color={Colors.primary} />;
    }
  };

  const getAccountTypeLabel = (userType: string) => {
    switch (userType) {
      case 'client':
        return 'Client';
      case 'provider':
        return 'Prestataire';
      case 'business':
        return 'Établissement';
      default:
        return 'Utilisateur';
    }
  };

  // Group accounts by type
  const groupedAccounts = {
    client: demoAccounts.filter(acc => acc.userType === 'client'),
    provider: demoAccounts.filter(acc => acc.userType === 'provider'),
    business: demoAccounts.filter(acc => acc.userType === 'business'),
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Comptes démo",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ Essayez EventApp</Text>
          <Text style={styles.subtitle}>
            Choisissez un type de compte pour découvrir toutes les fonctionnalités
          </Text>
        </View>

        {/* Client Accounts */}
        <View style={styles.typeSection}>
          <Text style={styles.typeTitle}>👤 Comptes Client</Text>
          <Text style={styles.typeDescription}>
            Recherchez et contactez des prestataires pour vos événements
          </Text>
          {groupedAccounts.client.map((account, index) => (
            <TouchableOpacity
              key={`client-${index}`}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountIcon}>
                  {getAccountIcon(account.userType)}
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountType}>
                    {getAccountTypeLabel(account.userType)}
                  </Text>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedAccount?.email === account.email && styles.radioButtonSelected
                ]}>
                  {selectedAccount?.email === account.email && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
              
              <Text style={styles.accountDescription}>
                {account.description}
              </Text>
              
              <View style={styles.accountDetails}>
                <Text style={styles.accountLocation}>📍 {account.city}</Text>
                <Text style={styles.accountRating}>
                  ⭐ {account.rating} ({account.reviewCount} avis)
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Provider Accounts */}
        <View style={styles.typeSection}>
          <Text style={styles.typeTitle}>💼 Comptes Prestataire</Text>
          <Text style={styles.typeDescription}>
            Proposez vos services et créez des devis pour vos clients
          </Text>
          {groupedAccounts.provider.map((account, index) => (
            <TouchableOpacity
              key={`provider-${index}`}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountIcon}>
                  {getAccountIcon(account.userType)}
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountType}>
                    {getAccountTypeLabel(account.userType)}
                  </Text>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedAccount?.email === account.email && styles.radioButtonSelected
                ]}>
                  {selectedAccount?.email === account.email && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
              
              <Text style={styles.accountDescription}>
                {account.description}
              </Text>
              
              <View style={styles.accountDetails}>
                <Text style={styles.accountLocation}>📍 {account.city}</Text>
                <Text style={styles.accountRating}>
                  ⭐ {account.rating} ({account.reviewCount} avis)
                </Text>
              </View>
              
              {account.services && (
                <View style={styles.servicesList}>
                  {account.services.slice(0, 3).map((service, serviceIndex) => (
                    <View key={serviceIndex} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Business Accounts */}
        <View style={styles.typeSection}>
          <Text style={styles.typeTitle}>🏢 Comptes Établissement</Text>
          <Text style={styles.typeDescription}>
            Proposez votre lieu pour des événements et réceptions
          </Text>
          {groupedAccounts.business.map((account, index) => (
            <TouchableOpacity
              key={`business-${index}`}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountIcon}>
                  {getAccountIcon(account.userType)}
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountType}>
                    {getAccountTypeLabel(account.userType)}
                  </Text>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedAccount?.email === account.email && styles.radioButtonSelected
                ]}>
                  {selectedAccount?.email === account.email && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
              
              <Text style={styles.accountDescription}>
                {account.description}
              </Text>
              
              <View style={styles.accountDetails}>
                <Text style={styles.accountLocation}>📍 {account.city}</Text>
                <Text style={styles.accountRating}>
                  ⭐ {account.rating} ({account.reviewCount} avis)
                </Text>
              </View>
              
              {account.amenities && (
                <View style={styles.servicesList}>
                  {account.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                    <View key={amenityIndex} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={isLoading ? "Connexion..." : "Se connecter avec ce compte"}
          onPress={handleDemoLogin}
          disabled={!selectedAccount || isLoading}
          fullWidth
        />
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
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
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  typeSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  accountDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  accountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  accountLocation: {
    fontSize: 14,
    color: Colors.textLight,
  },
  accountRating: {
    fontSize: 14,
    color: Colors.textLight,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
});