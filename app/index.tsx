import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Users, Calendar, MessageCircle, Star, ArrowRight } from 'lucide-react-native';

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to main app
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const features = [
    {
      icon: Users,
      title: 'Trouvez des prestataires',
      description: 'DJ, photographes, traiteurs... Tous les professionnels pour vos événements'
    },
    {
      icon: Calendar,
      title: 'Organisez vos événements',
      description: 'Mariages, anniversaires, soirées d\'entreprise... Planifiez facilement'
    },
    {
      icon: MessageCircle,
      title: 'Communiquez directement',
      description: 'Échangez avec les prestataires et recevez des devis personnalisés'
    },
    {
      icon: Star,
      title: 'Avis vérifiés',
      description: 'Consultez les avis clients pour faire le meilleur choix'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            La plateforme qui connecte clients, prestataires et établissements pour des événements réussis
          </Text>
          
          <View style={styles.heroButtons}>
            <Button
              title="Commencer"
              onPress={() => router.push('/(auth)/register')}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
            <Button
              title="Essayer la démo"
              variant="outline"
              onPress={() => router.push('/(auth)/demo')}
              style={styles.demoButton}
              textStyle={styles.demoButtonText}
            />
          </View>
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

      {/* User Types Section */}
      <View style={styles.userTypesSection}>
        <Text style={styles.sectionTitle}>Pour qui ?</Text>
        
        <View style={styles.userTypeCard}>
          <Text style={styles.userTypeTitle}>👤 Clients</Text>
          <Text style={styles.userTypeDescription}>
            Trouvez facilement des prestataires et établissements pour vos événements. 
            Comparez les offres et recevez des devis personnalisés.
          </Text>
        </View>
        
        <View style={styles.userTypeCard}>
          <Text style={styles.userTypeTitle}>💼 Prestataires</Text>
          <Text style={styles.userTypeDescription}>
            Proposez vos services, créez des devis et développez votre clientèle. 
            DJ, photographes, traiteurs, animateurs...
          </Text>
        </View>
        
        <View style={styles.userTypeCard}>
          <Text style={styles.userTypeTitle}>🏢 Établissements</Text>
          <Text style={styles.userTypeDescription}>
            Proposez votre lieu pour des événements. Restaurants, salles de réception, 
            châteaux, domaines...
          </Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary] as const}
          style={styles.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaSubtitle}>
            Rejoignez EventApp et donnez vie à vos événements
          </Text>
          
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.ctaButtonText}>Créer un compte</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginLinkText}>Déjà inscrit ? Se connecter</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
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
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  demoButton: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
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
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  userTypesSection: {
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
  },
  userTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  userTypeDescription: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  ctaSection: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  loginLink: {
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});