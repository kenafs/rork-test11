import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  
  // CRITICAL FIX: Redirect authenticated users to main app
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user]);
  
  // Sparkle animation
  useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, []);
  
  // CRITICAL FIX: Show landing page only for non-authenticated users
  if (isAuthenticated && user) {
    return null; // Will redirect via useEffect
  }
  
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
  
  const features = [
    {
      icon: Users,
      title: 'Trouvez des prestataires',
      description: 'Découvrez des professionnels qualifiés pour vos événements',
      color: '#6366F1',
      gradient: ['#6366F1', '#8B5CF6']
    },
    {
      icon: Calendar,
      title: 'Organisez facilement',
      description: 'Planifiez et gérez tous vos événements en un seul endroit',
      color: '#EC4899',
      gradient: ['#EC4899', '#F97316']
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis authentiques de la communauté',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#EF4444']
    },
    {
      icon: Heart,
      title: 'Favoris personnalisés',
      description: 'Sauvegardez vos prestataires et lieux préférés',
      color: '#EF4444',
      gradient: ['#EF4444', '#EC4899']
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
      >
        {/* Hero Section with Parallax */}
        <Animated.View style={[styles.hero, headerStyle]}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={20} style={styles.heroBlur}>
              <Animated.View entering={FadeIn.delay(200)} style={styles.heroContent}>
                <View style={styles.logoContainer}>
                  <Animated.View style={sparkleStyle}>
                    <Sparkles size={40} color="#fff" />
                  </Animated.View>
                  <Text style={styles.logoText}>EventApp</Text>
                </View>
                
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
                    textStyle={styles.primaryButtonText}
                  />
                  <Button
                    title="Se connecter"
                    onPress={() => router.push('/(auth)/login')}
                    variant="outline"
                    style={styles.secondaryButton}
                    textStyle={styles.secondaryButtonText}
                  />
                </Animated.View>
              </Animated.View>
              
              <Animated.View entering={ZoomIn.delay(1000)} style={styles.heroImageContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop' }}
                  style={styles.heroImage}
                  transition={1000}
                />
              </Animated.View>
            </BlurView>
          </LinearGradient>
        </Animated.View>
        
        {/* Features Section with Staggered Animation */}
        <View style={styles.section}>
          <Animated.Text entering={FadeIn.delay(1200)} style={styles.sectionTitle}>
            ✨ Pourquoi choisir EventApp ?
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(1300)} style={styles.sectionSubtitle}>
            Découvrez tous les avantages de notre plateforme
          </Animated.Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View 
                key={`feature-${index}`}
                entering={SlideInDown.delay(1400 + index * 200)}
              >
                <BlurView intensity={20} style={styles.featureCard}>
                  <LinearGradient
                    colors={feature.gradient}
                    style={styles.featureIconContainer}
                  >
                    <feature.icon size={28} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </BlurView>
              </Animated.View>
            ))}
          </View>
        </View>
        
        {/* Stats Section with Animated Numbers */}
        <Animated.View entering={FadeIn.delay(2000)} style={styles.statsSection}>
          <BlurView intensity={30} style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(248, 250, 252, 0.9)', 'rgba(226, 232, 240, 0.9)']}
              style={styles.statsGradient}
            >
              <Text style={styles.statsTitle}>🎯 EventApp en chiffres</Text>
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
            </LinearGradient>
          </BlurView>
        </Animated.View>
        
        {/* Testimonials with Horizontal Scroll */}
        <View style={styles.section}>
          <Animated.Text entering={FadeIn.delay(2400)} style={styles.sectionTitle}>
            💬 Ce que disent nos utilisateurs
          </Animated.Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
            {testimonials.map((testimonial, index) => (
              <Animated.View 
                key={`testimonial-${index}`}
                entering={SlideInDown.delay(2600 + index * 200)}
              >
                <BlurView intensity={20} style={styles.testimonialCard}>
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
                </BlurView>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
        
        {/* CTA Section with Gradient Animation */}
        <Animated.View entering={SlideInDown.delay(3000)} style={styles.ctaSection}>
          <BlurView intensity={40} style={styles.ctaBlur}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
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
          </BlurView>
        </Animated.View>
        
        {/* Footer */}
        <Animated.View entering={FadeIn.delay(3200)} style={styles.footer}>
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
  hero: {
    height: height * 0.9,
    position: 'relative',
  },
  heroGradient: {
    flex: 1,
  },
  heroBlur: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: '#FDE68A',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 28,
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
    height: 220,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  section: {
    padding: 20,
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 17,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
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
    paddingTop: 60,
  },
  statsContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  statsGradient: {
    padding: 36,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 32,
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
    marginBottom: 24,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    marginRight: 20,
    width: width - 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 17,
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
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  ctaSection: {
    padding: 20,
    paddingTop: 60,
  },
  ctaBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  ctaContainer: {
    padding: 36,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  ctaButtons: {
    gap: 16,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
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
    paddingBottom: 80,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerLogoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  footerCopyright: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});