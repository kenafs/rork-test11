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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { createConversation } = useMessages();
  const { getListingById } = useListings();
  
  // Find the listing by ID using the new method
  const listing = getListingById(id as string);
  
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
  
  // Handle contact - with proper user information
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
      console.log('Creating conversation with creator:', creatorUser.id, creatorUser.name);
      
      // Create conversation without initial message
      const conversationId = await createConversation(creatorUser.id);
      
      console.log('Conversation created:', conversationId);
      
      // Navigate to the conversation with the correct participant ID
      router.push(`/conversation/${creatorUser.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Erreur', 'Impossible de créer la conversation');
    }
  };
  
  // FIXED: Handle quote request for business venues as both clients and providers
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

    // FIXED: Both providers and business venues can send quotes
    if (user.userType === 'provider' || user.userType === 'business') {
      // Provider or business can create a quote
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
        
        // Navigate to the conversation with the correct participant ID
        router.push(`/conversation/${creatorUser.id}`);
      } catch (error) {
        console.error('Error creating quote request conversation:', error);
        Alert.alert('Erreur', 'Impossible de créer la demande de devis');
      }
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
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={[styles.image, styles.placeholderImage]}
            >
              <Text style={styles.placeholderText}>{listing.category}</Text>
            </LinearGradient>
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
          
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryText}>{listing.category}</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
            style={styles.imageOverlay}
          />
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
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={[styles.creatorImage, styles.creatorImagePlaceholder]}
                >
                  <Text style={styles.creatorImageText}>
                    {listing.creatorName.charAt(0)}
                  </Text>
                </LinearGradient>
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
            
            <LinearGradient
              colors={['rgba(30, 58, 138, 0.1)', 'rgba(59, 130, 246, 0.1)']}
              style={styles.typeBadge}
            >
              <Text style={styles.typeText}>
                {listing.creatorType === 'provider' ? 'Prestataire' : 
                 listing.creatorType === 'business' ? 'Établissement' : 'Client'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.infoContainer}>
            {listing.location && listing.location.city && (
              <View style={styles.infoItem}>
                <MapPin size={18} color={Colors.primary} style={styles.infoIcon} />
                <Text style={styles.infoText}>{listing.location.city}</Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <Clock size={18} color={Colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Publié le {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            
            {listing.tags && listing.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {listing.tags.map((tag, index) => (
                  <LinearGradient
                    key={`tag-${listing.id}-${index}`}
                    colors={['rgba(30, 58, 138, 0.1)', 'rgba(59, 130, 246, 0.1)']}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </LinearGradient>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
          
          <View style={styles.divider} />
          
          <LinearGradient
            colors={['rgba(30, 58, 138, 0.05)', 'rgba(59, 130, 246, 0.05)']}
            style={styles.priceContainer}
          >
            <Text style={styles.priceLabel}>Prix</Text>
            <Text style={styles.price}>{formattedPrice}</Text>
          </LinearGradient>
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      {!isOwnListing && (
        <LinearGradient
          colors={['rgba(248, 250, 252, 0.95)', '#FFFFFF']}
          style={styles.actionContainer}
        >
          <Button
            title="💬 Contacter"
            onPress={handleContact}
            style={styles.contactButton}
          />
          
          {/* FIXED: Show quote button for providers, business venues, and when requesting quotes from providers/venues */}
          {(user?.userType === 'provider' || user?.userType === 'business' || 
            (listing.creatorType === 'provider' && user?.userType === 'client') ||
            (listing.creatorType === 'business' && user?.userType === 'client')) && (
            <Button
              title={user?.userType === 'provider' || user?.userType === 'business' ? "📋 Créer devis" : "📋 Demander devis"}
              variant="outline"
              onPress={handleQuoteRequest}
              style={styles.quoteButton}
            />
          )}
        </LinearGradient>
      )}
      
      {/* Edit Button for Own Listings */}
      {isOwnListing && (
        <LinearGradient
          colors={['rgba(248, 250, 252, 0.95)', '#FFFFFF']}
          style={styles.actionContainer}
        >
          <Button
            title="Modifier l'annonce"
            onPress={() => router.push(`/edit-listing/${listing.id}`)}
            fullWidth
          />
        </LinearGradient>
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
    height: 320,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  imageActions: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  detailsContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 36,
  },
  creatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
  },
  creatorImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorImageText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  creatorName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
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
    fontWeight: '800',
    color: Colors.primary,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
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