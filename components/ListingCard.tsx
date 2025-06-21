import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import Colors from '@/constants/colors';
import RatingStars from './RatingStars';
import { MapPin, Clock, Euro } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/listing/${listing.id}`);
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };
  
  const formatPrice = (price?: number) => {
    if (!price) return <Text style={styles.priceText}>Prix sur demande</Text>;
    return <Text style={styles.priceText}>{price}€</Text>;
  };
  
  // CRITICAL FIX: Much better touch handling with proper sensitivity and gesture detection
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    };
  });
  
  const cardShadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scale.value,
      [0.98, 1],
      [0.08, 0.15],
      Extrapolate.CLAMP
    );
    
    const shadowRadius = interpolate(
      scale.value,
      [0.98, 1],
      [8, 12],
      Extrapolate.CLAMP
    );
    
    return {
      shadowOpacity,
      shadowRadius,
      elevation: shadowRadius / 2,
    };
  });
  
  return (
    <Animated.View style={[styles.container, animatedStyle, cardShadowStyle]}>
      <TouchableOpacity 
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        delayPressIn={0} // CRITICAL FIX: No delay for immediate response
        delayPressOut={100} // CRITICAL FIX: Short delay for smooth animation
        delayLongPress={500} // CRITICAL FIX: Longer delay to prevent accidental long press
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }} // CRITICAL FIX: Smaller hit area for better precision
      >
        <View style={styles.imageContainer}>
          {listing.images && listing.images.length > 0 ? (
            <Image 
              source={{ uri: listing.images[0] }} 
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.placeholderImage}
            >
              <Text style={styles.placeholderText}>📷</Text>
            </LinearGradient>
          )}
          
          <BlurView intensity={80} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </BlurView>
          
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
            style={styles.imageOverlay}
          />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          
          <Text style={styles.description} numberOfLines={2}>
            {listing.description}
          </Text>
          
          {/* FIXED: Better centered creator info */}
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              {listing.creatorImage ? (
                <Image source={{ uri: listing.creatorImage }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {listing.creatorName?.charAt(0) || '?'}
                  </Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.creatorDetails}>
              <Text style={styles.creatorName}>{listing.creatorName}</Text>
              {listing.creatorRating !== undefined && listing.creatorRating > 0 && (
                <RatingStars 
                  rating={listing.creatorRating} 
                  size="small" 
                  showNumber={false}
                />
              )}
            </View>
          </View>
          
          {/* FIXED: Better aligned footer */}
          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <MapPin size={12} color={Colors.textLight} />
              <Text style={styles.locationText}>{listing.location.city}</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Euro size={12} color={Colors.primary} />
              {formatPrice(listing.price)}
            </View>
          </View>
          
          {/* FIXED: Better aligned meta info */}
          <View style={styles.metaInfo}>
            <View style={styles.dateContainer}>
              <Clock size={10} color={Colors.textLight} />
              <Text style={styles.dateText}>
                Publié le {formatDate(listing.createdAt)}
              </Text>
            </View>
            
            {listing.tags && listing.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {listing.tags.slice(0, 2).map((tag, index) => (
                  <BlurView 
                    key={`tag-${listing.id}-${tag}-${index}`} 
                    intensity={20} 
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </BlurView>
                ))}
                {listing.tags.length > 2 && (
                  <Text style={styles.moreTagsText}>+{listing.tags.length - 2}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 18, // FIXED: Reduced from 20 to 18
    marginBottom: 14, // FIXED: Reduced from 16 to 14
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 }, // FIXED: Reduced shadow
    shadowOpacity: 0.15, // FIXED: Reduced opacity
    shadowRadius: 12, // FIXED: Reduced radius
    elevation: 8, // FIXED: Reduced elevation
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 180, // FIXED: Reduced from 200 to 180
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36, // FIXED: Reduced from 40 to 36
    opacity: 0.7,
  },
  categoryBadge: {
    position: 'absolute',
    top: 14, // FIXED: Reduced from 16 to 14
    left: 14, // FIXED: Reduced from 16 to 14
    paddingHorizontal: 10, // FIXED: Reduced from 12 to 10
    paddingVertical: 5, // FIXED: Reduced from 6 to 5
    borderRadius: 14, // FIXED: Reduced from 16 to 14
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 10, // FIXED: Reduced from 11 to 10
    fontWeight: '700',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50, // FIXED: Reduced from 60 to 50
  },
  content: {
    padding: 18, // FIXED: Reduced from 20 to 18
  },
  title: {
    fontSize: 18, // FIXED: Reduced from 20 to 18
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 5, // FIXED: Reduced from 6 to 5
    lineHeight: 24, // FIXED: Reduced from 26 to 24
  },
  description: {
    fontSize: 13, // FIXED: Reduced from 14 to 13
    color: Colors.textLight,
    lineHeight: 18, // FIXED: Reduced from 20 to 18
    marginBottom: 14, // FIXED: Reduced from 16 to 14
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14, // FIXED: Reduced from 16 to 14
    paddingVertical: 1, // FIXED: Reduced padding for better alignment
  },
  creatorAvatar: {
    width: 32, // FIXED: Reduced from 36 to 32
    height: 32, // FIXED: Reduced from 36 to 32
    borderRadius: 16, // FIXED: Reduced from 18 to 16
    marginRight: 8, // FIXED: Reduced from 10 to 8
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 }, // FIXED: Reduced shadow
    shadowOpacity: 0.12, // FIXED: Reduced opacity
    shadowRadius: 4, // FIXED: Reduced radius
    elevation: 2, // FIXED: Reduced elevation
  },
  avatarImage: {
    width: 32, // FIXED: Reduced from 36 to 32
    height: 32, // FIXED: Reduced from 36 to 32
    borderRadius: 16, // FIXED: Reduced from 18 to 16
  },
  avatarGradient: {
    width: 32, // FIXED: Reduced from 36 to 32
    height: 32, // FIXED: Reduced from 36 to 32
    borderRadius: 16, // FIXED: Reduced from 18 to 16
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 13, // FIXED: Reduced from 14 to 13
    fontWeight: '700',
  },
  creatorDetails: {
    flex: 1,
    justifyContent: 'center', // FIXED: Center content vertically
  },
  creatorName: {
    fontSize: 14, // FIXED: Reduced from 15 to 14
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // FIXED: Reduced from 12 to 10
    paddingVertical: 1, // FIXED: Add padding for better alignment
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12, // FIXED: Reduced from 13 to 12
    color: Colors.textLight,
    marginLeft: 3, // FIXED: Reduced from 4 to 3
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16, // FIXED: Reduced from 18 to 16
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 3, // FIXED: Reduced from 4 to 3
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1, // FIXED: Add padding for better alignment
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10, // FIXED: Reduced from 11 to 10
    color: Colors.textMuted,
    marginLeft: 3, // FIXED: Reduced from 4 to 3
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5, // FIXED: Reduced from 6 to 5
  },
  tag: {
    paddingHorizontal: 7, // FIXED: Reduced from 8 to 7
    paddingVertical: 2, // FIXED: Reduced from 3 to 2
    borderRadius: 8, // FIXED: Reduced from 10 to 8
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  tagText: {
    fontSize: 9, // FIXED: Reduced from 10 to 9
    color: Colors.primary,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 9, // FIXED: Reduced from 10 to 9
    color: Colors.textMuted,
    fontWeight: '600',
  },
});