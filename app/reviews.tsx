import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import RatingStars from '@/components/RatingStars';
import { mockReviews } from '@/mocks/reviews';
import { Star, User, Calendar, ThumbsUp } from 'lucide-react-native';

export default function ReviewsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'Tous', count: mockReviews.length },
    { id: '5', label: '5 étoiles', count: mockReviews.filter(r => r.rating === 5).length },
    { id: '4', label: '4 étoiles', count: mockReviews.filter(r => r.rating === 4).length },
    { id: '3', label: '3 étoiles', count: mockReviews.filter(r => r.rating === 3).length },
  ];
  
  const filteredReviews = selectedFilter === 'all' 
    ? mockReviews 
    : mockReviews.filter(review => review.rating === parseInt(selectedFilter));
  
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const renderReview = ({ item }: { item: typeof mockReviews[0] }) => (
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
            <View style={styles.reviewMeta}>
              <Calendar size={12} color={Colors.textLight} />
              <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <RatingStars rating={item.rating} size="small" showNumber={false} />
        </View>
      </View>
      
      <Text style={styles.reviewText}>{item.comment}</Text>
      
      {item.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Réponse du prestataire :</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
      
      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <ThumbsUp size={14} color={Colors.textLight} />
          <Text style={styles.helpfulText}>Utile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Avis et notes',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.averageRating}>
            <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
            <RatingStars rating={averageRating} size="medium" showNumber={false} />
            <Text style={styles.totalReviews}>{mockReviews.length} avis</Text>
          </View>
          
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = mockReviews.filter(r => r.rating === rating).length;
              const percentage = (count / mockReviews.length) * 100;
              
              return (
                <View key={rating} style={styles.distributionRow}>
                  <Text style={styles.distributionLabel}>{rating}</Text>
                  <Star size={12} color={Colors.accent} fill={Colors.accent} />
                  <View style={styles.distributionBar}>
                    <View 
                      style={[
                        styles.distributionFill, 
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.distributionCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.activeFilter
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item.id && styles.activeFilterText
              ]}>
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
      
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.reviewsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Star size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Aucun avis trouvé</Text>
            <Text style={styles.emptyText}>
              Aucun avis ne correspond à vos critères de filtrage.
            </Text>
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
    gap: 24,
  },
  averageRating: {
    alignItems: 'center',
    flex: 1,
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  ratingDistribution: {
    flex: 2,
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionLabel: {
    fontSize: 14,
    color: Colors.text,
    width: 12,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  distributionCount: {
    fontSize: 12,
    color: Colors.textLight,
    width: 20,
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  activeFilterText: {
    color: '#fff',
  },
  reviewsList: {
    padding: 20,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  ratingContainer: {
    marginLeft: 12,
  },
  reviewText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  responseContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.backgroundAlt,
  },
  helpfulText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 24,
  },
});