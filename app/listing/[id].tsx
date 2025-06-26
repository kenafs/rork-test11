import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useFavoritesComputed } from '@/hooks/useFavorites';
import { useMessages } from '@/hooks/useMessages';
import { useListings } from '@/hooks/useListings';
import { mockProviders, mockVenues } from '@/mocks/users';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import { MapPin, Star, Clock, ChevronLeft, Share, Heart, MessageCircle, Calculator } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  useAnimatedScrollHandler,
  FadeIn,
  SlideInDown,
  ZoomIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesComputed();
  const { createConversation } = useMessages();
  const { getListingById } = useListings();
  
  const scrollY = useSharedValue(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Find the listing by ID
  const listing = getListingById(id as string);
  
  if (!listing) {
    return (
      <View style={[styles.notFoundContainer, { paddingTop: insets.top + 20 }]}>
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
  
  // Scroll handler for parallax effect
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  // Animated styles for parallax and blur effects
  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 300],
      [0, -150],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      scrollY.value,
      [0, 300],
      [1, 1.2],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }, { scale }],
    };
  });
  
  const headerControlsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [200, 300],
      [1, 0.9],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  // Handle favorite toggle
  const toggleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
  
  // Handle contact
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
      
      const conversationId = await createConversation(creatorUser.id);
      
      console.log('Conversation created:', conversationId);
      
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

    if (user.userType === 'provider' || user.userType === 'business') {
      router.push(`/create-quote/${listing.id}`);
    } else if (user.userType === 'client') {
      try {
        console.log('Requesting quote via message for listing:', listing.id);
        
        const conversationId = await createConversation(
          creatorUser.id,
          `Bonjour, je souhaiterais recevoir un devis pour votre annonce "${listing.title}". Pourriez-vous me faire une proposition ?`,
          listing.id
        );
        
        console.log('Quote request conversation created:', conversationId);
        
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
      <AnimatedScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery with Parallax */}
        <Animated.View style={[styles.imageContainer, headerStyle]}>
          {listing.images && listing.images.length > 0 ? (
            <Image 
              source={{ uri: listing.images[0] }} 
              style={styles.image}
              contentFit="cover"
              onLoad={() => setImageLoaded(true)}
              transition={500}
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={[styles.image, styles.placeholderImage]}
            >
              <Text style={styles.placeholderText}>{listing.category}</Text>
            </LinearGradient>
          )}
          
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'transparent', 'rgba(0, 0, 0, 0.6)']}
            style={styles.imageOverlay}
          />
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
        </Animated.View>
        
        {/* Content Card */}
        <Animated.View 
          entering={SlideInDown.delay(300).springify()}
          style={styles.contentCard}
        >
          <View style={styles.detailsContainer}>
            <Animated.Text 
              entering={FadeIn.delay(400)}
              style={styles.title}
            >
              {listing.title}
            </Animated.Text>
            
            <Animated.View 
              entering={FadeIn.delay(500)}
              style={styles.creatorContainer}
            >
              <TouchableOpacity 
                style={styles.creatorInfo}
                onPress={() => router.push(`/profile/${listing.createdBy}`)}
              >
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
                
                <View style={styles.creatorDetails}>
                  <Text style={styles.creatorName}>{listing.creatorName}</Text>
                  {listing.creatorRating && (
                    <RatingStars 
                      rating={listing.creatorRating} 
                      size="small" 
                      showNumber={false}
                    />
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {listing.creatorType === 'provider' ? 'Prestataire' : 
                   listing.creatorType === 'business' ? 'Établissement' : 'Client'}
                </Text>
              </View>
            </Animated.View>
            
            <Animated.View 
              entering={FadeIn.delay(600)}
              style={styles.infoContainer}
            >
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
                    <Animated.View
                      key={`tag-${listing.id}-${index}`}
                      entering={ZoomIn.delay(700 + index * 100)}
                      style={styles.tag}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                    </Animated.View>
                  ))}
                </View>
              )}
            </Animated.View>
            
            <View style={styles.divider} />
            
            <Animated.View entering={FadeIn.delay(800)}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </Animated.View>
            
            <View style={styles.divider} />
            
            <Animated.View entering={SlideInDown.delay(900)}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Prix</Text>
                <Text style={styles.price}>{formattedPrice}</Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
      
      {/* Floating Header Controls */}
      <Animated.View style={[styles.headerControls, { paddingTop: insets.top + 10 }, headerControlsStyle]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Share size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleFavorite}
          >
            <Heart 
              size={20} 
              color="#fff" 
              fill={isListingFavorite ? '#fff' : 'transparent'} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Floating Action Buttons */}
      {!isOwnListing && (
        <Animated.View 
          entering={SlideInDown.delay(1000)}
          style={[styles.actionContainer, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.actionBlur}>
            <Button
              title="💬 Contacter"
              onPress={handleContact}
              style={styles.contactButton}
            />
            
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
          </View>
        </Animated.View>
      )}
      
      {/* Edit Button for Own Listings */}
      {isOwnListing && (
        <Animated.View 
          entering={SlideInDown.delay(1000)}
          style={[styles.actionContainer, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.actionBlur}>
            <Button
              title="Modifier l'annonce"
              onPress={() => router.push(`/edit-listing/${listing.id}`)}
              fullWidth
            />
          </View>
        </Animated.View>
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
    height: 320,
    position: 'relative',
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
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  headerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 1,
  },
  detailsContainer: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 32,
  },
  creatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  creatorImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorImageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
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
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionBlur: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  contactButton: {
    flex: 1,
  },
  quoteButton: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  backButtonStyle: {
    marginTop: 16,
  },
});