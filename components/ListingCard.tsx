import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import Colors from '@/constants/colors';
import RatingStars from './RatingStars';
import { MapPin, Clock, Euro } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const { width } = Dimensions.get('window');

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
        delayPressIn={0}
        delayPressOut={100}
        delayLongPress={500}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
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
                  <View 
                    key={`tag-${listing.id}-${tag}-${index}`} 
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
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
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    alignSelf: 'center',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
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
    fontSize: 32,
    opacity: 0.7,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  creatorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  creatorName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 8,
    color: Colors.primary,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 8,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});