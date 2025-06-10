import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { DemoAccount } from '@/types';
import Colors from '@/constants/colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Building, Briefcase, ArrowRight, Sparkles } from 'lucide-react-native';

const demoAccounts: DemoAccount[] = [
  // Client Demo Account
  {
    name: 'Sophie Martin',
    email: 'sophie.martin@demo.com',
    userType: 'client',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    description: 'Organisatrice d\'événements passionnée, toujours à la recherche des meilleurs prestataires pour créer des moments inoubliables.',
    rating: 4.7,
    reviewCount: 15,
    city: 'Paris',
  },
  
  // Provider Demo Account
  {
    name: 'Alexandre Dubois - DJ Pro',
    email: 'alex.dubois@djpro.com',
    userType: 'provider',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    description: 'DJ professionnel avec plus de 10 ans d\'expérience. Spécialisé dans les mariages, soirées d\'entreprise et événements privés. Matériel haut de gamme et playlist personnalisée.',
    specialties: 'DJ, Animation, Sonorisation, Éclairage',
    website: 'https://djpro-alex.com',
    instagram: '@djpro_alex',
    rating: 4.9,
    reviewCount: 156,
    city: 'Paris',
    services: ['DJ', 'Animation', 'Sonorisation', 'Éclairage', 'Karaoké'],
    priceRange: { min: 400, max: 2000 },
    availability: ['Soir', 'Week-end', 'Jours fériés'],
  },
  
  // Business Demo Account
  {
    name: 'Château de Malmaison',
    email: 'events@chateau-malmaison.fr',
    userType: 'business',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f29c8a4e0a?w=800&auto=format&fit=crop',
    description: 'Château historique du 18ème siècle situé dans un parc de 15 hectares. Lieu d\'exception pour vos mariages, séminaires et événements privés. Capacité jusqu\'à 200 personnes.',
    address: '1 Avenue du Château, 92500 Rueil-Malmaison',
    website: 'https://chateau-malmaison-events.fr',
    instagram: '@chateau_malmaison_events',
    rating: 4.8,
    reviewCount: 89,
    city: 'Rueil-Malmaison',
    venueType: 'Château',
    capacity: 200,
    amenities: ['Parc de 15 hectares', 'Parking privé', 'Cuisine équipée', 'Terrasse', 'Salle de réception', 'Hébergement sur place'],
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
          `Bienvenue ${account.name} ! Vous êtes maintenant connecté avec un compte ${
            account.userType === 'client' ? 'client' :
            account.userType === 'provider' ? 'prestataire' : 'établissement'
          }.`,
          [
            {
              text: 'Découvrir l\'app',
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
          title: 'Client',
          subtitle: 'Organisateur d\'événements',
          color: '#10B981',
          description: 'Recherchez et contactez des prestataires pour vos événements',
        };
      case 'provider':
        return {
          icon: Briefcase,
          title: 'Prestataire',
          subtitle: 'Professionnel de l\'événementiel',
          color: Colors.primary,
          description: 'Proposez vos services et gérez vos devis',
        };
      case 'business':
        return {
          icon: Building,
          title: 'Établissement',
          subtitle: 'Lieu d\'événements',
          color: '#8B5CF6',
          description: 'Proposez votre lieu pour des événements privés',
        };
      default:
        return {
          icon: User,
          title: 'Utilisateur',
          subtitle: '',
          color: Colors.textLight,
          description: '',
        };
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Comptes démo",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" }
        }} 
      />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Sparkles size={32} color="#fff" />
          <Text style={styles.headerTitle}>✨ Essayez EventApp</Text>
          <Text style={styles.headerSubtitle}>
            Découvrez l'application avec nos comptes démo
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.accountsContainer}>
          {demoAccounts.map((account, index) => {
            const typeInfo = getAccountTypeInfo(account.userType);
            const IconComponent = typeInfo.icon;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.accountCard,
                  selectedAccount?.email === account.email && styles.selectedCard,
                ]}
                onPress={() => setSelectedAccount(account)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.profileSection}>
                    <Image source={{ uri: account.profileImage }} style={styles.profileImage} />
                    <View style={styles.profileInfo}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: typeInfo.color }]}>
                        <IconComponent size={14} color="#fff" />
                        <Text style={styles.typeText}>{typeInfo.title}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {account.rating}</Text>
                    <Text style={styles.reviewCount}>({account.reviewCount} avis)</Text>
                  </View>
                </View>

                <Text style={styles.accountDescription} numberOfLines={3}>
                  {account.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.location}>📍 {account.city}</Text>
                  </View>
                  
                  {selectedAccount?.email === account.email && (
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => handleDemoLogin(account)}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={[typeInfo.color, typeInfo.color] as const}
                        style={styles.loginButtonGradient}
                      >
                        <Text style={styles.loginButtonText}>
                          {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Text>
                        <ArrowRight size={16} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Additional info for selected card */}
                {selectedAccount?.email === account.email && (
                  <View style={styles.expandedInfo}>
                    <Text style={styles.expandedTitle}>Fonctionnalités disponibles :</Text>
                    <Text style={styles.expandedDescription}>
                      {typeInfo.description}
                    </Text>
                    
                    {account.userType === 'provider' && account.services && (
                      <View style={styles.servicesContainer}>
                        <Text style={styles.servicesTitle}>Services :</Text>
                        <View style={styles.servicesTags}>
                          {account.services.slice(0, 3).map((service, idx) => (
                            <View key={idx} style={styles.serviceTag}>
                              <Text style={styles.serviceTagText}>{service}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {account.userType === 'business' && account.amenities && (
                      <View style={styles.servicesContainer}>
                        <Text style={styles.servicesTitle}>Équipements :</Text>
                        <View style={styles.servicesTags}>
                          {account.amenities.slice(0, 3).map((amenity, idx) => (
                            <View key={idx} style={styles.serviceTag}>
                              <Text style={styles.serviceTagText}>{amenity}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 À propos des comptes démo</Text>
          <Text style={styles.infoText}>
            Ces comptes vous permettent de tester toutes les fonctionnalités de l'application sans créer de compte réel. 
            Vos données ne seront pas sauvegardées de manière permanente.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  accountsContainer: {
    padding: 20,
    gap: 16,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  accountDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flex: 1,
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  expandedInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  expandedDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  servicesContainer: {
    marginTop: 8,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceTagText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  backButton: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});