import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useQuotes } from '@/hooks/useQuotes';
import { useFavorites } from '@/hooks/useFavorites';
import { getReviewsByUser } from '@/mocks/reviews';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { 
  Settings, 
  Edit, 
  Heart, 
  Star, 
  FileText, 
  MessageCircle, 
  LogOut,
  User,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { getUserListings } = useListings();
  const { getQuotesForUser } = useQuotes();
  const { favorites } = useFavorites();
  
  if (!isAuthenticated || !user) {
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
  
  // Get user statistics
  const userListings = getUserListings();
  const userQuotes = getQuotesForUser(user.id);
  const userReviews = getReviewsByUser(user.id);
  const userFavorites = favorites;
  
  // Calculate average rating from reviews user has received
  const receivedReviews = userReviews.filter(review => review.targetId === user.id);
  const averageRating = receivedReviews.length > 0 
    ? receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length 
    : user.rating || 0;
  
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
  
  const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    color, 
    onPress 
  }: { 
    icon: any; 
    value: string | number; 
    label: string; 
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>{user.name.charAt(0)}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeText}>
              {user.userType === 'provider' ? '🎯 Prestataire' : 
               user.userType === 'business' ? '🏢 Établissement' : 
               '👤 Client'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Edit size={16} color="#fff" />
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Statistics Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <StatCard
            icon={Heart}
            value={userFavorites.length}
            label="Favoris"
            color="#E91E63"
            onPress={() => router.push('/favorites')}
          />
          <StatCard
            icon={Star}
            value={averageRating.toFixed(1)}
            label="Note"
            color="#FFD700"
            onPress={() => router.push(`/reviews?id=${user.id}&type=${user.userType}`)}
          />
          <StatCard
            icon={FileText}
            value={userListings.length}
            label="Offres"
            color="#4CAF50"
            onPress={() => router.push('/my-listings')}
          />
          <StatCard
            icon={TrendingUp}
            value={userQuotes.length}
            label="Devis"
            color="#2196F3"
            onPress={() => router.push('/quotes')}
          />
        </View>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/my-listings')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#4CAF5020' }]}>
              <FileText size={20} color="#4CAF50" />
            </View>
            <Text style={styles.menuItemText}>Mes annonces</Text>
          </View>
          <Text style={styles.menuItemBadge}>{userListings.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/quotes')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#2196F320' }]}>
              <TrendingUp size={20} color="#2196F3" />
            </View>
            <Text style={styles.menuItemText}>Mes devis</Text>
          </View>
          <Text style={styles.menuItemBadge}>{userQuotes.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/favorites')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#E91E6320' }]}>
              <Heart size={20} color="#E91E63" />
            </View>
            <Text style={styles.menuItemText}>Mes favoris</Text>
          </View>
          <Text style={styles.menuItemBadge}>{userFavorites.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push(`/reviews?id=${user.id}&type=${user.userType}`)}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFD70020' }]}>
              <Star size={20} color="#FFD700" />
            </View>
            <Text style={styles.menuItemText}>Mes avis</Text>
          </View>
          <Text style={styles.menuItemBadge}>{receivedReviews.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/messages')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#9C27B020' }]}>
              <MessageCircle size={20} color="#9C27B0" />
            </View>
            <Text style={styles.menuItemText}>Messages</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#60708020' }]}>
              <Settings size={20} color="#607080" />
            </View>
            <Text style={styles.menuItemText}>Paramètres</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#F44336" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImagePlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  userTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    padding: 20,
    marginTop: -20,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  menuItemBadge: {
    backgroundColor: Colors.primary,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F4433620',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  bottomSpacer: {
    height: 40,
  },
});