import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Users, Calendar, Star, ArrowRight, Heart, MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // CRITICAL FIX: Redirect authenticated users to main app
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user]);
  
  // CRITICAL FIX: Show landing page only for non-authenticated users
  if (isAuthenticated && user) {
    return null; // Will redirect via useEffect
  }
  
  const features = [
    {
      icon: Users,
      title: 'Trouvez des prestataires',
      description: 'Découvrez des professionnels qualifiés pour vos événements',
      color: '#6366F1'
    },
    {
      icon: Calendar,
      title: 'Organisez facilement',
      description: 'Planifiez et gérez tous vos événements en un seul endroit',
      color: '#EC4899'
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis authentiques de la communauté',
      color: '#F59E0B'
    },
    {
      icon: Heart,
      title: 'Favoris personnalisés',
      description: 'Sauvegardez vos prestataires et lieux préférés',
      color: '#EF4444'
    }
  ];
  
  const testimonials = [
    {
      name: 'Marie L.',
      role: 'Organisatrice d\'événements',
      comment: 'EventApp m\'a permis de trouver les meilleurs prestataires pour mon mariage. Tout s\'est parfaitement déroulé !',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Thomas M.',
      role: 'DJ Professionnel',
      comment: 'Grâce à cette plateforme, j\'ai pu développer ma clientèle et recevoir de nombreuses demandes de qualité.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Sophie R.',
      role: 'Propriétaire de salle',
      comment: 'L\'interface est intuitive et les outils de gestion sont parfaits pour mon établissement.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Sparkles size={40} color="#fff" />
            <Text style={styles.logoText}>EventApp</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            Organisez des événements{'\n'}
            <Text style={styles.heroTitleAccent}>inoubliables</Text>
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Connectez-vous avec les meilleurs prestataires et lieux pour créer des moments magiques
          </Text>
          
          <View style={styles.heroButtons}>
            <Button
              title="🚀 Commencer"
              onPress={() => router.push('/(auth)/demo')}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
            <Button
              title="Se connecter"
              onPress={() => router.push('/(auth)/login')}
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Pourquoi choisir EventApp ?</Text>
        <Text style={styles.sectionSubtitle}>
          Découvrez tous les avantages de notre plateforme
        </Text>
        
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
      
      {/* Stats Section */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={['#F8FAFC', '#E2E8F0'] as const}
          style={styles.statsContainer}
        >
          <Text style={styles.statsTitle}>🎯 EventApp en chiffres</Text>
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
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Villes</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      {/* Testimonials Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Ce que disent nos utilisateurs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
          {testimonials.map((testimonial, index) => (
            <View key={`testimonial-${index}`} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <Image source={{ uri: testimonial.image }} style={styles.testimonialImage} />
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
                <View style={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Text key={`star-${index}-${i}`} style={styles.star}>⭐</Text>
                  ))}
                </View>
              </View>
              <Text style={styles.testimonialComment}>{testimonial.comment}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary] as const}
          style={styles.ctaContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.ctaTitle}>🎉 Prêt à commencer ?</Text>
          <Text style={styles.ctaSubtitle}>
            Rejoignez des milliers d'utilisateurs qui font confiance à EventApp
          </Text>
          <View style={styles.ctaButtons}>
            <Button
              title="Essayer gratuitement"
              onPress={() => router.push('/(auth)/demo')}
              style={styles.ctaButton}
              textStyle={styles.ctaButtonText}
            />
            <TouchableOpacity 
              style={styles.ctaSecondaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.ctaSecondaryText}>Créer un compte</Text>
              <ArrowRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerLogo}>
            <Sparkles size={24} color={Colors.primary} />
            <Text style={styles.footerLogoText}>EventApp</Text>
          </View>
          <Text style={styles.footerText}>
            La plateforme de référence pour organiser vos événements
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 EventApp. Tous droits réservés.
          </Text>
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
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  heroTitleAccent: {
    color: '#FDE68A',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  heroImageContainer: {
    alignItems: 'center',
  },
  heroImage: {
    width: width - 40,
    height: 200,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  section: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
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
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    padding: 20,
    paddingTop: 40,
  },
  statsContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  testimonialsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: width - 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 14,
    color: Colors.textLight,
  },
  testimonialRating: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
  },
  testimonialComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ctaSection: {
    padding: 20,
    paddingTop: 40,
  },
  ctaContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButtons: {
    gap: 12,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ctaSecondaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: Colors.backgroundAlt,
    padding: 40,
    paddingBottom: 60,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLogoText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  footerCopyright: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});