import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import { Star, Users, Calendar, ArrowRight, Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Redirect authenticated users to tabs
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  
  const features = [
    {
      icon: '🎵',
      title: 'DJ & Animation',
      description: 'Trouvez les meilleurs DJ pour vos événements',
    },
    {
      icon: '🍽️',
      title: 'Traiteur',
      description: 'Services de restauration pour tous types d\'événements',
    },
    {
      icon: '📸',
      title: 'Photographie',
      description: 'Immortalisez vos moments précieux',
    },
    {
      icon: '🏛️',
      title: 'Lieux & Salles',
      description: 'Espaces parfaits pour vos réceptions',
    },
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Organisez l'événement parfait
            </Text>
            <Text style={styles.heroSubtitle}>
              Connectez-vous avec les meilleurs prestataires d'événements en France
            </Text>
            
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Star size={24} color={Colors.secondary} />
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={24} color={Colors.secondary} />
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Prestataires</Text>
              </View>
              <View style={styles.statItem}>
                <Calendar size={24} color={Colors.secondary} />
                <Text style={styles.statNumber}>1000+</Text>
                <Text style={styles.statLabel}>Événements</Text>
              </View>
            </View>
            
            <View style={styles.heroActions}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/demo')}
              >
                <Play size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Essayer la démo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.secondaryButtonText}>Créer un compte</Text>
                <ArrowRight size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Nos services</Text>
          <Text style={styles.sectionSubtitle}>
            Tout ce dont vous avez besoin pour votre événement
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaSubtitle}>
            Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
          </Text>
          
          <View style={styles.ctaActions}>
            <TouchableOpacity 
              style={styles.ctaPrimaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.ctaPrimaryButtonText}>Créer un compte gratuit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.ctaSecondaryButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.ctaSecondaryButtonText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  heroActions: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 40,
    backgroundColor: Colors.backgroundAlt,
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
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  featureCard: {
    width: (width - 100) / 2,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaSection: {
    padding: 40,
    backgroundColor: '#fff',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  ctaActions: {
    gap: 16,
  },
  ctaPrimaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaPrimaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaSecondaryButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaSecondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});