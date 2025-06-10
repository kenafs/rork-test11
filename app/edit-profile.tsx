import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { User, Mail, Phone, MapPin, Globe, Instagram, Camera, Save } from 'lucide-react-native';

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
});