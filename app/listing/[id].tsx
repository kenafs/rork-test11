import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { mockProviders, mockVenues } from '@/mocks/users';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import RatingStars from '@/components/RatingStars';
import { MapPin, Calendar, Heart, Share, MessageCircle, Star, Phone, Mail, Globe, Instagram, FileText, User, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getListingById } = useListings();
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const listing = getListingById(id as string);
  
  if (!listing) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ 
          title: "Annonce non trouvée",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          )
        }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Annonce non trouvée</Text>
          <Text style={styles.errorText}>
            Cette annonce n'existe pas ou a été supprimée.
          </Text>
          <Button 
            title="Retour aux annonces"
            onPress={() => router.push('/(tabs)')}
            style={styles.backToListingsButton}
          />
        </View>
      </View>
    );
  }
  
  // Find the creator in mock data
  const allUsers = [...mockProviders, ...mockVenues];
  const creator = allUsers.find(u => u.id === listing.createdBy);
  
  const isFavorite = favorites.some(fav => fav.id === listing.id);
  const isOwnListing = user?.id === listing.createdBy;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const handleFavoriteToggle = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isFavorite) {
      removeFromFavorites(listing.id);
    } else {
      addToFavorites(listing.id);
    }
  };
  
  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // In a real app, you would use Expo Sharing
      Alert.alert('Partager', 'Fonctionnalité de partage à implémenter');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleContact = () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour contacter ce prestataire.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    
    if (isOwnListing) {
      Alert.alert('Information', 'Vous ne pouvez pas vous contacter vous-même.');
      return;
    }
    
    // Navigate to conversation
    router.push(`/conversation/new?participantId=${listing.createdBy}&listingId=${listing.id}`);
  };
  
  const handleCreateQuote = () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer un devis.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    
    if (user.userType !== 'provider') {
      Alert.alert('Accès restreint', 'Seuls les prestataires peuvent créer des devis.');
      return;
    }
    
    if (isOwnListing) {
      Alert.alert('Information', 'Vous ne pouvez pas créer un devis pour votre propre annonce.');
      return;
    }
    
    router.push(`/create-quote/${listing.id}`);
  };
  
  const handleCallCreator = () => {
    if (creator?.phone) {
      Linking.openURL(`tel:${creator.phone}`);
    } else {
      Alert.alert('Information', 'Numéro de téléphone non disponible.');
    }
  };
  
  const handleEmailCreator = () => {
    if (creator?.email) {
      Linking.openURL(`mailto:${creator.email}`);
    } else {
      Alert.alert('Information', 'Adresse email non disponible.');
    }
  };
  
  const handleVisitWebsite = () => {
    if (creator?.website) {
      const url = creator.website.startsWith('http') ? creator.website : `https://${creator.website}`;
      Linking.openURL(url);
    }
  };
  
  const handleVisitInstagram = () => {
    if (creator?.instagram) {
      const username = creator.instagram.replace('@', '');
      Linking.openURL(`https://instagram.com/${username}`);
    }
  };
  
  const handleViewProfile = () => {
    if (creator) {
      router.push(`/profile/${creator.id}`);
    }
  };
  
  const handleViewReviews = () => {
    router.push(`/reviews?id=${listing.createdBy}&type=user`);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: listing.title,
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFavoriteToggle} style={styles.headerButton}>
              <Heart 
                size={24} 
                color={isFavorite ? '#FF6B6B' : Colors.primary}
                fill={isFavorite ? '#FF6B6B' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        )
      }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Images */}
        {listing.images && listing.images.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                setSelectedImageIndex(index);
              }}
            >
              {listing.images.map((image, index) => (
                <Image 
                  key={`listing-image-${listing.id}-${index}`}
                  source={{ uri: image }} 
                  style={styles.listingImage} 
                />
              ))}
            </ScrollView>
            {listing.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {listing.images.map((_, index) => (
                  <View 
                    key={`image-indicator-${listing.id}-${index}`}
                    style={[
                      styles.imageIndicator,
                      selectedImageIndex === index && styles.activeImageIndicator
                    ]} 
                  />
                ))}
              </View>
            )}
          </View>
        )}
        
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{listing.title}</Text>
            {listing.price && (
              <Text style={styles.price}>{listing.price}€</Text>
            )}
          </View>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>{listing.location.city}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>
                Publié le {formatDate(listing.createdAt)}
              </Text>
            </View>
          </View>
          
          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {listing.tags.map((tag, index) => (
                <View key={`listing-tag-${listing.id}-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Creator Info */}
        <View style={styles.creatorSection}>
          <Text style={styles.sectionTitle}>
            {listing.creatorType === 'provider' ? 'Prestataire' : 
             listing.creatorType === 'business' ? 'Établissement' : 'Publié par'}
          </Text>
          
          <TouchableOpacity style={styles.creatorCard} onPress={handleViewProfile}>
            <View style={styles.creatorInfo}>
              {listing.creatorImage ? (
                <Image source={{ uri: listing.creatorImage }} style={styles.creatorAvatar} />
              ) : (
                <View style={[styles.creatorAvatar, styles.avatarPlaceholder]}>
                  <User size={24} color="#fff" />
                </View>
              )}
              
              <View style={styles.creatorDetails}>
                <Text style={styles.creatorName}>{listing.creatorName}</Text>
                {listing.creatorRating && (
                  <TouchableOpacity onPress={handleViewReviews}>
                    <RatingStars 
                      rating={listing.creatorRating} 
                      reviewCount={listing.creatorReviewCount}
                      size="small"
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.creatorType}>
                  {listing.creatorType === 'provider' ? 'Prestataire' : 
                   listing.creatorType === 'business' ? 'Établissement' : 'Client'}
                </Text>
              </View>
            </View>
            
            <View style={styles.creatorActions}>
              {creator?.phone && (
                <TouchableOpacity style={styles.contactButton} onPress={handleCallCreator}>
                  <Phone size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
              {creator?.email && (
                <TouchableOpacity style={styles.contactButton} onPress={handleEmailCreator}>
                  <Mail size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
              {creator?.website && (
                <TouchableOpacity style={styles.contactButton} onPress={handleVisitWebsite}>
                  <Globe size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
              {creator?.instagram && (
                <TouchableOpacity style={styles.contactButton} onPress={handleVisitInstagram}>
                  <Instagram size={20} color="#E4405F" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>
        
        {/* Category */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Catégorie</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      {!isOwnListing && (
        <View style={styles.actionButtons}>
          <Button
            title="💬 Contacter"
            onPress={handleContact}
            variant="outline"
            style={styles.contactActionButton}
          />
          {user?.userType === 'provider' && (
            <Button
              title="📋 Devis"
              onPress={handleCreateQuote}
              style={styles.quoteButton}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  listingImage: {
    width: '100%',
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeImageIndicator: {
    backgroundColor: '#fff',
  },
  headerInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  creatorSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  creatorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  creatorType: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  creatorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  categorySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(62, 146, 204, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  contactActionButton: {
    flex: 1,
  },
  quoteButton: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backToListingsButton: {
    backgroundColor: Colors.primary,
  },
});