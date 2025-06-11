import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Users, Calendar, Star } from 'lucide-react-native';

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to main app
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleDemo = () => {
    router.push('/(auth)/demo');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Sparkles size={48} color="#fff" />
            </View>
            
            <Text style={styles.title}>EventApp</Text>
            <Text style={styles.subtitle}>
              La plateforme qui connecte clients, prestataires et établissements pour vos événements
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Users size={32} color="#fff" />
              <Text style={styles.featureTitle}>Mise en relation</Text>
              <Text style={styles.featureText}>
                Trouvez facilement des prestataires et établissements près de chez vous
              </Text>
            </View>

            <View style={styles.feature}>
              <Calendar size={32} color="#fff" />
              <Text style={styles.featureTitle}>Gestion simplifiée</Text>
              <Text style={styles.featureText}>
                Organisez vos événements en toute simplicité avec nos outils
              </Text>
            </View>

            <View style={styles.feature}>
              <Star size={32} color="#fff" />
              <Text style={styles.featureTitle}>Qualité garantie</Text>
              <Text style={styles.featureText}>
                Consultez les avis et notes pour choisir les meilleurs prestataires
              </Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Button
              title="Commencer"
              onPress={handleGetStarted}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
            
            <Button
              title="Se connecter"
              variant="outline"
              onPress={handleLogin}
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
            
            <TouchableOpacity style={styles.demoButton} onPress={handleDemo}>
              <Text style={styles.demoButtonText}>✨ Essayer avec un compte démo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaSection: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  demoButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});