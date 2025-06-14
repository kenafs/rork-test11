import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import { 
  User, 
  Settings, 
  Heart, 
  MessageCircle, 
  Star, 
  MapPin, 
  Calendar,
  ChevronRight,
  LogOut,
  CreditCard,
  Shield,
  HelpCircle,
  Bell,
  Globe
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          }
        }
      ]
    );
  };
  
  const handlePaymentSettings = () => {
    Alert.alert(
      'Moyens de paiement',
      'Gestion des paiements:\n\n• Ajouter une carte bancaire\n• Configurer les virements\n• Historique des transactions\n• Intégration Stripe sécurisée\n\nCette fonctionnalité sera disponible prochainement.',
      [{ text: 'OK' }]
    );
  };
  
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Profil" }} />
        <View style={styles.loginPrompt}>
          <User size={64} color={Colors.textLight} />
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginSubtitle}>
            Connectez-vous pour accéder à votre profil
          </Text>
          <View style={styles.loginButtons}>
            <Button
              title="Se connecter"
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginButton}
            />
            <Button
              title="Créer un compte"
              variant="outline"
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerButton}
            />
          </View>
        </View>
      </View>
    );
  }
  
  const menuItems = [
    {
      icon: User,
      title: 'Modifier le profil',
      subtitle: 'Informations personnelles',
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: CreditCard,
      title: 'Moyens de paiement',
      subtitle: 'Cartes et virements',
      onPress: handlePaymentSettings,
      highlight: true,
    },
    {
      icon: Heart,
      title: 'Mes favoris',
      subtitle: 'Annonces sauvegardées',
      onPress: () => router.push('/favorites'),
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      subtitle: 'Conversations',
      onPress: () => router.push('/(tabs)/messages'),
    },
    {
      icon: Star,
      title: 'Mes avis',
      subtitle: 'Évaluations reçues',
      onPress: () => router.push('/reviews'),
    },
    {
      icon: Shield,
      title: 'Confidentialité',
      subtitle: 'Sécurité et vie privée',
      onPress: () => router.push('/settings'),
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Préférences de notification',
      onPress: () => router.push('/settings'),
    },
    {
      icon: HelpCircle,
      title: 'Aide et support',
      subtitle: 'Centre d\'aide',
      onPress: () => router.push('/settings'),
    },
    {
      icon: Globe,
      title: 'Langue',
      subtitle: 'Français',
      onPress: () => router.push('/settings'),
    },
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Paramètres",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {user.rating && user.rating > 0 && (
            <View style={styles.ratingContainer}>
              <RatingStars rating={user.rating} size="small" />
              <Text style={styles.reviewCount}>
                {user.reviewCount || 0} avis
              </Text>
            </View>
          )}
          
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypeText}>
              {user.userType === 'provider' ? '💼 Prestataire' : 
               user.userType === 'business' ? '🏢 Établissement' : 
               '👤 Client'}
            </Text>
          </View>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          {menuItems.slice(0, 2).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, item.highlight && styles.highlightMenuItem]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, item.highlight && styles.highlightIcon]}>
                  <item.icon size={20} color={item.highlight ? "#fff" : Colors.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité</Text>
          
          {menuItems.slice(2, 5).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <item.icon size={20} color={Colors.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          {menuItems.slice(5).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <item.icon size={20} color={Colors.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>
              {isLoading ? 'Déconnexion...' : 'Déconnexion'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>EventApp v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 EventApp. Tous droits réservés.</Text>
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
  loginSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButtons: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    backgroundColor: Colors.primary,
  },
  registerButton: {
    borderColor: Colors.primary,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  userTypeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundAlt,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  highlightMenuItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightIcon: {
    backgroundColor: Colors.primary,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
});