import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
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
import { MapPin, Calendar, MessageCircle, Star, Instagram, Globe, Facebook, Linkedin, ExternalLink } from 'lucide-react-native';
import { Provider, Venue } from '@/types';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { getCompletedQuotesBetweenUsers } = useQuotes();
  
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
    
    // Check if there are completed quotes between users
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
    
    // Navigate to conversation
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
  
  // Get social links
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
            if (!url) return null;
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
  
  // Render portfolio
  const renderPortfolio = () => {
    const portfolio = user.portfolio || [];
    
    if (portfolio.length === 0) return null;
    
    return (
      <View style={styles.portfolioSection}>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.portfolioGrid}>
            {portfolio.map((imageUrl: string, index: number) => (
              <TouchableOpacity key={`portfolio-${index}`} style={styles.portfolioItem}>
                <Image source={{ uri: imageUrl }} style={styles.portfolioImage} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
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
          
          {user.rating && (
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
      
      {/* Portfolio */}
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
  portfolioGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  portfolioItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
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
});