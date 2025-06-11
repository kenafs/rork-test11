import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { listingCategories } from '@/constants/categories';
import Colors from '@/constants/colors';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const router = useRouter();
  
  const handleCategoryPress = (category: any) => {
    const categoryId = category.id === 'all' ? null : category.id;
    onSelectCategory(categoryId);
    
    // Navigate to search with category filter
    router.push({
      pathname: '/(tabs)/search',
      params: { category: category.id }
    });
  };
  
  // Safety check for listingCategories with fallback
  const categories = listingCategories && Array.isArray(listingCategories) && listingCategories.length > 0 
    ? listingCategories 
    : [
        { id: 'all', name: 'Tous' },
        { id: 'dj', name: 'DJ' },
        { id: 'catering', name: 'Traiteur' },
        { id: 'venue', name: 'Lieu' },
        { id: 'photography', name: 'Photo' },
        { id: 'decoration', name: 'Décoration' },
      ];
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategory,
          ]}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  selectedCategoryText: {
    color: '#fff',
  },
});