import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Search, Users, MessageCircle, Star, ArrowRight, Sparkles } from 'lucide-react-native';

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // Redirect authenticated users to tabs
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user]);
  
  // Don't render landing page if user is authenticated
  if (isAuthenticated && user) {
    return null;
  }
  
  const features = [
    {
      icon: Search,
      title: 'Trouvez facilement',
      description: 'Découvrez des prestataires et lieux pour tous vos événements',
      color: '#6366F1',
    },
    {
      icon: MessageCircle,
      title: 'Communiquez simplement',
      description: 'Échangez directement avec les professionnels via notre messagerie',
      color: '#10B981',
    },
    {
      icon: Star,
      title: 'Choisissez en confiance',
      description: 'Consultez les avis et notes laissés par la communauté',
      color: '#F59E0B',
    },
    {
      icon: Users,
      title: 'Développez votre activité',
      description: 'Prestataires, créez votre profil et trouvez de nouveaux clients',
      color: '#EF4444',
    },
  ];
  
  const handleGetStarted = () => {
    router.push('/(auth)/demo');
  };
  
  const handleLogin = () => {
    router.push('/(auth)/login');
  };
  
  const handleRegister = () => {
    router.push('/(auth)/register');
  };
  
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
          <View style={styles.logoContainer}>
            <Sparkles size={40} color="#fff" />
            <Text style={styles.logoText}>EventApp</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            Organisez vos événements{'\n'}en toute simplicité
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Trouvez les meilleurs prestataires et lieux pour vos mariages, anniversaires, 
            événements d'entreprise et bien plus encore.
          </Text>
          
          <View style={styles.heroButtons}>
            <Button
              title="🚀 Découvrir"
              onPress={handleGetStarted}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
            <Button
              title="Se connecter"
              onPress={handleLogin}
              variant="outline"
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          </View>
        </View>
        
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop' }}
            style={styles.heroImage}
          />
        </View>
      </LinearGradient>
      
      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Pourquoi choisir EventApp ?</Text>
        <Text style={styles.sectionSubtitle}>
          Une plateforme complète pour tous vos besoins événementiels
        </Text>
        
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={`feature-${index}`} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                <feature.icon size={24} color={feature.color} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Stats Section */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={['#F8FAFC', '#E2E8F0'] as const}
          style={styles.statsContainer}
        >
          <Text style={styles.statsTitle}>Rejoignez notre communauté</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Prestataires</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Événements</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
        <Text style={styles.ctaSubtitle}>
          Créez votre compte gratuitement et découvrez toutes nos fonctionnalités
        </Text>
        
        <View style={styles.ctaButtons}>
          <Button
            title="Créer un compte"
            onPress={handleRegister}
            style={styles.ctaPrimaryButton}
          />
          <TouchableOpacity style={styles.ctaSecondaryButton} onPress={handleGetStarted}>
            <Text style={styles.ctaSecondaryText}>Essayer avec un compte démo</Text>
            <ArrowRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  primaryButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  heroImageContainer: {
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  featuresSection: {
    padding: 40,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    padding: 20,
  },
  statsContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  ctaSection: {
    padding: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButtons: {
    width: '100%',
    gap: 16,
  },
  ctaPrimaryButton: {
    backgroundColor: Colors.primary,
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundAlt,
    gap: 8,
  },
  ctaSecondaryText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});