import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useQuotes } from '@/hooks/useQuotes';
import { useListings } from '@/hooks/useListings';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import RatingStars from '@/components/RatingStars';
import { 
  User, 
  Settings, 
  Heart, 
  Star, 
  FileText, 
  MessageCircle, 
  Edit3, 
  LogOut,
  ChevronRight,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getFavoriteIds } = useFavorites();
  const { getUserQuotes } = useQuotes();
  const { getUserListings } = useListings();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <User size={64} color={Colors.textLight} />
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginSubtitle}>
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
  
  const favoriteIds = getFavoriteIds();
  const userQuotes = getUserQuotes();
  const userListings = getUserListings();
  
  // Calculate stats
  const completedQuotes = userQuotes.filter(q => q.status === 'completed').length;
  const averageRating = user.rating || 0;
  const totalReviews = user.reviewCount || 0;
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };
  
  const menuItems = [
    {
      icon: Edit3,
      title: 'Modifier le profil',
      subtitle: 'Informations personnelles',
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: FileText,
      title: 'Mes annonces',
      subtitle: `${userListings.length} annonce${userListings.length > 1 ? 's' : ''}`,
      onPress: () => router.push('/my-listings'),
    },
    {
      icon: Heart,
      title: 'Mes favoris',
      subtitle: `${favoriteIds.length} favori${favoriteIds.length > 1 ? 's' : ''}`,
      onPress: () => router.push('/favorites'),
    },
    {
      icon: FileText,
      title: 'Mes devis',
      subtitle: `${userQuotes.length} devis`,
      onPress: () => router.push('/quotes'),
    },
    {
      icon: Star,
      title: 'Avis et notes',
      subtitle: `${totalReviews} avis reçu${totalReviews > 1 ? 's' : ''}`,
      onPress: () => router.push(`/reviews?id=${user.id}&type=user`),
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      subtitle: 'Conversations',
      onPress: () => router.push('/(tabs)/messages'),
    },
    {
      icon: Settings,
      title: 'Paramètres',
      subtitle: 'Préférences et confidentialité',
      onPress: () => router.push('/settings'),
    },
  ];
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User size={40} color="#fff" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit3 size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userType}>
            {user.userType === 'provider' ? '🎯 Prestataire' : 
             user.userType === 'business' ? '🏢 Établissement' : 
             '👤 Client'}
          </Text>
          
          {user.location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.locationText}>
                {typeof user.location === 'string' ? user.location : user.location.city}
              </Text>
            </View>
          )}
          
          {averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <RatingStars 
                rating={averageRating} 
                reviewCount={totalReviews}
                size="medium"
              />
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push('/favorites')}
        >
          <Heart size={24} color="#FF6B6B" />
          <Text style={styles.statNumber}>{favoriteIds.length}</Text>
          <Text style={styles.statLabel}>Favoris</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push(`/reviews?id=${user.id}&type=user`)}
        >
          <Star size={24} color="#FFD93D" />
          <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Note</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push('/my-listings')}
        >
          <FileText size={24} color="#6BCF7F" />
          <Text style={styles.statNumber}>{userListings.length}</Text>
          <Text style={styles.statLabel}>Offres</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push('/quotes')}
        >
          <Award size={24} color="#9B59B6" />
          <Text style={styles.statNumber}>{completedQuotes}</Text>
          <Text style={styles.statLabel}>Terminés</Text>
        </TouchableOpacity>
      </View>
      
      {/* Contact Info */}
      {(user.phone || user.email || user.website || user.instagram) && (
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactInfo}>
            {user.phone && (
              <View style={styles.contactItem}>
                <Phone size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{user.phone}</Text>
              </View>
            )}
            {user.email && (
              <View style={styles.contactItem}>
                <Mail size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{user.email}</Text>
              </View>
            )}
            {user.website && (
              <View style={styles.contactItem}>
                <Globe size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{user.website}</Text>
              </View>
            )}
            {user.instagram && (
              <View style={styles.contactItem}>
                <Instagram size={20} color="#E4405F" />
                <Text style={styles.contactText}>{user.instagram}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={`menu-item-${index}`}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <item.icon size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Déconnexion</Text>
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
  scrollContent: {
    paddingBottom: 40,
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
    marginTop: 20,
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
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  userType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  ratingContainer: {
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    marginTop: -20,
    zIndex: 1,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  contactSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  menuSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutSection: {
    margin: 20,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});