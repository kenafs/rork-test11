import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import Colors, { gradients } from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { Sparkles, Users, Calendar, Star, ArrowRight, Heart, MessageCircle, TrendingUp } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const scrollY = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  
  // Sparkle animation
  useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, []);
  
  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user, router]);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, -50],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.9],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }, { scale }],
    };
  });
  
  const sparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });
  
  // Show landing page only for non-authenticated users
  if (isAuthenticated && user) {
    return null; // Will redirect via useEffect
  }
  
  const features = [
    {
      icon: Users,
      title: 'Trouvez des prestataires',
      description: 'Découvrez des professionnels qualifiés pour vos événements',
      color: '#6366F1',
    },
    {
      icon: Calendar,
      title: 'Organisez facilement',
      description: 'Planifiez et gérez tous vos événements en un seul endroit',
      color: '#EC4899',
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis authentiques de la communauté',
      color: '#F59E0B',
    },
    {
      icon: Heart,
      title: 'Favoris personnalisés',
      description: 'Sauvegardez vos prestataires et lieux préférés',
      color: '#EF4444',
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
    <View style={styles.container}>
      <AnimatedScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Hero Section */}
        <Animated.View style={[styles.hero, headerStyle]}>
          <View style={styles.heroContent}>
            <Animated.View entering={FadeIn.delay(200)} style={styles.logoContainer}>
              <Animated.View style={sparkleStyle}>
                <Sparkles size={32} color={Colors.primary} />
              </Animated.View>
              <Text style={styles.logoText}>EventApp</Text>
            </Animated.View>
            
            <Animated.Text entering={SlideInDown.delay(400)} style={styles.heroTitle}>
              Organisez des événements{'\n'}
              <Text style={styles.heroTitleAccent}>inoubliables</Text>
            </Animated.Text>
            
            <Animated.Text entering={FadeIn.delay(600)} style={styles.heroSubtitle}>
              Connectez-vous avec les meilleurs prestataires et lieux pour créer des moments magiques
            </Animated.Text>
            
            <Animated.View entering={SlideInDown.delay(800)} style={styles.heroButtons}>
              <Button
                title="🚀 Commencer"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.primaryButton}
                size="large"
              />
              <Button
                title="Se connecter"
                onPress={() => router.push('/(auth)/login')}
                variant="outline"
                style={styles.secondaryButton}
                size="large"
              />
            </Animated.View>
          </View>
          
          <Animated.View entering={ZoomIn.delay(1000)} style={styles.heroImageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop' }}
              style={styles.heroImage}
              transition={1000}
            />
          </Animated.View>
        </Animated.View>
        
        {/* Features Section */}
        <View style={styles.section}>
          <Animated.Text entering={FadeIn.delay(1200)} style={styles.sectionTitle}>
            Pourquoi choisir EventApp ?
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(1300)} style={styles.sectionSubtitle}>
            Découvrez tous les avantages de notre plateforme
          </Animated.Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View 
                key={`feature-${index}`}
                entering={SlideInDown.delay(1400 + index * 200)}
                style={styles.featureCard}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <feature.icon size={24} color="#fff" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
        
        {/* Stats Section */}
        <Animated.View entering={FadeIn.delay(2000)} style={styles.statsSection}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>EventApp en chiffres</Text>
            <View style={styles.statsGrid}>
              {[
                { number: '500+', label: 'Prestataires', icon: Users },
                { number: '1000+', label: 'Événements', icon: Calendar },
                { number: '98%', label: 'Satisfaction', icon: Star },
                { number: '50+', label: 'Villes', icon: TrendingUp },
              ].map((stat, index) => (
                <Animated.View 
                  key={`stat-${index}`}
                  entering={ZoomIn.delay(2200 + index * 100)}
                  style={styles.statItem}
                >
                  <stat.icon size={20} color={Colors.primary} />
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>
        
        {/* Testimonials */}
        <View style={styles.section}>
          <Animated.Text entering={FadeIn.delay(2400)} style={styles.sectionTitle}>
            Ce que disent nos utilisateurs
          </Animated.Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
            {testimonials.map((testimonial, index) => (
              <Animated.View 
                key={`testimonial-${index}`}
                entering={SlideInDown.delay(2600 + index * 200)}
                style={styles.testimonialCard}
              >
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
              </Animated.View>
            ))}
          </ScrollView>
        </View>
        
        {/* CTA Section */}
        <Animated.View entering={SlideInDown.delay(3000)} style={styles.ctaSection}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.ctaContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
            <Text style={styles.ctaSubtitle}>
              Rejoignez des milliers d'utilisateurs qui font confiance à EventApp
            </Text>
            <View style={styles.ctaButtons}>
              <Button
                title="Essayer gratuitement"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.ctaButton}
                size="large"
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
        </Animated.View>
        
        {/* Footer */}
        <Animated.View entering={FadeIn.delay(3200)} style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLogo}>
              <Sparkles size={20} color={Colors.primary} />
              <Text style={styles.footerLogoText}>EventApp</Text>
            </View>
            <Text style={styles.footerText}>
              La plateforme de référence pour organiser vos événements
            </Text>
            <Text style={styles.footerCopyright}>
              © 2024 EventApp. Tous droits réservés.
            </Text>
          </View>
        </Animated.View>
      </AnimatedScrollView>
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
    flexGrow: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.85,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  heroButtons: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 280,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 280,
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heroImage: {
    width: width - 40,
    height: 180,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresGrid: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 320,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
    maxWidth: 360,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 12,
    color: Colors.textLight,
  },
  testimonialRating: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
  },
  testimonialComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },
  ctaContainer: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    width: '100%',
    maxWidth: 360,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  ctaButtons: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  ctaButton: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 240,
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  ctaSecondaryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLogoText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerCopyright: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});