import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  
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
  
  // Handle login
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      return;
    }
    
    if (!password) {
      Alert.alert('Erreur', 'Veuillez saisir votre mot de passe');
      return;
    }
    
    try {
      const success = await login(email, password);
      
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Erreur de connexion', 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', "Une erreur s'est produite lors de la connexion");
    }
  };
  
  // Demo login (for testing)
  const handleDemoLogin = async () => {
    try {
      // Use a mock provider account
      const success = await login('dj.alex@example.com', 'password');
      
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Erreur', "Impossible de se connecter au compte de démonstration");
      }
    } catch (error) {
      Alert.alert('Erreur', "Une erreur s'est produite lors de la connexion");
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
          <View style={styles.logoContainer}>
            <Sparkles size={32} color="#fff" />
            <Text style={styles.logoText}>EventApp</Text>
          </View>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour accéder à votre compte
          </Text>
        </Animated.View>
        
        {/* Form Card */}
        <Animated.View entering={SlideInDown.delay(400)} style={styles.formCard}>
          <View style={styles.form}>
            <Animated.View entering={FadeIn.delay(600)} style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => validateEmail(email)}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </Animated.View>
            
            <Animated.View entering={FadeIn.delay(700)} style={styles.formGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Votre mot de passe"
                  secureTextEntry
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeIn.delay(800)}>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View entering={SlideInDown.delay(900)} style={styles.buttonContainer}>
              <Button
                title="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
                size="large"
              />
              
              <View style={styles.orContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OU</Text>
                <View style={styles.divider} />
              </View>
              
              <Button
                title="Compte de démonstration"
                variant="outline"
                onPress={handleDemoLogin}
                fullWidth
                style={styles.demoButton}
                size="large"
              />
            </Animated.View>
          </View>
        </Animated.View>
        
        {/* Footer */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.footer}>
          <Text style={styles.footerText}>Vous n'avez pas de compte ?</Text>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerText}>S'inscrire</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
    marginTop: 8,
  },
  loginButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    color: Colors.textLight,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  demoButton: {
    borderColor: Colors.border,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  registerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});