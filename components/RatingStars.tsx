import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
}

export default function RatingStars({ 
  rating, 
  reviewCount, 
  size = 'medium',
  showNumber = true
}: RatingStarsProps) {
  const starSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;
  const fontSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-star-${i}`}
          size={starSize}
          color="#FFD700"
          fill="#FFD700"
        />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half-star"
          size={starSize}
          color="#FFD700"
          fill="#FFD700"
          style={{ opacity: 0.5 }}
        />
      );
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-star-${i}`}
          size={starSize}
          color="#E5E7EB"
          fill="transparent"
        />
      );
    }
    
    return stars;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showNumber && (
        <Text style={[styles.ratingText, { fontSize }]}>
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <Text style={[styles.reviewCount, { fontSize: fontSize - 2 }]}>
              {' '}({reviewCount})
            </Text>
          )}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    color: Colors.textLight,
    fontWeight: '400',
  },
});