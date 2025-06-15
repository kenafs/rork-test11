import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Calendar, Users, MessageCircle, Star, ArrowRight, Sparkles, Heart, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to tabs if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  // Show loading or redirect if authenticated
  if (isLoading || isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: "Organisez vos événements",
      description: "Trouvez facilement des prestataires et des lieux pour tous vos événements"
    },
    {
      icon: Users,
      title: "Réseau de professionnels",
      description: "Accédez à un large réseau de prestataires vérifiés et d'établissements de qualité"
    },
    {
      icon: MessageCircle,
      title: "Communication simplifiée",
      description: "Échangez directement avec les prestataires et recevez des devis personnalisés"
    },
    {
      icon: Star,
      title: "Avis authentiques",
      description: "Consultez les avis clients pour faire le meilleur choix pour votre événement"
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Sparkles size={40} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>EventApp</Text>
          <Text style={styles.heroSubtitle}>
            La plateforme qui connecte organisateurs d'événements et prestataires
          </Text>
          <Text style={styles.heroDescription}>
            Organisez des événements mémorables en trouvant facilement les meilleurs prestataires et lieux près de chez vous
          </Text>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Pourquoi choisir EventApp ?</Text>
        
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <feature.icon size={24} color={Colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Rejoignez notre communauté</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Heart size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Prestataires</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={24} color="#FFD93D" />
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Événements</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color="#6BCF7F" />
            <Text style={styles.statNumber}>4.8/5</Text>
            <Text style={styles.statLabel}>Satisfaction</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
        <Text style={styles.ctaDescription}>
          Créez votre compte et découvrez tous les prestataires près de chez vous
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Créer un compte"
            onPress={() => router.push('/(auth)/register')}
            style={styles.primaryButton}
          />
          
          <Button
            title="Se connecter"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            style={styles.secondaryButton}
          />
        </View>

        <TouchableOpacity 
          style={styles.demoButton}
          onPress={() => router.push('/(auth)/demo')}
        >
          <Text style={styles.demoButtonText}>Essayer avec un compte démo</Text>
          <ArrowRight size={16} color={Colors.primary} />
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
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  heroSection: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width - 40,
  },
  heroIcon: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
    color: Colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  statsSection: {
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  ctaSection: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  demoButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});