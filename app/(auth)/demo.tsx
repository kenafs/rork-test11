import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserType } from '@/types';
import Colors, { gradients } from '@/constants/colors';
import Button from '@/components/Button';
import { StatusBar } from 'expo-status-bar';
import { User, Building, Briefcase, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const demoAccounts = [
  {
    type: 'provider' as UserType,
    title: 'DJ Professionnel',
    description: 'Découvrez l\'expérience d\'un prestataire DJ',
    icon: Briefcase,
    color: Colors.primary,
    gradient: [Colors.primary, Colors.secondary] as [string, string],
    userData: {
      name: 'Alex Martin - DJ Pro',
      email: 'demo.dj@example.com',
      userType: 'provider' as UserType,
      description: 'DJ professionnel spécialisé dans les événements d\'entreprise et mariages. Plus de 10 ans d\'expérience.',
      specialties: 'DJ, Animation, Sonorisation',
      city: 'Paris',
      rating: 4.8,
      reviewCount: 127,
      profileImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop',
    }
  },
  {
    type: 'business' as UserType,
    title: 'Restaurant Le Gourmet',
    description: 'Explorez l\'interface d\'un établissement',
    icon: Building,
    color: Colors.accent,
    gradient: [Colors.accent, '#FF7F50'] as [string, string],
    userData: {
      name: 'Restaurant Le Gourmet',
      email: 'demo.restaurant@example.com',
      userType: 'business' as UserType,
      description: 'Restaurant gastronomique avec terrasse, spécialisé dans l\'organisation d\'événements privés et professionnels.',
      address: '15 Rue de la Paix, 75001 Paris',
      city: 'Paris',
      website: 'https://legourmet-paris.fr',
      instagram: '@legourmet_paris',
      rating: 4.6,
      reviewCount: 89,
      profileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop',
    }
  },
  {
    type: 'client' as UserType,
    title: 'Client Particulier',
    description: 'Testez l\'expérience d\'un client',
    icon: User,
    color: Colors.secondary,
    gradient: [Colors.secondary, '#32CD32'] as [string, string],
    userData: {
      name: 'Marie Dubois',
      email: 'demo.client@example.com',
      userType: 'client' as UserType,
      description: 'Particulier organisant des événements familiaux et professionnels.',
      city: 'Paris',
      rating: 4.2,
      reviewCount: 15,
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    }
  },
];

export default function DemoScreen() {
  const router = useRouter();
  const { loginWithDemo, isLoading } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState<typeof demoAccounts[0] | null>(null);
  
  const handleDemoLogin = async (demoAccount: typeof demoAccounts[0]) => {
    try {
      const success = await loginWithDemo(demoAccount.userData);
      
      if (success) {
        Alert.alert(
          'Connexion réussie !', 
          `Vous êtes maintenant connecté en tant que ${demoAccount.title}. Explorez toutes les fonctionnalités !`,
          [{ text: 'Commencer', onPress: () => router.replace('/') }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter avec le compte démo');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la connexion');
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.sparkleContainer}>
            <Sparkles size={48} color="#FFD700" fill="#FFD700" />
          </View>
          <Text style={styles.title}>Comptes Démo</Text>
          <Text style={styles.subtitle}>
            Testez l'application avec des comptes pré-configurés
          </Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Choisissez votre expérience</Text>
        <Text style={styles.sectionDescription}>
          Explorez les différentes fonctionnalités selon votre profil
        </Text>
        
        <View style={styles.demoAccountsContainer}>
          {demoAccounts.map((account, index) => (
            <TouchableOpacity
              key={account.type}
              style={[
                styles.demoAccountCard,
                selectedDemo?.type === account.type && styles.selectedCard
              ]}
              onPress={() => setSelectedDemo(account)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={account.gradient}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <account.icon size={32} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>{account.title}</Text>
                  <Text style={styles.cardDescription}>{account.description}</Text>
                  
                  <View style={styles.cardFeatures}>
                    {account.type === 'provider' ? (
                      <>
                        <Text style={styles.featureText}>• Créer des annonces</Text>
                        <Text style={styles.featureText}>• Envoyer des devis</Text>
                        <Text style={styles.featureText}>• Gérer les messages</Text>
                      </>
                    ) : account.type === 'business' ? (
                      <>
                        <Text style={styles.featureText}>• Publier des offres</Text>
                        <Text style={styles.featureText}>• Recevoir des demandes</Text>
                        <Text style={styles.featureText}>• Gérer l\'établissement</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.featureText}>• Rechercher des services</Text>
                        <Text style={styles.featureText}>• Contacter des prestataires</Text>
                        <Text style={styles.featureText}>• Laisser des avis</Text>
                      </>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        
        {selectedDemo && (
          <View style={styles.selectedAccountInfo}>
            <Text style={styles.selectedTitle}>Compte sélectionné :</Text>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{selectedDemo.userData.name}</Text>
              <Text style={styles.accountEmail}>{selectedDemo.userData.email}</Text>
              <Text style={styles.accountDescription}>{selectedDemo.userData.description}</Text>
            </View>
            
            <Button
              title={`🚀 Se connecter en tant que ${selectedDemo.title}`}
              onPress={() => handleDemoLogin(selectedDemo)}
              loading={isLoading}
              fullWidth
              style={[styles.loginButton, { backgroundColor: selectedDemo.color }]}
            />
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 À propos des comptes démo</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Données fictives pour la démonstration</Text>
            <Text style={styles.infoItem}>• Toutes les fonctionnalités sont disponibles</Text>
            <Text style={styles.infoItem}>• Aucune donnée réelle n'est sauvegardée</Text>
            <Text style={styles.infoItem}>• Parfait pour tester l'application</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Vous préférez créer un vrai compte ?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
  },
  sparkleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  demoAccountsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  demoAccountCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    padding: 24,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFeatures: {
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  selectedAccountInfo: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  accountDetails: {
    marginBottom: 20,
  },
  accountName: {
    fontSize: 18,
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
    color: Colors.textLight,
    lineHeight: 20,
  },
  loginButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  infoSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 16,
  },
  registerText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});