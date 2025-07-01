import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Alert, Dimensions, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import { mockProviders, mockVenues } from '@/mocks/users';
import { mockListings } from '@/mocks/listings';
import { mockReviews, getReviewsForUser } from '@/mocks/reviews';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import ListingCard from '@/components/ListingCard';
import { 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Star, 
  Instagram, 
  Globe, 
  Facebook, 
  Linkedin, 
  ExternalLink,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react-native';
import { Provider, Venue, PortfolioItem } from '@/types';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { getCompletedQuotesBetweenUsers } = useQuotes();
  
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState(0);
  
  // Find the user by ID
  const allUsers = [...mockProviders, ...mockVenues];
  const user = allUsers.find(u => u.id === id);
  
  // Get user's listings
  const userListings = mockListings.filter(listing => listing.createdBy === id);
  
  // Get reviews for this user
  const reviews = getReviewsForUser(id || '');
  
  // Check if current user can review this user
  const canReview = () => {
    if (!currentUser || !user || currentUser.id === user.id) return false;
    
    const completedQuotes = getCompletedQuotesBetweenUsers(currentUser.id, user.id);
    return completedQuotes.length > 0;
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  };
  
  // Handle contact
  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    
    router.push(`/conversation/new?recipientId=${id}`);
  };
  
  // Handle social link press
  const handleSocialLink = (url: string) => {
    if (url.startsWith('http')) {
      Linking.openURL(url);
    } else {
      Alert.alert('Lien invalide', 'Ce lien ne peut pas être ouvert');
    }
  };
  
  // Handle portfolio item press
  const handlePortfolioItemPress = (item: PortfolioItem, index: number) => {
    setSelectedPortfolioItem(item);
    setCurrentPortfolioIndex(index);
    setPortfolioModalVisible(true);
  };
  
  // Navigate portfolio
  const navigatePortfolio = (direction: 'prev' | 'next') => {
    if (!user?.portfolio) return;
    
    const newIndex = direction === 'prev' 
      ? (currentPortfolioIndex - 1 + user.portfolio.length) % user.portfolio.length
      : (currentPortfolioIndex + 1) % user.portfolio.length;
    
    setCurrentPortfolioIndex(newIndex);
    setSelectedPortfolioItem(user.portfolio[newIndex]);
  };
  
  if (!user) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Profil non trouvé</Text>
        <Button 
          title="Retour" 
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }
  
  // Check if this is the current user's profile
  const isOwnProfile = currentUser && currentUser.id === id;
  
  // Get social links safely
  const socialLinks = user.socialLinks || {};
  
  // Render provider-specific info
  const renderProviderInfo = (provider: Provider) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Services proposés</Text>
      <View style={styles.servicesList}>
        {(provider.services || []).map((service, index) => (
          <View key={`service-${provider.id}-${index}`} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>
      
      {provider.priceRange && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tarifs:</Text>
          <Text style={styles.infoValue}>
            {provider.priceRange.min}€ - {provider.priceRange.max}€
          </Text>
        </View>
      )}
      
      {provider.availability && provider.availability.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilité:</Text>
          <Text style={styles.infoValue}>{provider.availability.join(', ')}</Text>
        </View>
      )}
    </View>
  );
  
  // Render venue-specific info
  const renderVenueInfo = (venue: Venue) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Informations sur l'établissement</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Type:</Text>
        <Text style={styles.infoValue}>{venue.venueType}</Text>
      </View>
      
      {venue.capacity && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Capacité:</Text>
          <Text style={styles.infoValue}>{venue.capacity} personnes</Text>
        </View>
      )}
      
      {venue.amenities && venue.amenities.length > 0 && (
        <View>
          <Text style={styles.infoLabel}>Équipements:</Text>
          <View style={styles.servicesList}>
            {venue.amenities.map((amenity, index) => (
              <View key={`amenity-${venue.id}-${index}`} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
  
  // Render social links
  const renderSocialLinks = () => {
    if (!socialLinks || Object.keys(socialLinks).length === 0) return null;
    
    const getSocialIcon = (platform: string) => {
      switch (platform) {
        case 'instagram': return Instagram;
        case 'facebook': return Facebook;
        case 'linkedin': return Linkedin;
        case 'website': return Globe;
        default: return ExternalLink;
      }
    };
    
    const getSocialColor = (platform: string) => {
      switch (platform) {
        case 'instagram': return '#E4405F';
        case 'facebook': return '#1877F2';
        case 'linkedin': return '#0A66C2';
        case 'website': return Colors.primary;
        default: return Colors.textLight;
      }
    };
    
    return (
      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Liens et réseaux</Text>
        <View style={styles.socialLinks}>
          {Object.entries(socialLinks).map(([platform, url]) => {
            if (!url || typeof url !== 'string') return null;
            const IconComponent = getSocialIcon(platform);
            const color = getSocialColor(platform);
            
            return (
              <TouchableOpacity
                key={`social-${platform}`}
                style={[styles.socialButton, { borderColor: color }]}
                onPress={() => handleSocialLink(url)}
              >
                <IconComponent size={20} color={color} />
                <Text style={[styles.socialText, { color }]}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  // Render enhanced portfolio
  const renderPortfolio = () => {
    const portfolio = user.portfolio || [];
    
    if (portfolio.length === 0) return null;
    
    const featuredItems = portfolio.filter(item => item.featured);
    const otherItems = portfolio.filter(item => !item.featured);
    const displayItems = [...featuredItems, ...otherItems];
    
    return (
      <Animated.View entering={SlideInDown.delay(400)} style={styles.portfolioSection}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.05)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.portfolioGradient}
        >
          <View style={styles.portfolioHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <View style={styles.portfolioStats}>
              <Text style={styles.portfolioStatsText}>{portfolio.length} projets</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
            <View style={styles.portfolioGrid}>
              {displayItems.map((item, index) => (
                <Animated.View 
                  key={`portfolio-${item.id}`} 
                  entering={ZoomIn.delay(500 + index * 100)}
                >
                  <TouchableOpacity 
                    style={[styles.portfolioItem, item.featured && styles.portfolioItemFeatured]}
                    onPress={() => handlePortfolioItemPress(item, index)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.mediaUrl }} style={styles.portfolioImage} />
                    
                    {item.mediaType === 'video' && (
                      <View style={styles.videoOverlay}>
                        <BlurView intensity={20} style={styles.playButton}>
                          <Play size={16} color="#fff" fill="#fff" />
                        </BlurView>
                      </View>
                    )}
                    
                    {item.featured && (
                      <View style={styles.featuredBadge}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                      </View>
                    )}
                    
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.portfolioOverlay}
                    >
                      <Text style={styles.portfolioTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.portfolioEventType}>
                        {item.eventType}
                      </Text>
                      <Text style={styles.portfolioDate}>
                        {new Date(item.eventDate).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
          
          {portfolio.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllPortfolioButton}
              onPress={() => {
                // Open first item in modal to show all
                handlePortfolioItemPress(portfolio[0], 0);
              }}
            >
              <Eye size={16} color={Colors.primary} />
              <Text style={styles.viewAllPortfolioText}>Voir tout le portfolio</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImageText}>{user.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>
              {user.userType === 'provider' ? 'Prestataire' : 'Établissement'}
            </Text>
          </View>
          
          {user.rating !== undefined && user.rating > 0 && (
            <View style={styles.ratingContainer}>
              <RatingStars 
                rating={user.rating} 
                reviewCount={user.reviewCount} 
                size="medium"
              />
            </View>
          )}
          
          {user.location && user.location.city && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.locationText}>{user.location.city}</Text>
            </View>
          )}
        </View>
      </View>
      
      {!isOwnProfile && (
        <View style={styles.actionsContainer}>
          <Button 
            title="💬 Contacter" 
            onPress={handleContact}
            fullWidth
          />
        </View>
      )}
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {user.description || 'Aucune description disponible.'}
        </Text>
      </View>
      
      {/* Render user type specific information */}
      {user.userType === 'provider' 
        ? renderProviderInfo(user as Provider) 
        : renderVenueInfo(user as Venue)}
      
      {/* Social links */}
      {renderSocialLinks()}
      
      {/* Enhanced Portfolio */}
      {renderPortfolio()}
      
      {/* User's listings */}
      {userListings.length > 0 && (
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>Annonces de {user.name}</Text>
          {userListings.slice(0, 3).map(listing => (
            <ListingCard key={`user-listing-${listing.id}`} listing={listing} />
          ))}
          {userListings.length > 3 && (
            <Button 
              title="Voir toutes les annonces" 
              variant="outline"
              onPress={() => router.push(`/user-listings/${user.id}`)}
              style={styles.viewAllButton}
            />
          )}
        </View>
      )}
      
      {/* Reviews */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
          {isAuthenticated && !isOwnProfile && canReview() && (
            <TouchableOpacity 
              style={styles.writeReviewButton}
              onPress={() => router.push(`/reviews?id=${user.id}&type=${user.userType}`)}
            >
              <Star size={16} color={Colors.primary} />
              <Text style={styles.writeReviewText}>Écrire un avis</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {reviews.length > 0 ? (
          reviews.map(review => (
            <View key={`profile-review-${review.id}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  {review.reviewerImage ? (
                    <Image 
                      source={{ uri: review.reviewerImage }} 
                      style={styles.reviewerImage}
                    />
                  ) : (
                    <View style={[styles.reviewerImage, styles.reviewerImagePlaceholder]}>
                      <Text style={styles.reviewerImageText}>
                        {review.reviewerName.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                </View>
                <RatingStars rating={review.rating} size="small" showNumber={false} />
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {formatDate(review.createdAt)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
          </View>
        )}
      </View>
      
      {/* Portfolio Modal */}
      <Modal
        visible={portfolioModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPortfolioModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setPortfolioModalVisible(false)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            {user?.portfolio && user.portfolio.length > 1 && (
              <View style={styles.modalNavigation}>
                <TouchableOpacity 
                  style={styles.modalNavButton}
                  onPress={() => navigatePortfolio('prev')}
                >
                  <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                
                <Text style={styles.modalCounter}>
                  {currentPortfolioIndex + 1} / {user.portfolio.length}
                </Text>
                
                <TouchableOpacity 
                  style={styles.modalNavButton}
                  onPress={() => navigatePortfolio('next')}
                >
                  <ChevronRight size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </BlurView>
          
          {selectedPortfolioItem && (
            <ScrollView style={styles.modalContent}>
              <Image 
                source={{ uri: selectedPortfolioItem.mediaUrl }} 
                style={styles.modalImage}
                contentFit="cover"
              />
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{selectedPortfolioItem.title}</Text>
                <Text style={styles.modalEventType}>{selectedPortfolioItem.eventType}</Text>
                
                {selectedPortfolioItem.clientName && (
                  <Text style={styles.modalClient}>Client: {selectedPortfolioItem.clientName}</Text>
                )}
                
                <Text style={styles.modalDate}>
                  {new Date(selectedPortfolioItem.eventDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                
                <Text style={styles.modalDescription}>{selectedPortfolioItem.description}</Text>
                
                {selectedPortfolioItem.tags && selectedPortfolioItem.tags.length > 0 && (
                  <View style={styles.modalTags}>
                    {selectedPortfolioItem.tags.map((tag, index) => (
                      <View key={`tag-${index}`} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  profileImagePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  typeContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  actionsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  serviceTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  socialSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  portfolioSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  portfolioGradient: {
    padding: 20,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioStats: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  portfolioStatsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  portfolioScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  portfolioGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 20,
  },
  portfolioItem: {
    width: 200,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  portfolioItemFeatured: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    padding: 6,
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  portfolioEventType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  portfolioDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  viewAllPortfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  viewAllPortfolioText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  listingsSection: {
    padding: 16,
    paddingTop: 0,
  },
  viewAllButton: {
    marginTop: 12,
  },
  reviewsSection: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 40,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  reviewerImagePlaceholder: {
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewComment: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyReviews: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: width,
    height: width,
  },
  modalInfo: {
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  modalEventType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  modalClient: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});