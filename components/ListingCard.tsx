import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import Colors from '@/constants/colors';
import RatingStars from './RatingStars';
import { MapPin, Clock, Euro } from 'lucide-react-native';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
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
    if (!price) return 'Prix sur demande';
    return `${price}€`;
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {listing.images && listing.images.length > 0 ? (
          <Image source={{ uri: listing.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{listing.category}</Text>
        </View>
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
              <Text style={styles.avatarText}>
                {listing.creatorName?.charAt(0) || '?'}
              </Text>
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
            <Text style={styles.priceText}>{formatPrice(listing.price)}</Text>
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tag: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500',
  },
});