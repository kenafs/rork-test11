import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { DemoAccount } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Building, Briefcase } from 'lucide-react-native';

const demoAccounts: DemoAccount[] = [
  // Client Demo
  {
    userType: 'client',
    name: 'Sophie Dubois',
    email: 'sophie.demo@eventapp.com',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    description: 'Organisatrice d\'événements privés, toujours à la recherche des meilleurs prestataires pour mes clients.',
    city: 'Lyon',
    rating: 4.7,
    reviewCount: 15,
  },
  // Provider Demo
  {
    userType: 'provider',
    name: 'Thomas Moreau - Photographe',
    email: 'thomas.demo@eventapp.com',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    description: 'Photographe professionnel spécialisé dans les mariages et événements d\'entreprise. Plus de 10 ans d\'expérience.',
    specialties: 'Photographie, Vidéographie, Retouche',
    website: 'https://thomas-photo.fr',
    instagram: '@thomas_photo_pro',
    city: 'Marseille',
    rating: 4.9,
    reviewCount: 89,
    services: ['Photographie', 'Vidéographie', 'Retouche photo'],
    priceRange: { min: 500, max: 2500 },
    availability: ['Journée', 'Soirée', 'Week-end'],
  },
  // Business Demo
  {
    userType: 'business',
    name: 'Château de Versailles Events',
    email: 'chateau.demo@eventapp.com',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f29c8d8d4f?w=800&auto=format&fit=crop',
    description: 'Lieu d\'exception pour vos événements prestigieux. Château historique avec jardins à la française et salles de réception.',
    address: '78000 Versailles, France',
    website: 'https://chateau-versailles-events.fr',
    instagram: '@chateau_versailles_events',
    city: 'Versailles',
    rating: 4.8,
    reviewCount: 156,
    venueType: 'Château',
    capacity: 300,
    amenities: ['Jardins', 'Parking', 'Cuisine équipée', 'Sonorisation', 'Éclairage professionnel'],
  },
];

export default function DemoScreen() {
  const router = useRouter();
  const { loginWithDemo, isLoading } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount | null>(null);

  const handleDemoLogin = async (account: DemoAccount) => {
    try {
      const success = await loginWithDemo(account);
      if (success) {
        Alert.alert(
          'Connexion réussie !',
          `Bienvenue ${account.name} ! Vous êtes maintenant connecté avec un compte démo ${
            account.userType === 'client' ? 'client' :
            account.userType === 'provider' ? 'prestataire' : 'établissement'
          }.`,
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter avec ce compte démo.');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion.');
    }
  };

  const getAccountTypeInfo = (userType: string) => {
    switch (userType) {
      case 'client':
        return {
          icon: User,
          title: 'Compte Client',
          description: 'Recherchez et contactez des prestataires',
          color: '#10B981',
        };
      case 'provider':
        return {
          icon: Briefcase,
          title: 'Compte Prestataire',
          description: 'Proposez vos services et créez des devis',
          color: '#3B82F6',
        };
      case 'business':
        return {
          icon: Building,
          title: 'Compte Établissement',
          description: 'Proposez votre lieu pour des événements',
          color: '#8B5CF6',
        };
      default:
        return {
          icon: User,
          title: 'Compte',
          description: '',
          color: Colors.primary,
        };
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Comptes démo",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>✨ Essayez EventApp</Text>
        <Text style={styles.headerSubtitle}>
          Choisissez un type de compte pour découvrir toutes les fonctionnalités
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {demoAccounts.map((account, index) => {
          const typeInfo = getAccountTypeInfo(account.userType);
          const IconComponent = typeInfo.icon;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.accountCard,
                selectedAccount?.email === account.email && styles.selectedCard
              ]}
              onPress={() => setSelectedAccount(account)}
              disabled={isLoading}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: typeInfo.color }]}>
                  <IconComponent size={24} color="#fff" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.accountType}>{typeInfo.title}</Text>
                  <Text style={styles.accountTypeDesc}>{typeInfo.description}</Text>
                </View>
              </View>
              
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
                <Text style={styles.accountDescription} numberOfLines={2}>
                  {account.description}
                </Text>
                
                <View style={styles.accountDetails}>
                  <Text style={styles.detailItem}>📍 {account.city}</Text>
                  <Text style={styles.detailItem}>⭐ {account.rating}/5 ({account.reviewCount} avis)</Text>
                </View>
                
                {account.userType === 'provider' && account.services && (
                  <View style={styles.servicesList}>
                    {account.services.slice(0, 3).map((service, serviceIndex) => (
                      <View key={serviceIndex} style={styles.serviceTag}>
                        <Text style={styles.serviceText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {account.userType === 'business' && account.amenities && (
                  <View style={styles.servicesList}>
                    {account.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                      <View key={amenityIndex} style={styles.serviceTag}>
                        <Text style={styles.serviceText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {selectedAccount?.email === account.email && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓ Sélectionné</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={isLoading ? "Connexion..." : "Se connecter avec ce compte"}
          onPress={() => selectedAccount && handleDemoLogin(selectedAccount)}
          disabled={!selectedAccount || isLoading}
          style={styles.loginButton}
        />
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
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
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  accountType: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  accountTypeDesc: {
    fontSize: 14,
    color: Colors.textLight,
  },
  accountInfo: {
    marginBottom: 12,
  },
  accountName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
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
  detailItem: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  selectedIndicator: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loginButton: {
    marginBottom: 12,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
});