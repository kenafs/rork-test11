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
    const categoryId = category.id === 'all' ? null : category.name;
    onSelectCategory(categoryId);
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
    <View style={styles.wrapper}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.backgroundAlt,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '700',
  },
});