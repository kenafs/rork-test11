import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { mockReviews } from '@/mocks/reviews';
import { Review } from '@/types';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import Button from '@/components/Button';
import { ThumbsUp, MessageCircle, User, Send } from 'lucide-react-native';

export default function ReviewsScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const router = useRouter();
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  
  // Filter reviews based on type and id
  const reviews = mockReviews.filter(review => {
    if (type === 'listing') return review.listingId === id;
    if (type === 'provider') return review.providerId === id;
    if (type === 'venue') return review.venueId === id;
    return false;
  });
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Render review item
  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          {item.reviewerImage ? (
            <Image source={{ uri: item.reviewerImage }} style={styles.reviewerAvatar} />
          ) : (
            <View style={[styles.reviewerAvatar, styles.avatarPlaceholder]}>
              <User size={20} color="#fff" />
            </View>
          )}
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
            <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <RatingStars rating={item.rating} size="small" showNumber={false} />
      </View>
      
      <Text style={styles.reviewComment}>{item.comment}</Text>
      
      {item.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Réponse du prestataire:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
      
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.actionButton}>
          <ThumbsUp size={16} color={Colors.textLight} />
          <Text style={styles.actionText}>Utile ({item.helpful || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={16} color={Colors.textLight} />
          <Text style={styles.actionText}>Répondre</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render rating selector
  const renderRatingSelector = () => (
    <View style={styles.ratingSelector}>
      <Text style={styles.ratingLabel}>Note:</Text>
      <View style={styles.ratingStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setNewRating(star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.starText,
              star <= newRating && styles.selectedStar
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Avis et commentaires',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
            <RatingStars rating={averageRating} size="medium" showNumber={false} />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length}</Text>
            <Text style={styles.statLabel}>avis</Text>
          </View>
        </View>
      </View>
      
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.reviewsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Aucun avis</Text>
            <Text style={styles.emptyText}>
              Soyez le premier à laisser un avis !
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.addReviewContainer}>
            <Text style={styles.addReviewTitle}>Laisser un avis</Text>
            
            {renderRatingSelector()}
            
            <TextInput
              style={styles.reviewInput}
              value={newReview}
              onChangeText={setNewReview}
              placeholder="Partagez votre expérience..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
            
            <Button
              title="Publier l'avis"
              onPress={() => {
                // Handle review submission
                setNewReview('');
                setNewRating(5);
              }}
              disabled={!newReview.trim()}
              style={styles.submitButton}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  responseContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 18,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  addReviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  starText: {
    fontSize: 24,
    opacity: 0.3,
  },
  selectedStar: {
    opacity: 1,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
});