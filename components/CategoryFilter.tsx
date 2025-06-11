import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { listingCategories } from '@/constants/categories';
import Colors from '@/constants/colors';

interface CategoryFilterProps {
  onCategorySelect?: (category: string | null) => void;
  selectedCategory?: string | null;
}

export default function CategoryFilter({ onCategorySelect, selectedCategory }: CategoryFilterProps) {
  
  const handleCategoryPress = (category: any) => {
    const categoryId = category.id === 'all' ? null : category.name;
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
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
            selectedCategory === category.name && styles.selectedCategory,
          ]}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.name && styles.selectedCategoryText,
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
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
});