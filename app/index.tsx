import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
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
import { Sparkles, Users, Calendar, Star, ArrowRight, Heart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      [1, 0.95],
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
    return null;
  }
  
  const features = [
    {
      icon: Users,
      title: 'Trouvez des prestataires',
      description: 'Découvrez des professionnels qualifiés pour vos événements',
    },
    {
      icon: Calendar,
      title: 'Organisez facilement',
      description: 'Planifiez et gérez tous vos événements en un seul endroit',
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis authentiques de la communauté',
    },
    {
      icon: Heart,
      title: 'Favoris personnalisés',
      description: 'Sauvegardez vos prestataires et lieux préférés',
    }
  ];
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AnimatedScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
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
                title="Commencer"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.primaryButton}
                size="large"
              />
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.secondaryButtonText}>Se connecter</Text>
                <ArrowRight size={16} color={Colors.primary} />
              </TouchableOpacity>
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
        <View style={styles.featuresSection}>
          <Animated.Text entering={FadeIn.delay(1200)} style={styles.sectionTitle}>
            Pourquoi choisir EventApp ?
          </Animated.Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View 
                key={`feature-${index}`}
                entering={SlideInDown.delay(1400 + index * 200)}
                style={styles.featureCard}
              >
                <View style={styles.featureIconContainer}>
                  <feature.icon size={24} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
        
        {/* CTA Section */}
        <Animated.View entering={SlideInDown.delay(2000)} style={styles.ctaSection}>
          <View style={styles.ctaContainer}>
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
            </View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 16,
    fontWeight: '400',
  },
  heroButtons: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 280,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heroImage: {
    width: width - 48,
    height: 200,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  featuresGrid: {
    width: '100%',
    gap: 24,
    alignItems: 'center',
  },
  featureCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    width: '100%',
    maxWidth: 320,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundAlt,
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
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
  },
  ctaContainer: {
    backgroundColor: Colors.background,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
    maxWidth: 360,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '400',
  },
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 240,
  },
});