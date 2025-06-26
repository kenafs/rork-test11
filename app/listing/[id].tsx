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
import { MapPin, Star, Clock, ChevronLeft, Share, Heart, MessageCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  FadeIn,
  SlideInDown
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
          title="Retour" 
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
  
  // Animated styles for parallax effect
  const imageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 300],
      [0, -100],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      scrollY.value,
      [0, 300],
      [1, 1.1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }, { scale }],
    };
  });
  
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [200, 250],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
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
        'Vous devez être connecté pour contacter ce prestataire.',
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
      const conversationId = await createConversation(creatorUser.id);
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
        const conversationId = await createConversation(
          creatorUser.id,
          `Bonjour, je souhaiterais recevoir un devis pour votre annonce "${listing.title}". Pourriez-vous me faire une proposition ?`,
          listing.id
        );
        
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
      {/* Animated Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 10 }, headerStyle]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Share size={20} color={Colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleFavorite}
          >
            <Heart 
              size={20} 
              color={isListingFavorite ? Colors.primary : Colors.text}
              fill={isListingFavorite ? Colors.primary : 'transparent'} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <AnimatedScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Image with Parallax */}
        <Animated.View style={[styles.imageContainer, imageStyle]}>
          {listing.images && listing.images.length > 0 ? (
            <Image 
              source={{ uri: listing.images[0] }} 
              style={styles.image}
              contentFit="cover"
              onLoad={() => setImageLoaded(true)}
              transition={500}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{listing.category}</Text>
            </View>
          )}
        </Animated.View>
        
        {/* Content */}
        <Animated.View 
          entering={SlideInDown.delay(300)}
          style={styles.contentContainer}
        >
          <View style={styles.content}>
            <Animated.Text 
              entering={FadeIn.delay(400)}
              style={styles.title}
            >
              {listing.title}
            </Animated.Text>
            
            <Animated.View 
              entering={FadeIn.delay(500)}
              style={styles.creatorSection}
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
                  <View style={styles.creatorImagePlaceholder}>
                    <Text style={styles.creatorImageText}>
                      {listing.creatorName.charAt(0)}
                    </Text>
                  </View>
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
            </Animated.View>
            
            <Animated.View 
              entering={FadeIn.delay(600)}
              style={styles.infoSection}
            >
              {listing.location && listing.location.city && (
                <View style={styles.infoItem}>
                  <MapPin size={18} color={Colors.primary} />
                  <Text style={styles.infoText}>{listing.location.city}</Text>
                </View>
              )}
              
              <View style={styles.infoItem}>
                <Clock size={18} color={Colors.primary} />
                <Text style={styles.infoText}>
                  Publié le {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </Animated.View>
            
            <View style={styles.divider} />
            
            <Animated.View entering={FadeIn.delay(700)}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </Animated.View>
            
            {listing.tags && listing.tags.length > 0 && (
              <Animated.View entering={FadeIn.delay(800)}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {listing.tags.map((tag, index) => (
                    <View key={`tag-${index}`} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
            
            <View style={styles.divider} />
            
            <Animated.View entering={SlideInDown.delay(900)}>
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Prix</Text>
                <Text style={styles.price}>{formattedPrice}</Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
      
      {/* Action Buttons */}
      {!isOwnListing && (
        <Animated.View 
          entering={SlideInDown.delay(1000)}
          style={[styles.actionContainer, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.actionButtons}>
            <Button
              title="Contacter"
              onPress={handleContact}
              style={styles.contactButton}
            />
            
            {(user?.userType === 'provider' || user?.userType === 'business' || 
              (listing.creatorType === 'provider' && user?.userType === 'client') ||
              (listing.creatorType === 'business' && user?.userType === 'client')) && (
              <Button
                title={user?.userType === 'provider' || user?.userType === 'business' ? "Créer devis" : "Demander devis"}
                variant="outline"
                onPress={handleQuoteRequest}
                style={styles.quoteButton}
              />
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 18,
  },
  contentContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  creatorSection: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
  },
  priceLabel: {
    fontSize: 18,
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
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 24,
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
    padding: 24,
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