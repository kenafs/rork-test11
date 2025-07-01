import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
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
  withTiming
} from 'react-native-reanimated';
import { Sparkles, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  
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
  
  const sparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });
  
  // Show landing page only for non-authenticated users
  if (isAuthenticated && user) {
    return null;
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: Colors.background }]}>
      {/* Hero Section */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroContent}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.logoContainer}>
            <Animated.View style={sparkleStyle}>
              <Sparkles size={32} color={Colors.primary} />
            </Animated.View>
            <Text style={[styles.logoText, { color: Colors.text }]}>EventApp</Text>
          </Animated.View>
          
          <Animated.Text entering={SlideInDown.delay(400)} style={[styles.heroTitle, { color: Colors.text }]}>
            Organisez des événements{'\n'}
            <Text style={[styles.heroTitleAccent, { color: Colors.primary }]}>inoubliables</Text>
          </Animated.Text>
          
          <Animated.Text entering={FadeIn.delay(600)} style={[styles.heroSubtitle, { color: Colors.textLight }]}>
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
              <Text style={[styles.secondaryButtonText, { color: Colors.primary }]}>Se connecter</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroTitleAccent: {
    // Color will be set dynamically
  },
  heroSubtitle: {
    fontSize: 18,
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
});