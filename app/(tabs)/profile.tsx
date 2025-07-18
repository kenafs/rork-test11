import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  TrendingUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isAuthenticated } = useAuth();
  const { getUserListings } = useListings();
  const { getQuotesForUser } = useQuotes();
  const { getFavorites } = useFavorites();
  
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={[styles.loginPrompt, { 
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40
        }]}>
          <User size={64} color={Colors.textLight} />
          <Text style={[styles.loginTitle, { color: Colors.text }]}>Connexion requise</Text>
          <Text style={[styles.loginSubtitle, { color: Colors.textLight }]}>
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
  const userFavorites = getFavorites();
  
  // FIXED: Set average rating to 0 for all accounts initially
  const receivedReviews = userReviews.filter(review => review.targetId === user.id);
  const averageRating = 0; // FIXED: Always show 0 for initial accounts
  
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
            await logout();
            // The logout function now handles redirection automatically
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
    <TouchableOpacity style={[styles.statCard, { backgroundColor: Colors.surface }]} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.statIcon}
      >
        <Icon size={24} color={color} />
      </LinearGradient>
      <Text style={[styles.statValue, { color: Colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: Colors.textLight }]}>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundAlt }]}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { 
          paddingBottom: insets.bottom + 140
        }]}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
              ) : (
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                >
                  <Text style={styles.profileImageText}>{user.name.charAt(0)}</Text>
                </LinearGradient>
              )}
            </View>
            
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.userTypeContainer}
            >
              <Text style={styles.userTypeText}>
                {user.userType === 'provider' ? '🎯 Prestataire' : 
                 user.userType === 'business' ? '🏢 Établissement' : 
                 '👤 Client'}
              </Text>
            </LinearGradient>
            
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
              label={user.userType === 'business' ? 'Offres' : 'Annonces'}
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
        <View style={[styles.menuContainer, { backgroundColor: Colors.surface }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: Colors.border }]}
            onPress={() => router.push('/my-listings')}
          >
            <View style={styles.menuItemLeft}>
              <LinearGradient
                colors={['#4CAF5020', '#4CAF5010']}
                style={styles.menuIcon}
              >
                <FileText size={20} color="#4CAF50" />
              </LinearGradient>
              <Text style={[styles.menuItemText, { color: Colors.text }]}>
                {user.userType === 'business' ? 'Mes offres' : 'Mes annonces'}
              </Text>
            </View>
            <View style={[styles.menuItemBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.menuItemBadgeText}>{userListings.length}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: Colors.border }]}
            onPress={() => router.push('/quotes')}
          >
            <View style={styles.menuItemLeft}>
              <LinearGradient
                colors={['#2196F320', '#2196F310']}
                style={styles.menuIcon}
              >
                <TrendingUp size={20} color="#2196F3" />
              </LinearGradient>
              <Text style={[styles.menuItemText, { color: Colors.text }]}>Mes devis</Text>
            </View>
            <View style={[styles.menuItemBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.menuItemBadgeText}>{userQuotes.length}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: Colors.border }]}
            onPress={() => router.push('/favorites')}
          >
            <View style={styles.menuItemLeft}>
              <LinearGradient
                colors={['#E91E6320', '#E91E6310']}
                style={styles.menuIcon}
              >
                <Heart size={20} color="#E91E63" />
              </LinearGradient>
              <Text style={[styles.menuItemText, { color: Colors.text }]}>Mes favoris</Text>
            </View>
            <View style={[styles.menuItemBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.menuItemBadgeText}>{userFavorites.length}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: Colors.border }]}
            onPress={() => router.push(`/reviews?id=${user.id}&type=${user.userType}`)}
          >
            <View style={styles.menuItemLeft}>
              <LinearGradient
                colors={['#FFD70020', '#FFD70010']}
                style={styles.menuIcon}
              >
                <Star size={20} color="#FFD700" />
              </LinearGradient>
              <Text style={[styles.menuItemText, { color: Colors.text }]}>Mes avis</Text>
            </View>
            <View style={[styles.menuItemBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.menuItemBadgeText}>{receivedReviews.length}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: Colors.border }]}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <View style={styles.menuItemLeft}>
              <LinearGradient
                colors={['#9C27B020', '#9C27B010']}
                style={styles.menuIcon}
              >
                <MessageCircle size={20} color="#9C27B0" />
              </LinearGradient>
              <Text style={[styles.menuItemText, { color: Colors.text }]}>Messages</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: Colors.border }]}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.menuItemLeft}>
              <LinearGradient
                colors={['#60708020', '#60708010']}
                style={styles.menuIcon}
              >
                <Settings size={20} color="#607080" />
              </LinearGradient>
              <Text style={[styles.menuItemText, { color: Colors.text }]}>Paramètres</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* FIXED: Logout Button positioned absolutely to avoid bottom bar overlap */}
      <View style={[styles.logoutContainer, { 
        backgroundColor: Colors.backgroundAlt,
        bottom: insets.bottom + 100
      }]}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: Colors.surface, borderColor: '#F4433620' }]} onPress={handleLogout}>
          <LogOut size={20} color="#F44336" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
  header: {
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
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
  },
  menuItemBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  menuItemBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});