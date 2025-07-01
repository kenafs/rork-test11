import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { PortfolioItem } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { User, Mail, Phone, MapPin, Globe, Instagram, Camera, Save, Plus, Trash2, X, Calendar, Tag, Image as ImageIcon, Video } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    description: user?.description || '',
    website: user?.website || '',
    instagram: user?.instagram || '',
    specialties: user?.specialties || '',
    address: user?.address || '',
    city: user?.city || user?.location?.city || '',
  });
  
  // Portfolio management
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(user?.portfolio || []);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    eventType: '',
    eventDate: new Date(),
    clientName: '',
    tags: '',
    featured: false,
  });
  
  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return;
    }
    
    try {
      const success = await updateProfile({
        ...formData,
        portfolio,
        location: {
          ...user?.location,
          city: formData.city,
        } as any,
      });
      
      if (success) {
        Alert.alert(
          'Succès',
          'Votre profil a été mis à jour avec succès !',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour');
    }
  };
  
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Image picker for portfolio
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de l\'accès à votre galerie pour ajouter des photos');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPortfolioForm(prev => ({
          ...prev,
          mediaUrl: asset.uri,
          mediaType: asset.type === 'video' ? 'video' : 'image'
        }));
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };
  
  // Portfolio management functions
  const openPortfolioModal = (item?: PortfolioItem) => {
    if (item) {
      setEditingPortfolioItem(item);
      setPortfolioForm({
        title: item.title,
        description: item.description,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        eventType: item.eventType,
        eventDate: new Date(item.eventDate),
        clientName: item.clientName || '',
        tags: item.tags?.join(', ') || '',
        featured: item.featured || false,
      });
    } else {
      setEditingPortfolioItem(null);
      setPortfolioForm({
        title: '',
        description: '',
        mediaUrl: '',
        mediaType: 'image',
        eventType: '',
        eventDate: new Date(),
        clientName: '',
        tags: '',
        featured: false,
      });
    }
    setShowPortfolioModal(true);
  };
  
  const savePortfolioItem = () => {
    if (!portfolioForm.title.trim() || !portfolioForm.mediaUrl.trim()) {
      Alert.alert('Erreur', 'Le titre et le média sont obligatoires');
      return;
    }
    
    const portfolioItem: PortfolioItem = {
      id: editingPortfolioItem?.id || `portfolio-${Date.now()}`,
      title: portfolioForm.title,
      description: portfolioForm.description,
      mediaUrl: portfolioForm.mediaUrl,
      mediaType: portfolioForm.mediaType,
      eventType: portfolioForm.eventType,
      eventDate: portfolioForm.eventDate.getTime(),
      clientName: portfolioForm.clientName || undefined,
      tags: portfolioForm.tags ? portfolioForm.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      featured: portfolioForm.featured,
    };
    
    if (editingPortfolioItem) {
      setPortfolio(prev => prev.map(item => item.id === editingPortfolioItem.id ? portfolioItem : item));
    } else {
      setPortfolio(prev => [...prev, portfolioItem]);
    }
    
    setShowPortfolioModal(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const deletePortfolioItem = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer cet élément du portfolio ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setPortfolio(prev => prev.filter(item => item.id !== id));
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          }
        }
      ]
    );
  };
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Modifier le profil' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vous devez être connecté pour modifier votre profil</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: t('editProfile'),
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <Save size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>{user.name.charAt(0)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.changeImageButton}>
              <Camera size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeImageText}>Modifier la photo</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <User size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Mail size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Phone size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Ville"
                value={formData.city}
                onChangeText={(text) => updateField('city', text)}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez-vous en quelques mots..."
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          {user.userType === 'provider' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spécialités</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: DJ, Animation, Sonorisation"
                value={formData.specialties}
                onChangeText={(text) => updateField('specialties', text)}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          )}
          
          {user.userType === 'business' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adresse</Text>
              <TextInput
                style={styles.input}
                placeholder="Adresse complète"
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liens sociaux</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Globe size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Site web"
                value={formData.website}
                onChangeText={(text) => updateField('website', text)}
                keyboardType="url"
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Instagram size={20} color="#E4405F" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="@username"
                value={formData.instagram}
                onChangeText={(text) => updateField('instagram', text)}
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>
          
          {/* Portfolio Section */}
          {(user.userType === 'provider' || user.userType === 'business') && (
            <Animated.View entering={SlideInDown.delay(400)} style={styles.section}>
              <View style={styles.portfolioHeader}>
                <Text style={styles.sectionTitle}>Portfolio</Text>
                <TouchableOpacity 
                  style={styles.addPortfolioButton}
                  onPress={() => openPortfolioModal()}
                >
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {portfolio.length > 0 ? (
                <View style={styles.portfolioGrid}>
                  {portfolio.map((item, index) => (
                    <Animated.View 
                      key={item.id} 
                      entering={FadeIn.delay(500 + index * 100)}
                      style={styles.portfolioItem}
                    >
                      <Image source={{ uri: item.mediaUrl }} style={styles.portfolioImage} />
                      
                      {item.mediaType === 'video' && (
                        <View style={styles.videoIndicator}>
                          <Video size={16} color="#fff" />
                        </View>
                      )}
                      
                      {item.featured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredText}>★</Text>
                        </View>
                      )}
                      
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.portfolioOverlay}
                      >
                        <Text style={styles.portfolioTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.portfolioEventType}>
                          {item.eventType}
                        </Text>
                      </LinearGradient>
                      
                      <View style={styles.portfolioActions}>
                        <TouchableOpacity 
                          style={styles.editPortfolioButton}
                          onPress={() => openPortfolioModal(item)}
                        >
                          <Text style={styles.editPortfolioText}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deletePortfolioButton}
                          onPress={() => deletePortfolioItem(item.id)}
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyPortfolio}>
                  <Text style={styles.emptyPortfolioText}>
                    Aucun élément dans votre portfolio. Ajoutez vos meilleures réalisations !
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Enregistrer les modifications"
            onPress={handleSave}
            loading={isLoading}
            fullWidth
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
      
      {/* Portfolio Modal */}
      <Modal
        visible={showPortfolioModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} style={styles.modalHeader}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.modalHeaderGradient}
            >
              <Text style={styles.modalTitle}>
                {editingPortfolioItem ? 'Modifier' : 'Ajouter'} un élément
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPortfolioModal(false)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              {/* Media Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Photo/Vidéo *</Text>
                <TouchableOpacity style={styles.mediaPickerButton} onPress={pickImage}>
                  {portfolioForm.mediaUrl ? (
                    <View style={styles.selectedMediaContainer}>
                      <Image source={{ uri: portfolioForm.mediaUrl }} style={styles.selectedMedia} />
                      {portfolioForm.mediaType === 'video' && (
                        <View style={styles.videoOverlay}>
                          <Video size={24} color="#fff" />
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.mediaPickerPlaceholder}>
                      <ImageIcon size={32} color={Colors.textLight} />
                      <Text style={styles.mediaPickerText}>Sélectionner une photo/vidéo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Mariage Château de Versailles"
                  value={portfolioForm.title}
                  onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, title: text }))}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Décrivez ce projet..."
                  value={portfolioForm.description}
                  onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Type d'événement</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Mariage, Corporate, Festival"
                  value={portfolioForm.eventType}
                  onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, eventType: text }))}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du client (optionnel)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Marie & Pierre"
                  value={portfolioForm.clientName}
                  onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, clientName: text }))}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tags (séparés par des virgules)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Mariage, Romantique, Château"
                  value={portfolioForm.tags}
                  onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, tags: text }))}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, portfolioForm.featured && styles.checkboxChecked]}
                  onPress={() => setPortfolioForm(prev => ({ ...prev, featured: !prev.featured }))}
                >
                  {portfolioForm.featured && <Text style={styles.checkboxText}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Mettre en avant (featured)</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title={editingPortfolioItem ? 'Modifier' : 'Ajouter'}
              onPress={savePortfolioItem}
              fullWidth
              style={styles.modalSaveButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  content: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 32,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changeImageText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.backgroundAlt,
  },
  inputIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.backgroundAlt,
    minHeight: 100,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPortfolioButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  portfolioItem: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  portfolioTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  portfolioEventType: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  portfolioActions: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  editPortfolioButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editPortfolioText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  deletePortfolioButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 4,
    borderRadius: 8,
  },
  emptyPortfolio: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPortfolioText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  modalCloseButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.backgroundAlt,
  },
  mediaPickerButton: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selectedMediaContainer: {
    position: 'relative',
    height: 200,
  },
  selectedMedia: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  mediaPickerPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
  },
  mediaPickerText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});