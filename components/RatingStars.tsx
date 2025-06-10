import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  showNumber?: boolean;
}

export default function RatingStars({ 
  rating, 
  reviewCount, 
  size = 'medium',
  showCount = true,
  showNumber = false,
}: RatingStarsProps) {
  // Determine star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 20;
      default: return 16;
    }
  };
  
  // Determine text size based on the size prop
  const getTextSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 16;
      default: return 14;
    }
  };
  
  const starSize = getStarSize();
  const textSize = getTextSize();
  
  // Create an array of 5 stars
  const stars = Array(5).fill(0);
  
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {stars.map((_, index) => {
          // Determine if the star should be filled, half-filled, or empty
          const filled = index < Math.floor(rating);
          const halfFilled = index === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <Star
              key={index}
              size={starSize}
              color={Colors.accent}
              fill={filled || halfFilled ? Colors.accent : 'transparent'}
              strokeWidth={1.5}
              style={styles.star}
            />
          );
        })}
      </View>
      
      {showNumber && (
        <Text style={[styles.ratingNumber, { fontSize: textSize }]}>
          {rating.toFixed(1)}
        </Text>
      )}
      
      {showCount && reviewCount !== undefined && (
        <Text style={[styles.reviewCount, { fontSize: textSize }]}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  ratingNumber: {
    color: Colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewCount: {
    color: Colors.textLight,
    marginLeft: 4,
  },
});