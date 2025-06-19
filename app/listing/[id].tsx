import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
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
import { BlurView } from 'expo-blur';
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

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesComputed();
  const { createConversation } = useMessages();
  const { getListingById } = useListings();
  
  const scrollY = useSharedValue(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
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
  
  const blurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [200, 300],
      [0, 1],
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
            colors={['rgba(15, 23, 42, 0.6)', 'transparent', 'rgba(15, 23, 42, 0.8)']}
            style={styles.imageOverlay}
          />
          
          <BlurView intensity={80} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </BlurView>
        </Animated.View>
        
        {/* Floating Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <BlurView intensity={80} style={styles.headerButtonBlur}>
              <ChevronLeft size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleShare}
            >
              <BlurView intensity={80} style={styles.headerButtonBlur}>
                <Share size={20} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleFavorite}
            >
              <BlurView intensity={80} style={styles.headerButtonBlur}>
                <Heart 
                  size={20} 
                  color="#fff" 
                  fill={isListingFavorite ? '#fff' : 'transparent'} 
                />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Content Card with Animated Entry */}
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
              
              <BlurView intensity={20} style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {listing.creatorType === 'provider' ? 'Prestataire' : 
                   listing.creatorType === 'business' ? 'Établissement' : 'Client'}
                </Text>
              </BlurView>
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
                    >
                      <BlurView intensity={20} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </BlurView>
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
              <BlurView intensity={10} style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Prix</Text>
                <Text style={styles.price}>{formattedPrice}</Text>
              </BlurView>
            </Animated.View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
      
      {/* Floating Action Buttons */}
      {!isOwnListing && (
        <Animated.View 
          entering={SlideInDown.delay(1000)}
          style={styles.actionContainer}
        >
          <BlurView intensity={80} style={styles.actionBlur}>
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
          </BlurView>
        </Animated.View>
      )}
      
      {/* Edit Button for Own Listings */}
      {isOwnListing && (
        <Animated.View 
          entering={SlideInDown.delay(1000)}
          style={styles.actionContainer}
        >
          <BlurView intensity={80} style={styles.actionBlur}>
            <Button
              title="Modifier l'annonce"
              onPress={() => router.push(`/edit-listing/${listing.id}`)}
              fullWidth
            />
          </BlurView>
        </Animated.View>
      )}
      
      {/* Animated Blur Overlay for Header */}
      <Animated.View style={[styles.headerBlurOverlay, blurStyle]} pointerEvents="none">
        <BlurView intensity={80} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    height: 350, // FIXED: Reduced from 400 to 350
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
    fontSize: 24,
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
    bottom: 20, // FIXED: Reduced from 30 to 20
    left: 20,
    paddingHorizontal: 16, // FIXED: Reduced from 20 to 16
    paddingVertical: 8, // FIXED: Reduced from 10 to 8
    borderRadius: 20, // FIXED: Reduced from 25 to 20
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14, // FIXED: Reduced from 16 to 14
    fontWeight: '700',
  },
  headerControls: {
    position: 'absolute',
    top: 45, // FIXED: Reduced from 50 to 45
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44, // FIXED: Reduced from 48 to 44
    height: 44, // FIXED: Reduced from 48 to 44
    borderRadius: 22, // FIXED: Reduced from 24 to 22
    overflow: 'hidden',
  },
  headerButtonBlur: {
    width: 44, // FIXED: Reduced from 48 to 44
    height: 44, // FIXED: Reduced from 48 to 44
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10, // FIXED: Reduced from 12 to 10
  },
  headerBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 5,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, // FIXED: Reduced from 32 to 28
    borderTopRightRadius: 28, // FIXED: Reduced from 32 to 28
    marginTop: -28, // FIXED: Reduced from -32 to -28
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -6 }, // FIXED: Reduced shadow
    shadowOpacity: 0.12, // FIXED: Reduced opacity
    shadowRadius: 20, // FIXED: Reduced radius
    elevation: 12, // FIXED: Reduced elevation
    zIndex: 1,
  },
  detailsContainer: {
    padding: 24, // FIXED: Reduced from 28 to 24
  },
  title: {
    fontSize: 28, // FIXED: Reduced from 32 to 28
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20, // FIXED: Reduced from 24 to 20
    lineHeight: 36, // FIXED: Reduced from 40 to 36
  },
  creatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // FIXED: Reduced from 28 to 24
    padding: 18, // FIXED: Reduced from 20 to 18
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 18, // FIXED: Reduced from 20 to 18
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorImage: {
    width: 52, // FIXED: Reduced from 56 to 52
    height: 52, // FIXED: Reduced from 56 to 52
    borderRadius: 26, // FIXED: Reduced from 28 to 26
    marginRight: 14, // FIXED: Reduced from 16 to 14
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 }, // FIXED: Reduced shadow
    shadowOpacity: 0.25, // FIXED: Reduced opacity
    shadowRadius: 6, // FIXED: Reduced radius
    elevation: 5, // FIXED: Reduced elevation
  },
  creatorImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorImageText: {
    fontSize: 22, // FIXED: Reduced from 24 to 22
    fontWeight: '700',
    color: '#fff',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 17, // FIXED: Reduced from 18 to 17
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 14, // FIXED: Reduced from 16 to 14
    paddingVertical: 7, // FIXED: Reduced from 8 to 7
    borderRadius: 18, // FIXED: Reduced from 20 to 18
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  typeText: {
    fontSize: 12, // FIXED: Reduced from 13 to 12
    fontWeight: '700',
    color: Colors.primary,
  },
  infoContainer: {
    marginBottom: 24, // FIXED: Reduced from 28 to 24
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14, // FIXED: Reduced from 16 to 14
  },
  infoIcon: {
    marginRight: 10, // FIXED: Reduced from 12 to 10
  },
  infoText: {
    fontSize: 15, // FIXED: Reduced from 16 to 15
    color: Colors.text,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // FIXED: Reduced from 10 to 8
    marginTop: 10, // FIXED: Reduced from 12 to 10
  },
  tag: {
    paddingHorizontal: 14, // FIXED: Reduced from 16 to 14
    paddingVertical: 7, // FIXED: Reduced from 8 to 7
    borderRadius: 18, // FIXED: Reduced from 20 to 18
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  tagText: {
    fontSize: 12, // FIXED: Reduced from 13 to 12
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24, // FIXED: Reduced from 28 to 24
  },
  sectionTitle: {
    fontSize: 22, // FIXED: Reduced from 24 to 22
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14, // FIXED: Reduced from 16 to 14
  },
  description: {
    fontSize: 16, // FIXED: Reduced from 17 to 16
    color: Colors.text,
    lineHeight: 26, // FIXED: Reduced from 28 to 26
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20, // FIXED: Reduced from 24 to 20
    borderRadius: 18, // FIXED: Reduced from 20 to 18
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.1)',
  },
  priceLabel: {
    fontSize: 18, // FIXED: Reduced from 20 to 18
    fontWeight: '600',
    color: Colors.text,
  },
  price: {
    fontSize: 28, // FIXED: Reduced from 32 to 28
    fontWeight: '800',
    color: Colors.primary,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  actionBlur: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  contactButton: {
    flex: 1,
    marginRight: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 }, // FIXED: Reduced shadow
    shadowOpacity: 0.25, // FIXED: Reduced opacity
    shadowRadius: 12, // FIXED: Reduced radius
    elevation: 10, // FIXED: Reduced elevation
  },
  quoteButton: {
    flex: 1,
    marginLeft: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 }, // FIXED: Reduced shadow
    shadowOpacity: 0.18, // FIXED: Reduced opacity
    shadowRadius: 12, // FIXED: Reduced radius
    elevation: 8, // FIXED: Reduced elevation
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