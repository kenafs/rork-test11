import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { DemoAccount } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import { User, Building, Briefcase, ArrowLeft, Sparkles, Star, MapPin } from 'lucide-react-native';

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
        return <User size={24} color="#fff" />;
      case 'provider':
        return <Briefcase size={24} color="#fff" />;
      case 'business':
        return <Building size={24} color="#fff" />;
      default:
        return <User size={24} color="#fff" />;
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

  const getAccountTypeColor = (userType: string) => {
    switch (userType) {
      case 'client':
        return ['#3b82f6', '#1d4ed8'];
      case 'provider':
        return ['#8b5cf6', '#7c3aed'];
      case 'business':
        return ['#10b981', '#059669'];
      default:
        return ['#6b7280', '#4b5563'];
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
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3730a3']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Sparkles size={32} color="#fbbf24" />
          <Text style={styles.headerTitle}>Comptes démo</Text>
          <Text style={styles.headerSubtitle}>
            Découvrez EventApp avec nos comptes de démonstration
          </Text>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Accounts */}
        <View style={styles.typeSection}>
          <View style={styles.typeSectionHeader}>
            <LinearGradient
              colors={getAccountTypeColor('client')}
              style={styles.typeSectionIcon}
            >
              <User size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.typeSectionInfo}>
              <Text style={styles.typeTitle}>👤 Comptes Client</Text>
              <Text style={styles.typeDescription}>
                Recherchez et contactez des prestataires pour vos événements
              </Text>
            </View>
          </View>
          
          {groupedAccounts.client.map((account, index) => (
            <TouchableOpacity
              key={`client-${index}`}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
              activeOpacity={0.8}
            >
              <View style={styles.accountHeader}>
                <Image 
                  source={{ uri: account.profileImage }} 
                  style={styles.accountImage}
                />
                <View style={styles.accountInfo}>
                  <View style={styles.accountBadge}>
                    <Text style={styles.accountType}>
                      {getAccountTypeLabel(account.userType)}
                    </Text>
                  </View>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <View style={styles.accountMeta}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.accountLocation}>{account.city}</Text>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.accountRating}>
                      {account.rating} ({account.reviewCount})
                    </Text>
                  </View>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Provider Accounts */}
        <View style={styles.typeSection}>
          <View style={styles.typeSectionHeader}>
            <LinearGradient
              colors={getAccountTypeColor('provider')}
              style={styles.typeSectionIcon}
            >
              <Briefcase size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.typeSectionInfo}>
              <Text style={styles.typeTitle}>💼 Comptes Prestataire</Text>
              <Text style={styles.typeDescription}>
                Proposez vos services et créez des devis pour vos clients
              </Text>
            </View>
          </View>
          
          {groupedAccounts.provider.map((account, index) => (
            <TouchableOpacity
              key={`provider-${index}`}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
              activeOpacity={0.8}
            >
              <View style={styles.accountHeader}>
                <Image 
                  source={{ uri: account.profileImage }} 
                  style={styles.accountImage}
                />
                <View style={styles.accountInfo}>
                  <View style={styles.accountBadge}>
                    <Text style={styles.accountType}>
                      {getAccountTypeLabel(account.userType)}
                    </Text>
                  </View>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <View style={styles.accountMeta}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.accountLocation}>{account.city}</Text>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.accountRating}>
                      {account.rating} ({account.reviewCount})
                    </Text>
                  </View>
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
          <View style={styles.typeSectionHeader}>
            <LinearGradient
              colors={getAccountTypeColor('business')}
              style={styles.typeSectionIcon}
            >
              <Building size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.typeSectionInfo}>
              <Text style={styles.typeTitle}>🏢 Comptes Établissement</Text>
              <Text style={styles.typeDescription}>
                Proposez votre lieu pour des événements et réceptions
              </Text>
            </View>
          </View>
          
          {groupedAccounts.business.map((account, index) => (
            <TouchableOpacity
              key={`business-${index}`}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
              activeOpacity={0.8}
            >
              <View style={styles.accountHeader}>
                <Image 
                  source={{ uri: account.profileImage }} 
                  style={styles.accountImage}
                />
                <View style={styles.accountInfo}>
                  <View style={styles.accountBadge}>
                    <Text style={styles.accountType}>
                      {getAccountTypeLabel(account.userType)}
                    </Text>
                  </View>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <View style={styles.accountMeta}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.accountLocation}>{account.city}</Text>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.accountRating}>
                      {account.rating} ({account.reviewCount})
                    </Text>
                  </View>
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
          style={styles.connectButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Content
  content: {
    flex: 1,
  },
  typeSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  typeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeSectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeSectionInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  
  // Account Cards
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedCard: {
    borderColor: '#1e3a8a',
    backgroundColor: 'rgba(30, 58, 138, 0.02)',
    transform: [{ scale: 1.02 }],
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accountImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountBadge: {
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  accountType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e3a8a',
    textTransform: 'uppercase',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accountLocation: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  accountRating: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  radioButtonSelected: {
    borderColor: '#1e3a8a',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1e3a8a',
  },
  accountDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  
  // Bottom Container
  bottomContainer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  connectButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    paddingVertical: 16,
  },
});