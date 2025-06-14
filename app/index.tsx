import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Users, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  const handleTryDemo = () => {
    router.push('/(auth)/demo');
  };

  return (
    <LinearGradient
      colors={[Colors.primary, '#8B5CF6']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Star size={32} color="#fff" fill="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>EventApp</Text>
        <Text style={styles.subtitle}>
          La plateforme qui connecte clients,{'\n'}
          prestataires et établissements pour{'\n'}
          des événements réussis
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Commencer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleTryDemo}>
            <Text style={styles.secondaryButtonText}>Essayer la démo</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Pourquoi choisir EventApp ?</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Users size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Trouvez des prestataires</Text>
                <Text style={styles.featureText}>
                  DJ, photographes, traiteurs... Tous les{'\n'}
                  professionnels pour vos événements
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Découvrez des lieux</Text>
                <Text style={styles.featureText}>
                  Salles, restaurants, espaces uniques{'\n'}
                  pour organiser vos événements
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Star size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Gérez vos projets</Text>
                <Text style={styles.featureText}>
                  Devis, messages, planning...{'\n'}
                  Tout en un seul endroit
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
  },
  buttonContainer: {
    marginBottom: 60,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  featuresContainer: {
    flex: 1,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 32,
  },
  featuresList: {
    flex: 1,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});