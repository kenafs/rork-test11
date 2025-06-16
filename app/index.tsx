import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  ArrowRight, 
  Sparkles,
  Heart,
  MessageCircle,
  TrendingUp
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Users,
      title: "Prestataires vérifiés",
      description: "Trouvez des professionnels qualifiés pour tous vos événements",
      color: "#4CAF50"
    },
    {
      icon: Calendar,
      title: "Réservation simple",
      description: "Planifiez et réservez vos prestations en quelques clics",
      color: "#2196F3"
    },
    {
      icon: Star,
      title: "Avis authentiques",
      description: "Consultez les retours d'expérience d'autres clients",
      color: "#FFD700"
    },
    {
      icon: MessageCircle,
      title: "Communication directe",
      description: "Échangez directement avec vos prestataires",
      color: "#9C27B0"
    }
  ];

  const stats = [
    { number: "500+", label: "Prestataires", icon: Users },
    { number: "1000+", label: "Événements", icon: Calendar },
    { number: "4.8/5", label: "Satisfaction", icon: Star },
    { number: "50+", label: "Villes", icon: MapPin }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary] as const}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <Sparkles size={40} color="#fff" />
              <Text style={styles.logoText}>EventApp</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Organisez vos événements{'\n'}avec les meilleurs prestataires
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Découvrez, comparez et réservez les services parfaits pour rendre vos événements inoubliables
            </Text>
            
            <View style={styles.heroButtons}>
              <Button
                title="🚀 Commencer"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
              />
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.secondaryButtonText}>Se connecter</Text>
                <ArrowRight size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>EventApp en chiffres</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={`stat-${index}`} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${Colors.primary}20` }]}>
                  <stat.icon size={24} color={Colors.primary} />
                </View>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pourquoi choisir EventApp ?</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={`feature-${index}`} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <feature.icon size={28} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Créez votre compte</Text>
              <Text style={styles.stepDescription}>
                Inscrivez-vous gratuitement en tant que client, prestataire ou établissement
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Trouvez vos prestataires</Text>
              <Text style={styles.stepDescription}>
                Parcourez les annonces ou publiez votre besoin pour recevoir des propositions
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Organisez votre événement</Text>
              <Text style={styles.stepDescription}>
                Échangez, négociez et finalisez les détails pour un événement réussi
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[Colors.secondary, Colors.primary] as const}
          style={styles.ctaSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaSubtitle}>
            Rejoignez des milliers d'utilisateurs qui font confiance à EventApp
          </Text>
          
          <View style={styles.ctaButtons}>
            <Button
              title="🎯 Essayer gratuitement"
              onPress={() => router.push('/(auth)/demo')}
              style={styles.ctaButton}
              textStyle={styles.ctaButtonText}
            />
            
            <TouchableOpacity 
              style={styles.ctaSecondaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.ctaSecondaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  heroButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    padding: 40,
    backgroundColor: Colors.backgroundAlt,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 80 - 16) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 40,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  howItWorksSection: {
    padding: 40,
    backgroundColor: Colors.backgroundAlt,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  ctaSection: {
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  ctaButtons: {
    width: '100%',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  ctaSecondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaSecondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});