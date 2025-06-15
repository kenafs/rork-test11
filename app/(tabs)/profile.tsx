import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useListings } from '@/hooks/useListings';
import { useQuotes } from '@/hooks/useQuotes';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import { 
  Settings, 
  Heart, 
  Star, 
  FileText, 
  Globe, 
  Edit3, 
  LogOut,
  ChevronRight,
  Award,
  TrendingUp
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { getUserListings } = useListings();
  const { getUserQuotes } = useQuotes();
  
  const userListings = getUserListings();
  const userQuotes = getUserQuotes();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
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
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };
  
  const getUserTypeLabel = () => {
    switch (user.userType) {
      case 'provider':
        return 'Prestataire';
      case 'business':
        return 'Établissement';
      default:
        return 'Client';
    }
  };
  
  const getUserTypeColor = () => {
    switch (user.userType) {
      case 'provider':
        return '#10B981';
      case 'business':
        return '#F59E0B';
      default:
        return '#6366F1';
    }
  };

  // Calculate average rating from completed quotes (mock calculation)
  const completedQuotes = userQuotes.filter(q => q.status === 'accepted');
  const averageRating = user.rating || 4.8;
  const totalReviews = user.reviewCount || completedQuotes.length;

  const statsData = [
    {
      icon: Heart,
      label: 'Favoris',
      value: favorites.length.toString(),
      color: '#EF4444',
      onPress: () => router.push('/favorites')
    },
    {
      icon: Star,
      label: 'Note',
      value: averageRating.toFixed(1),
      color: '#F59E0B',
      onPress: () => router.push(`/reviews?id=${user.id}&type=provider`)
    },
    {
      icon: FileText,
      label: user.userType === 'provider' ? 'Devis' : 'Offres',
      value: user.userType === 'provider' ? userQuotes.length.toString() : userListings.length.toString(),
      color: '#8B5CF6',
      onPress: () => user.userType === 'provider' ? router.push('/quotes') : router.push('/my-listings')
    },
    {
      icon: Globe,
      label: 'En ligne',
      value: '12',
      color: '#10B981',
      onPress: () => router.push('/my-listings')
    }
  ];
  
  const menuItems = [
    {
      icon: Edit3,
      title: 'Modifier le profil',
      subtitle: 'Informations personnelles',
      onPress: () => router.push('/edit-profile')
    },
    {
      icon: FileText,
      title: user.userType === 'provider' ? 'Mes devis' : 'Mes annonces',
      subtitle: user.userType === 'provider' ? 'Gérer vos devis' : 'Gérer vos annonces',
      onPress: () => user.userType === 'provider' ? router.push('/quotes') : router.push('/my-listings')
    },
    {
      icon: Heart,
      title: 'Mes favoris',
      subtitle: 'Annonces sauvegardées',
      onPress: () => router.push('/favorites')
    },
    {
      icon: Star,
      title: 'Avis et notes',
      subtitle: 'Voir tous les avis',
      onPress: () => router.push(`/reviews?id=${user.id}&type=provider`)
    },
    {
      icon: Settings,
      title: 'Paramètres',
      subtitle: 'Préférences et confidentialité',
      onPress: () => router.push('/settings')
    }
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
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
            )}
            <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor() }]}>
              <Text style={styles.userTypeText}>{getUserTypeLabel()}</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {user.rating && (
            <View style={styles.ratingContainer}>
              <RatingStars 
                rating={user.rating} 
                reviewCount={totalReviews}
                size="medium" 
              />
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Gérez vos annonces et développez votre activité</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <TouchableOpacity
              key={`stat-${index}-${stat.label}`}
              style={styles.statCard}
              onPress={stat.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={`menu-${index}-${item.title}`}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <item.icon size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  userTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  ratingContainer: {
    marginTop: 8,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutContainer: {
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },
});