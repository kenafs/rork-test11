import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { categories } from '@/constants/categories';
import { MapPin, DollarSign, Tag, FileText, Sparkles } from 'lucide-react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function CreateListingScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { createListing } = useListings();
  const { latitude, longitude, city, requestPermission } = useLocation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInTitle}>Connexion requise</Text>
          <Text style={styles.notLoggedInText}>
            Vous devez être connecté pour créer une annonce
          </Text>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre annonce');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    if (!latitude || !longitude || !city) {
      Alert.alert(
        'Localisation requise',
        'Nous avons besoin de votre localisation pour publier votre annonce',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Autoriser', onPress: requestPermission }
        ]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const newListing = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        price: price ? parseFloat(price) : undefined,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        location: {
          latitude,
          longitude,
          city,
        },
        createdBy: user.id,
        creatorType: user.userType,
        creatorName: user.name,
        creatorImage: user.profileImage,
        creatorRating: user.rating,
        creatorReviewCount: user.reviewCount,
      };

      console.log('Creating listing:', newListing);
      
      const createdListing = await createListing(newListing);
      
      console.log('Listing created successfully:', createdListing);

      Alert.alert(
        'Succès',
        'Votre annonce a été publiée avec succès !',
        [
          {
            text: 'Voir l\'annonce',
            onPress: () => {
              router.replace(`/listing/${createdListing.id}`);
            }
          }
        ]
      );

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setPrice('');
      setTags('');

    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Erreur', 'Impossible de publier votre annonce. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (category: { id: string; name: string; icon: string }) => {
    setSelectedCategory(category.name);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Sparkles size={24} color="#fff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Créer une annonce</Text>
            <Text style={styles.headerSubtitle}>Proposez vos services !</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Titre de l'annonce *</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: DJ professionnel pour soirée d'entreprise"
              placeholderTextColor={Colors.textLight}
              maxLength={100}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Tag size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Catégorie *</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.name && styles.categoryChipSelected
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.name && styles.categoryChipTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <DollarSign size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Prix (€)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={price}
              onChangeText={setPrice}
              placeholder="200"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Description *</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez vos services en détail..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Tag size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Mots-clés</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={tags}
              onChangeText={setTags}
              placeholder="mariage, anniversaire, entreprise (séparés par des virgules)"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Localisation</Text>
            </View>
            <TouchableOpacity style={styles.locationButton} onPress={requestPermission}>
              <Text style={styles.locationButtonText}>
                {city ? `📍 ${city}` : '📍 Définir ma localisation'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View style={styles.submitContainer}>
          <Button
            title={isSubmitting ? "Publication..." : "🚀 Publier l'annonce"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  locationButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationButtonText: {
    fontSize: 16,
    color: city ? Colors.text : Colors.textLight,
  },
  submitContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  submitButton: {
    paddingVertical: 16,
    minHeight: 56,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  notLoggedInText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
});