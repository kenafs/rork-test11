import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { User, Building2, Users, ArrowRight } from 'lucide-react-native';

interface DemoAccount {
  name: string;
  email: string;
  userType: 'provider' | 'business' | 'client';
  profileImage: string;
  description?: string;
  specialties?: string;
  address?: string;
  website?: string;
  instagram?: string;
  rating: number;
  reviewCount: number;
  city: string;
}

const demoAccounts: Record<'provider' | 'business' | 'client', DemoAccount> = {
  provider: {
    name: 'Marie Martin - DJ Pro',
    email: 'marie@djpro.com',
    userType: 'provider',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop',
    description: 'DJ professionnelle spécialisée dans les événements d\'entreprise et mariages. Plus de 10 ans d\'expérience.',
    specialties: 'DJ, Animation, Sonorisation',
    website: 'https://djpro-marie.com',
    instagram: '@djpro_marie',
    rating: 4.8,
    reviewCount: 127,
    city: 'Paris',
  },
  business: {
    name: 'Restaurant Le Gourmet',
    email: 'contact@legourmet.com',
    userType: 'business',
    profileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop',
    description: 'Restaurant gastronomique avec terrasse, spécialisé dans l\'organisation d\'événements privés et réceptions.',
    address: '15 Rue de la Paix, 75001 Paris',
    website: 'https://legourmet-paris.fr',
    instagram: '@legourmet_paris',
    rating: 4.6,
    reviewCount: 89,
    city: 'Paris',
  },
  client: {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    userType: 'client',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop',
    description: 'Organisateur d\'événements passionné, toujours à la recherche des meilleurs prestataires.',
    rating: 4.5,
    reviewCount: 23,
    city: 'Paris',
  },
};

export default function DemoScreen() {
  const router = useRouter();
  const { loginWithDemo, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<'provider' | 'business' | 'client'>('provider');
  
  const handleDemoLogin = async () => {
    const success = await loginWithDemo(demoAccounts[selectedType]);
    if (success) {
      router.replace('/(tabs)');
    }
  };
  
  const accountTypes = [
    {
      id: 'provider' as const,
      title: 'Prestataire',
      subtitle: 'DJ, Traiteur, Photographe...',
      description: 'Créez vos annonces et développez votre activité',
      icon: User,
      color: Colors.primary,
    },
    {
      id: 'business' as const,
      title: 'Établissement',
      subtitle: 'Restaurant, Salle, Hôtel...',
      description: 'Proposez vos espaces et services',
      icon: Building2,
      color: Colors.secondary,
    },
    {
      id: 'client' as const,
      title: 'Client',
      subtitle: 'Organisateur d\'événements',
      description: 'Trouvez les meilleurs prestataires',
      icon: Users,
      color: '#10B981',
    },
  ];
  
  const selectedAccount = demoAccounts[selectedType];
  const selectedAccountType = accountTypes.find(type => type.id === selectedType);
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Comptes de démonstration',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre type de compte</Text>
          <Text style={styles.subtitle}>
            Explorez l'application avec un compte de démonstration
          </Text>
        </View>
        
        <View style={styles.accountTypes}>
          {accountTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.accountTypeCard,
                selectedType === type.id && styles.selectedCard,
                { borderColor: selectedType === type.id ? type.color : Colors.border }
              ]}
              onPress={() => setSelectedType(type.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: type.color }]}>
                  <type.icon size={24} color="#fff" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{type.title}</Text>
                  <Text style={styles.cardSubtitle}>{type.subtitle}</Text>
                </View>
                {selectedType === type.id && (
                  <View style={[styles.checkmark, { backgroundColor: type.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Aperçu du compte sélectionné</Text>
          
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Image 
                source={{ uri: selectedAccount.profileImage }} 
                style={styles.previewAvatar}
              />
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{selectedAccount.name}</Text>
                <Text style={styles.previewEmail}>{selectedAccount.email}</Text>
                <View style={styles.previewBadge}>
                  <Text style={[styles.previewBadgeText, { color: selectedAccountType?.color }]}>
                    {selectedAccountType?.title}
                  </Text>
                </View>
              </View>
            </View>
            
            {selectedAccount.description && (
              <Text style={styles.previewDescription}>
                {selectedAccount.description}
              </Text>
            )}
            
            <View style={styles.previewStats}>
              {selectedAccount.rating && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>⭐ {selectedAccount.rating}</Text>
                  <Text style={styles.statLabel}>Note</Text>
                </View>
              )}
              {selectedAccount.reviewCount && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedAccount.reviewCount}</Text>
                  <Text style={styles.statLabel}>Avis</Text>
                </View>
              )}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>📍 {selectedAccount.city}</Text>
                <Text style={styles.statLabel}>Ville</Text>
              </View>
            </View>
            
            {/* Additional info based on account type */}
            {selectedType === 'provider' && selectedAccount.specialties && (
              <View style={styles.additionalInfo}>
                <Text style={styles.additionalInfoLabel}>Spécialités:</Text>
                <Text style={styles.additionalInfoValue}>{selectedAccount.specialties}</Text>
              </View>
            )}
            
            {selectedType === 'business' && selectedAccount.address && (
              <View style={styles.additionalInfo}>
                <Text style={styles.additionalInfoLabel}>Adresse:</Text>
                <Text style={styles.additionalInfoValue}>{selectedAccount.address}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.actions}>
          <Button
            title={`Se connecter en tant que ${selectedAccountType?.title}`}
            onPress={handleDemoLogin}
            loading={isLoading}
            style={[styles.demoButton, { backgroundColor: selectedAccountType?.color }]}
            icon={<ArrowRight size={20} color="#fff" />}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
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
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  accountTypes: {
    padding: 20,
    gap: 16,
  },
  accountTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedCard: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  previewSection: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  previewEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previewDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  additionalInfo: {
    marginTop: 8,
  },
  additionalInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  additionalInfoValue: {
    fontSize: 14,
    color: Colors.textLight,
  },
  actions: {
    padding: 20,
    gap: 16,
  },
  demoButton: {
    borderRadius: 12,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
});