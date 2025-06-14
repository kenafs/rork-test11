import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useMessages } from '@/hooks/useMessages';
import { useListings } from '@/hooks/useListings';
import { mockProviders, mockVenues } from '@/mocks/users';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import { MapPin, Star, Clock, ChevronLeft, Share, Heart, MessageCircle, Calculator } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { createConversation } = useMessages();
  const { getAllListings } = useListings();
  
  // Find the listing by ID from all listings
  const allListings = getAllListings();
  const listing = allListings.find(item => item.id === id);
  
  if (!listing) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Annonce non trouvée</Text>
        <Button 
          title="Retour aux annonces" 
          onPress={() => router.back()}
          style={styles.backButtonStyle}
        />
      </View>
    );
  }
  
  // Find the creator user
  const allUsers = [...mockProviders, ...mockVenues];
  const creatorUser = allUsers.find(u => u.id === listing.createdBy);
  
  // Format date if available
  const formattedDate = listing.date 
    ? new Date(listing.date).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : null;
  
  // Format price
  const formattedPrice = listing.price 
    ? `${listing.price.toLocaleString('fr-FR')}€${listing.category === 'Catering' ? '/pers' : ''}`
    : 'Prix sur demande';
  
  // Handle favorite toggle
  const toggleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isFavorite(listing.id)) {
      removeFromFavorites(listing.id);
    } else {
      addToFavorites(listing.id);
    }
  };
  
  // Handle share
  const handleShare = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Partager', 'Fonctionnalité de partage à implémenter');
  };
  
  // Handle contact - create conversation with proper user info
  const handleContact = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour contacter ce prestataire ou établissement.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (!user || !creatorUser) {
      Alert.alert('Erreur', 'Impossible de créer la conversation');
      return;
    }

    try {
      console.log('Creating conversation with creator:', creatorUser.name, creatorUser.id);
      
      // Create conversation without initial message
      const conversationId = await createConversation(creatorUser.id);
      
      console.log('Conversation created successfully:', conversationId);
      
      // Navigate to the conversation with the creator's ID
      router.push(`/conversation/${creatorUser.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Erreur', 'Impossible de créer la conversation');
    }
  };
  
  // Handle quote request
  const handleQuoteRequest = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour demander un devis.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    
    if (!user || !creatorUser) {
      Alert.alert('Erreur', 'Impossible de créer la demande de devis');
      return;
    }

    // Only providers can send quotes, clients can request quotes
    if (user.userType === 'provider') {
      // Provider can create a quote
      router.push(`/create-quote/${listing.id}`);
    } else if (user.userType === 'client') {
      // Client can request a quote via message
      try {
        console.log('Requesting quote via message for listing:', listing.id);
        
        const conversationId = await createConversation(
          creatorUser.id,
          `Bonjour, je souhaiterais recevoir un devis pour votre annonce "${listing.title}". Pourriez-vous me faire une proposition ?`,
          listing.id
        );
        
        console.log('Quote request conversation created:', conversationId);
        
        // Navigate to the conversation with the creator's ID
        router.push(`/conversation/${creatorUser.id}`);
      } catch (error) {
        console.error('Error creating quote request conversation:', error);
        Alert.alert('Erreur', 'Impossible de créer la demande de devis');
      }
    } else {
      // Business accounts cannot request quotes
      Alert.alert('Non disponible', 'Cette fonctionnalité n\'est pas disponible pour les établissements.');
    }
  };
  
  // Check if the listing belongs to the current user
  const isOwnListing = user && listing.createdBy === user.id;
  const isListingFavorite = isAuthenticated && isFavorite(listing.id);
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {listing.images && listing.images.length > 0 ? (
            <Image 
              source={{ uri: listing.images[0] }} 
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>{listing.category}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={styles.imageActionButton}
              onPress={handleShare}
            >
              <Share size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageActionButton}
              onPress={toggleFavorite}
            >
              <Heart 
                size={20} 
                color="#fff" 
                fill={isListingFavorite ? '#fff' : 'transparent'} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
        </View>
        
        {/* Listing Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{listing.title}</Text>
          
          <TouchableOpacity 
            style={styles.creatorContainer}
            onPress={() => router.push(`/profile/${listing.createdBy}`)}
          >
            <View style={styles.creatorInfo}>
              {listing.creatorImage ? (
                <Image 
                  source={{ uri: listing.creatorImage }} 
                  style={styles.creatorImage}
                />
              ) : (
                <View style={[styles.creatorImage, styles.creatorImagePlaceholder]}>
                  <Text style={styles.creatorImageText}>
                    {listing.creatorName.charAt(0)}
                  </Text>
                </View>
              )}
              
              <View>
                <Text style={styles.creatorName}>{listing.creatorName}</Text>
                {listing.creatorRating && (
                  <RatingStars 
                    rating={listing.creatorRating} 
                    size="small" 
                    showNumber={false}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {listing.creatorType === 'provider' ? 'Prestataire' : 
                 listing.creatorType === 'business' ? 'Établissement' : 'Client'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.infoContainer}>
            {listing.location && listing.location.city && (
              <View style={styles.infoItem}>
                <MapPin size={18} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.infoText}>{listing.location.city}</Text>
              </View>
            )}
            
            {formattedDate && (
              <View style={styles.infoItem}>
                <Clock size={18} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.infoText}>{formattedDate}</Text>
              </View>
            )}
            
            {listing.tags && listing.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {listing.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Prix</Text>
            <Text style={styles.price}>{formattedPrice}</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      {!isOwnListing && (
        <View style={styles.actionContainer}>
          <Button
            title="💬 Contacter"
            onPress={handleContact}
            style={styles.contactButton}
          />
          
          {/* Only show quote button for providers or when requesting quotes from providers */}
          {(user?.userType === 'provider' || (listing.creatorType === 'provider' && user?.userType === 'client')) && (
            <Button
              title={user?.userType === 'provider' ? "📋 Créer devis" : "📋 Demander devis"}
              variant="outline"
              onPress={handleQuoteRequest}
              style={styles.quoteButton}
            />
          )}
        </View>
      )}
      
      {/* Edit Button for Own Listings */}
      {isOwnListing && (
        <View style={styles.actionContainer}>
          <Button
            title="Modifier l'annonce"
            onPress={() => router.push(`/edit-listing/${listing.id}`)}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
  },
  imageActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 32,
  },
  creatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  creatorImagePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorImageText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
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
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 20,
    borderRadius: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: Platform.OS === 'ios' ? 90 : 75,
  },
  contactButton: {
    flex: 1,
    marginRight: 8,
  },
  quoteButton: {
    flex: 1,
    marginLeft: 8,
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
  backButtonStyle: {
    marginTop: 16,
  },
});