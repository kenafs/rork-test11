import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { ArrowRight, Star, Users, Calendar, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // If user is logged in, redirect to tabs
  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);
  
  const features = [
    {
      icon: Users,
      title: 'Réseau de confiance',
      description: 'Prestataires vérifiés et notés par la communauté',
    },
    {
      icon: Calendar,
      title: 'Réservation simple',
      description: 'Organisez vos événements en quelques clics',
    },
    {
      icon: Shield,
      title: 'Paiement sécurisé',
      description: 'Transactions protégées et garanties',
    },
    {
      icon: Star,
      title: 'Qualité garantie',
      description: 'Les meilleurs prestataires de votre région',
    },
  ];
  
  const testimonials = [
    {
      name: 'Marie L.',
      role: 'Organisatrice d\'événements',
      text: 'Grâce à cette app, j\'ai trouvé les meilleurs prestataires pour mon mariage. Tout était parfait !',
      rating: 5,
    },
    {
      name: 'Pierre M.',
      role: 'DJ Professionnel',
      text: 'Une plateforme formidable pour développer mon activité. Je recommande à tous les prestataires !',
      rating: 5,
    },
    {
      name: 'Sophie R.',
      role: 'Propriétaire de restaurant',
      text: 'Nous recevons maintenant beaucoup plus de demandes pour nos événements privés.',
      rating: 5,
    },
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Organisez vos événements{'\n'}
              <Text style={styles.heroTitleAccent}>parfaits</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Trouvez les meilleurs prestataires pour tous vos événements : mariages, anniversaires, événements d'entreprise et plus encore.
            </Text>
            
            <View style={styles.heroActions}>
              <Button
                title="Commencer maintenant"
                onPress={() => router.push('/(auth)/register')}
                style={styles.primaryButton}
                icon={<ArrowRight size={20} color="#fff" />}
              />
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/demo')}
              >
                <Text style={styles.secondaryButtonText}>Voir la démo</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginLinkText}>
                Déjà inscrit ? <Text style={styles.loginLinkAccent}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.heroImage}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop' }}
              style={styles.heroImageContent}
              contentFit="cover"
            />
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Prestataires</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Événements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>
        
        {/* Features Section */}
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Pourquoi nous choisir ?</Text>
          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Recherchez</Text>
                <Text style={styles.stepDescription}>
                  Trouvez le prestataire parfait selon vos critères
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Contactez</Text>
                <Text style={styles.stepDescription}>
                  Échangez directement avec les prestataires
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Réservez</Text>
                <Text style={styles.stepDescription}>
                  Confirmez votre réservation en toute sécurité
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Testimonials */}
        <View style={styles.testimonials}>
          <Text style={styles.sectionTitle}>Ce que disent nos utilisateurs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.testimonialList}>
              {testimonials.map((testimonial, index) => (
                <View key={index} style={styles.testimonialCard}>
                  <View style={styles.testimonialRating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
                    ))}
                  </View>
                  <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
                  <View style={styles.testimonialAuthor}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* CTA Section */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaSubtitle}>
            Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
          </Text>
          <Button
            title="Créer mon compte"
            onPress={() => router.push('/(auth)/register')}
            style={styles.ctaButton}
          />
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
  hero: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
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
  },
  heroActions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loginLinkAccent: {
    color: Colors.primary,
    fontWeight: '600',
  },
  heroImage: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImageContent: {
    width: '100%',
    height: '100%',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundAlt,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  features: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  howItWorks: {
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
  },
  steps: {
    gap: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  testimonials: {
    padding: 20,
  },
  testimonialList: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 20,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 12,
    color: Colors.textLight,
  },
  cta: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginTop: 40,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
  },
});