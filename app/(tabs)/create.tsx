import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Alert, Platform, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useLocation } from '@/hooks/useLocation';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { listingCategories } from '@/constants/categories';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { X, Camera, Plus, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateListingScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { createListing, isLoading } = useListings();
  const { latitude, longitude, city } = useLocation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer une annonce.',
        [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') }
        ]
      );
    }
  }, [isAuthenticated, user]);
  
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Créer une annonce" }} />
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginSubtitle}>
            Vous devez être connecté pour créer une annonce
          </Text>
          <Button
            title="Se connecter"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }
  
  // Handle image picker
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous ne pouvez pas ajouter plus de 5 images.');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };
  
  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Remove tag
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre annonce.');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description pour votre annonce.');
      return;
    }
    
    if (!category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie.');
      return;
    }
    
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une annonce.');
      return;
    }
    
    try {
      console.log('Creating listing with user:', user);
      console.log('User type:', user.userType);
      
      const newListing = await createListing({
        title: title.trim(),
        description: description.trim(),
        createdBy: user.id,
        creatorType: user.userType,
        creatorName: user.name,
        creatorImage: user.profileImage,
        creatorRating: user.rating,
        creatorReviewCount: user.reviewCount,
        location: {
          latitude: latitude || 48.8566,
          longitude: longitude || 2.3522,
          city: city || 'Paris',
        },
        category,
        price: price ? parseFloat(price) : undefined,
        images,
        tags,
      });
      
      console.log('Listing created successfully:', newListing);
      
      Alert.alert(
        'Succès', 
        'Votre annonce a été publiée avec succès.', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setCategory('');
              setPrice('');
              setImages([]);
              setTags([]);
              setTagInput('');
              
              // Navigate to home tab
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Erreur', "Une erreur s'est produite lors de la publication de votre annonce.");
    }
  };

  // Get appropriate title and subtitle based on user type
  const getHeaderText = () => {
    switch (user.userType) {
      case 'provider':
        return {
          title: '✨ Créer une annonce',
          subtitle: 'Proposez vos services !'
        };
      case 'business':
        return {
          title: '✨ Publier une offre',
          subtitle: 'Proposez votre établissement !'
        };
      default:
        return {
          title: '✨ Créer une demande',
          subtitle: 'Publiez votre besoin !'
        };
    }
  };

  // Get appropriate placeholder text based on user type
  const getPlaceholders = () => {
    switch (user.userType) {
      case 'provider':
        return {
          title: "Ex: DJ professionnel pour soirée d'entreprise",
          description: "Décrivez vos services en détail..."
        };
      case 'business':
        return {
          title: "Ex: Salle de réception avec terrasse",
          description: "Décrivez votre établissement et ses équipements..."
        };
      default:
        return {
          title: "Ex: Recherche DJ pour mariage",
          description: "Décrivez votre besoin en détail..."
        };
    }
  };

  const headerText = getHeaderText();
  const placeholders = getPlaceholders();
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: user.userType === 'business' ? "Publier une offre" : "Créer une annonce",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{headerText.title}</Text>
          <Text style={styles.headerSubtitle}>{headerText.subtitle}</Text>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>🎯 Titre {user.userType === 'business' ? "de l'offre" : "de l'annonce"} *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={placeholders.title}
              maxLength={100}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>📝 Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={placeholders.description}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>🏷️ Catégorie *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {listingCategories.filter(c => c.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.name && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.name && styles.selectedCategoryText,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>💰 Prix (€)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
              placeholder="Ex: 250"
              keyboardType="numeric"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.helperText}>
              💡 Laissez vide si le prix est sur demande ou variable.
            </Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>📸 Photos (max 5)</Text>
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary] as const}
                    style={styles.addImageGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Camera size={24} color="#fff" />
                    <Text style={styles.addImageText}>Ajouter</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>🏷️ Tags (max 5)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Ex: Mariage, Soirée, etc."
                onSubmitEditing={addTag}
                placeholderTextColor={Colors.textLight}
              />
              <Button
                title="Ajouter"
                onPress={addTag}
                size="small"
                disabled={!tagInput.trim() || tags.length >= 5}
                style={styles.addTagButton}
              />
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <X size={14} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>📍 Localisation</Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationInfo}>
                <Sparkles size={20} color={Colors.primary} />
                <Text style={styles.locationText}>
                  {city ? `${city}` : 'Localisation non disponible'}
                </Text>
              </View>
              <Text style={styles.helperText}>
                💡 Votre {user.userType === 'business' ? 'offre' : 'annonce'} sera visible en priorité aux personnes proches de cette localisation.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary] as const}
          style={styles.submitGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading || !title.trim() || !description.trim() || !category}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? '🚀 Publication...' : `🚀 Publier ${user.userType === 'business' ? "l'offre" : "l'annonce"}`}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '700',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    height: 54,
    paddingHorizontal: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  submitGradient: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  submitButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
});