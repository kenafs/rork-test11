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
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
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
      [0.97, 1],
      [0.15, 0.25],
      Extrapolate.CLAMP
    );
    
    const shadowRadius = interpolate(
      scale.value,
      [0.97, 1],
      [12, 20],
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
              <MapPin size={14} color={Colors.textLight} />
              <Text style={styles.locationText}>{listing.location.city}</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Euro size={14} color={Colors.primary} />
              {formatPrice(listing.price)}
            </View>
          </View>
          
          {/* FIXED: Better aligned meta info */}
          <View style={styles.metaInfo}>
            <View style={styles.dateContainer}>
              <Clock size={12} color={Colors.textLight} />
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
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 240,
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
    fontSize: 48,
    opacity: 0.7,
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 22,
    marginBottom: 20,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4, // FIXED: Add padding for better alignment
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  creatorDetails: {
    flex: 1,
    justifyContent: 'center', // FIXED: Center content vertically
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 2, // FIXED: Add padding for better alignment
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 6,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2, // FIXED: Add padding for better alignment
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});