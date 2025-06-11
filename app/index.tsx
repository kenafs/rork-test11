import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { demoAccounts } from '@/mocks/users';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star, Users } from 'lucide-react-native';

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, loginWithDemo, isLoading } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleDemoLogin = () => {
    Alert.alert(
      "✨ Essayer avec un compte démo",
      "Choisissez le type de compte que vous souhaitez tester :",
      [
        {
          text: "👤 Client",
          onPress: async () => {
            const clientDemo = demoAccounts.find(acc => acc.userType === 'client');
            if (clientDemo) {
              console.log('Attempting client demo login with:', clientDemo);
              try {
                const success = await loginWithDemo(clientDemo);
                console.log('Client demo login result:', success);
                if (success) {
                  router.replace('/(tabs)');
                } else {
                  Alert.alert("Erreur", "Impossible de se connecter avec le compte démo client.");
                }
              } catch (error) {
                console.error('Demo login error:', error);
                Alert.alert("Erreur", "Une erreur s'est produite lors de la connexion démo.");
              }
            } else {
              Alert.alert("Erreur", "Compte démo client non trouvé.");
            }
          }
        },
        {
          text: "🎯 Prestataire",
          onPress: async () => {
            const providerDemo = demoAccounts.find(acc => acc.userType === 'provider');
            if (providerDemo) {
              console.log('Attempting provider demo login with:', providerDemo);
              try {
                const success = await loginWithDemo(providerDemo);
                console.log('Provider demo login result:', success);
                if (success) {
                  router.replace('/(tabs)');
                } else {
                  Alert.alert("Erreur", "Impossible de se connecter avec le compte démo prestataire.");
                }
              } catch (error) {
                console.error('Demo login error:', error);
                Alert.alert("Erreur", "Une erreur s'est produite lors de la connexion démo.");
              }
            } else {
              Alert.alert("Erreur", "Compte démo prestataire non trouvé.");
            }
          }
        },
        {
          text: "🏢 Établissement",
          onPress: async () => {
            const businessDemo = demoAccounts.find(acc => acc.userType === 'business');
            if (businessDemo) {
              console.log('Attempting business demo login with:', businessDemo);
              try {
                const success = await loginWithDemo(businessDemo);
                console.log('Business demo login result:', success);
                if (success) {
                  router.replace('/(tabs)');
                } else {
                  Alert.alert("Erreur", "Impossible de se connecter avec le compte démo établissement.");
                }
              } catch (error) {
                console.error('Demo login error:', error);
                Alert.alert("Erreur", "Une erreur s'est produite lors de la connexion démo.");
              }
            } else {
              Alert.alert("Erreur", "Compte démo établissement non trouvé.");
            }
          }
        },
        { text: "Annuler", style: "cancel" }
      ]
    );
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Sparkles size={48} color="#fff" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>EventApp</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            La plateforme qui connecte clients, prestataires et établissements pour vos événements
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Users size={24} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.featureText}>Mise en relation simplifiée</Text>
            </View>
            <View style={styles.feature}>
              <Star size={24} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.featureText}>Prestataires vérifiés</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/login')}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/register')}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Sparkles size={20} color="rgba(255, 255, 255, 0.9)" style={{ marginRight: 8 }} />
              <Text style={styles.demoButtonText}>
                {isLoading ? 'Connexion...' : 'Essayer avec un compte démo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 48,
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});