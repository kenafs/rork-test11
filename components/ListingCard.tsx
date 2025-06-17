import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import Colors from '@/constants/colors';
import RatingStars from './RatingStars';
import { MapPin, Clock, Euro } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  
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
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress} 
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        {listing.images && listing.images.length > 0 ? (
          <Image source={{ uri: listing.images[0] }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.placeholderImage}
          >
            <Text style={styles.placeholderText}>📷</Text>
          </LinearGradient>
        )}
        
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.9)', 'rgba(59, 130, 246, 0.9)']}
          style={styles.categoryBadge}
        >
          <Text style={styles.categoryText}>{listing.category}</Text>
        </LinearGradient>
        
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
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.locationText}>{listing.location.city}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Euro size={14} color={Colors.primary} />
            {formatPrice(listing.price)}
          </View>
        </View>
        
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
                <View key={`tag-${listing.id}-${tag}-${index}`} style={styles.tag}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  },
  creatorName: {
    fontSize: 15,
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
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 6,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 6,
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
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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