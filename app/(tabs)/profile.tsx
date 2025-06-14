import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { 
  User, 
  Settings, 
  Heart, 
  FileText, 
  MessageCircle, 
  Star, 
  MapPin, 
  Globe, 
  Instagram,
  LogOut,
  ChevronRight,
  Edit,
  CreditCard
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getUserListings } = useListings();
  const { favorites } = useFavorites();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <User size={64} color={Colors.textLight} />
          <Text style={styles.notLoggedInTitle}>Non connecté</Text>
          <Text style={styles.notLoggedInText}>
            Connectez-vous pour accéder à votre profil
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

  const userListings = getUserListings(user.id);
  const userTypeLabel = user.userType === 'provider' ? 'Prestataire' : 
                       user.userType === 'business' ? 'Établissement' : 'Client';

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  const handlePaymentSettings = () => {
    Alert.alert(
      'Moyens de paiement',
      "Gestion des paiements:\n\n• Ajouter une carte bancaire\n• Configurer les virements\n• Historique des transactions\n• Intégration Stripe sécurisée\n\nCette fonctionnalité sera disponible prochainement.",
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeText}>{userTypeLabel}</Text>
            </View>
            
            {user.rating && (
              <View style={styles.ratingContainer}>
                <RatingStars rating={user.rating} size="small" />
                <Text style={styles.reviewCount}>
                  ({user.reviewCount || 0} avis)
                </Text>
              </View>
            )}
          </View>
        </View>

        {user.description && (
          <Text style={styles.description}>{user.description}</Text>
        )}

        <View style={styles.profileDetails}>
          {user.city && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>{user.city}</Text>
            </View>
          )}
          
          {user.website && (
            <View style={styles.detailItem}>
              <Globe size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>{user.website}</Text>
            </View>
          )}
          
          {user.instagram && (
            <View style={styles.detailItem}>
              <Instagram size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>@{user.instagram}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userListings.length}</Text>
          <Text style={styles.statLabel}>Annonces</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favoris</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.reviewCount || 0}</Text>
          <Text style={styles.statLabel}>Avis</Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/edit-profile')}
        >
          <View style={styles.menuItemLeft}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Modifier le profil</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.menuItemLeft}>
            <Settings size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Paramètres</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handlePaymentSettings}
        >
          <View style={styles.menuItemLeft}>
            <CreditCard size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Moyens de paiement</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/favorites')}
        >
          <View style={styles.menuItemLeft}>
            <Heart size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Mes favoris</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.badgeText}>{favorites.length}</Text>
            <ChevronRight size={20} color={Colors.textLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/quotes')}
        >
          <View style={styles.menuItemLeft}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Mes devis</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/reviews')}
        >
          <View style={styles.menuItemLeft}>
            <Star size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Mes avis</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.menuItemText, styles.logoutText]}>
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
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
    fontWeight: '600',
    color: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  userTypeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  profileDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
});