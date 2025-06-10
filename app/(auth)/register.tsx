import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserType } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { StatusBar } from 'expo-status-bar';
import { User, Building, Briefcase } from 'lucide-react-native';

const accountTypes = [
  {
    type: 'provider' as UserType,
    title: 'Prestataire',
    description: 'Je propose mes services pour des événements',
    icon: Briefcase,
    color: Colors.primary,
  },
  {
    type: 'business' as UserType,
    title: 'Business',
    description: 'Je suis un établissement (restaurant, salle, etc.)',
    icon: Building,
    color: Colors.accent,
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [userType, setUserType] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [specialties, setSpecialties] = useState('');
  
  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Validate name
  const validateName = (name: string) => {
    if (!name) {
      setNameError('Nom requis');
      return false;
    } else if (name.length < 2) {
      setNameError('Le nom doit contenir au moins 2 caractères');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };
  
  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email requis');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Email invalide');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  // Validate password
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Mot de passe requis');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };
  
  // Validate confirm password
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirmation du mot de passe requise');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };
  
  // Handle registration
  const handleRegister = async () => {
    if (!userType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de compte');
      return;
    }
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    try {
      const userData = {
        name,
        email,
        phone: phone || undefined,
        userType,
        description: description || undefined,
        website: website || undefined,
        instagram: instagram || undefined,
        address: address || undefined,
        city: city || undefined,
        specialties: specialties || undefined,
      };
      
      const success = await register(userData, password, userType);
      
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Erreur', "Une erreur s'est produite lors de l'inscription");
      }
    } catch (error) {
      Alert.alert('Erreur', "Une erreur s'est produite lors de l'inscription");
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>
          Créez un compte pour publier des annonces et contacter des prestataires ou établissements
        </Text>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Type de compte</Text>
        <View style={styles.accountTypesContainer}>
          {accountTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.accountTypeCard,
                userType === type.type && { borderColor: type.color, backgroundColor: `${type.color}10` }
              ]}
              onPress={() => setUserType(type.type)}
            >
              <View style={[styles.accountTypeIcon, { backgroundColor: type.color }]}>
                <type.icon size={24} color="#fff" />
              </View>
              <Text style={styles.accountTypeTitle}>{type.title}</Text>
              <Text style={styles.accountTypeDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {userType === 'business' ? 'Nom de l\'établissement *' : 'Nom complet *'}
          </Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder={userType === 'business' ? 'Nom de votre établissement' : 'Votre nom complet'}
            onBlur={() => validateName(name)}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={() => validateEmail(email)}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+33 6 12 34 56 78"
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ville *</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Paris, Lyon, Marseille..."
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Adresse complète"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={
              userType === 'provider' ? 'Décrivez vos services...' :
              userType === 'business' ? 'Décrivez votre établissement...' :
              'Parlez-nous de vous...'
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        {userType === 'provider' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Spécialités</Text>
            <TextInput
              style={styles.input}
              value={specialties}
              onChangeText={setSpecialties}
              placeholder="DJ, Traiteur, Animation..."
            />
          </View>
        )}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Site web</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://votre-site.com"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Instagram</Text>
          <TextInput
            style={styles.input}
            value={instagram}
            onChangeText={setInstagram}
            placeholder="@votre_compte"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mot de passe *</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            value={password}
            onChangeText={setPassword}
            placeholder="Votre mot de passe"
            secureTextEntry
            onBlur={() => validatePassword(password)}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <TextInput
            style={[styles.input, confirmPasswordError ? styles.inputError : null]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez votre mot de passe"
            secureTextEntry
            onBlur={() => validateConfirmPassword(confirmPassword)}
          />
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>
        
        <Button
          title="S'inscrire"
          onPress={handleRegister}
          loading={isLoading}
          fullWidth
          style={styles.registerButton}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  form: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  accountTypesContainer: {
    marginBottom: 24,
  },
  accountTypeCard: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  accountTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  accountTypeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
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
  input: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 4,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 16,
  },
  loginText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});