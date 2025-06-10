import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/hooks/useFavorites';
import { Listing } from '@/types';
import Colors from '@/constants/colors';
import RatingStars from './RatingStars';
import { MapPin, Heart, MessageCircle, Calendar, FileText } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface ListingCardProps {
  listing: Listing;
  onPress?: () => void;
}

export default function ListingCard({ listing, onPress }: ListingCardProps) {
  const router = useRouter();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  
  const isListingFavorite = isFavorite(listing.id);
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/listing/${listing.id}`);
    }
  };
  
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (isListingFavorite) {
      removeFromFavorites(listing.id);
    } else {
      addToFavorites(listing.id);
    }
  };
  
  const handleContactPress = (e: any) => {
    e.stopPropagation();
    router.push(`/conversation/new?recipientId=${listing.createdBy}&listingId=${listing.id}`);
  };
  
  const handleQuotePress = (e: any) => {
    e.stopPropagation();
    router.push(`/create-quote/${listing.id}`);
  };
  
  const formatPrice = (price?: number, priceType?: string) => {
    if (!price) return 'Prix sur demande';
    
    const formattedPrice = `${price}€`;
    switch (priceType) {
      case 'hourly': return `${formattedPrice}/h`;
      case 'daily': return `${formattedPrice}/jour`;
      case 'negotiable': return `À partir de ${formattedPrice}`;
      default: return formattedPrice;
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };
  
  // Get image with fallback
  const getImageSource = () => {
    if (listing.images && listing.images.length > 0 && listing.images[0]) {
      return { uri: listing.images[0] };
    }
    // Fallback image based on category
    const fallbackImages = {
      'Services DJ': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop',
      'Traiteur': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop',
      'Services de Personnel': 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=800&auto=format&fit=crop',
      'Location de Lieu': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
      'Lieu de Mariage': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
    };
    return { uri: fallbackImages[listing.category as keyof typeof fallbackImages] || fallbackImages['Location de Lieu'] };
  };
  
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image 
            source={getImageSource()}
            style={styles.image}
            contentFit="cover"
          />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Heart 
              size={20} 
              color={isListingFavorite ? Colors.error : '#fff'} 
              fill={isListingFavorite ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
            <Text style={styles.price}>{formatPrice(listing.price, listing.priceType)}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {listing.description}
          </Text>
          
          <View style={styles.details}>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={Colors.textLight} />
              <Text style={styles.locationText}>{listing.location.city}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <Calendar size={14} color={Colors.textLight} />
              <Text style={styles.dateText}>{formatDate(listing.createdAt)}</Text>
            </View>
          </View>
          
          {(listing.creatorRating || listing.creatorReviewCount) && (
            <View style={styles.ratingContainer}>
              <RatingStars 
                rating={listing.creatorRating || 0} 
                reviewCount={listing.creatorReviewCount} 
                size="small"
              />
            </View>
          )}
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactPress}
            >
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.contactButtonText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quoteButton}
              onPress={handleQuotePress}
            >
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.quoteButtonText}>Devis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quoteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  quoteButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});