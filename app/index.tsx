import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { ArrowRight, Star, Users, Calendar, MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  
  const features = [
    {
      icon: Users,
      title: "Réseau de qualité",
      description: "Prestataires vérifiés et établissements de confiance"
    },
    {
      icon: Star,
      title: "Avis authentiques",
      description: "Évaluations réelles de clients satisfaits"
    },
    {
      icon: Calendar,
      title: "Réservation simple",
      description: "Organisez vos événements en quelques clics"
    },
    {
      icon: MapPin,
      title: "Partout en France",
      description: "Trouvez des prestataires près de chez vous"
    }
  ];
  
  const testimonials = [
    {
      name: "Marie L.",
      role: "Organisatrice d'événements",
      text: "Une plateforme exceptionnelle ! J'ai trouvé tous mes prestataires en un seul endroit.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&auto=format&fit=crop"
    },
    {
      name: "Pierre M.",
      role: "DJ Professionnel",
      text: "Grâce à cette app, j'ai développé ma clientèle et mes revenus ont doublé !",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop"
    }
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              L'événementiel{'\n'}
              <Text style={styles.heroTitleAccent}>simplifié</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Connectez-vous avec les meilleurs prestataires et établissements pour vos événements
            </Text>
            
            <View style={styles.heroButtons}>
              <Button
                title="Commencer"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.primaryButton}
                icon={<ArrowRight size={20} color="#fff" />}
              />
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.secondaryButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop' }}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
        </LinearGradient>
        
        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pourquoi nous choisir ?</Text>
          <View style={styles.featuresGrid}>
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
        
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#f8fafc', '#e2e8f0']}
            style={styles.statsContainer}
          >
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
        
        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>Ce qu'ils en pensent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Image
                    source={{ uri: testimonial.image }}
                    style={styles.testimonialAvatar}
                  />
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                    <View style={styles.testimonialRating}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.ctaContainer}
          >
            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
            <Text style={styles.ctaSubtitle}>
              Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
            </Text>
            <View style={styles.ctaButtons}>
              <Button
                title="Essayer gratuitement"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.ctaButton}
              />
              <TouchableOpacity 
                style={styles.ctaSecondaryButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.ctaSecondaryButtonText}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  heroTitleAccent: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  heroButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroImageContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  featuresSection: {
    padding: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 40,
  },
  statsContainer: {
    borderRadius: 20,
    padding: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
    fontWeight: '500',
  },
  testimonialsSection: {
    paddingVertical: 40,
  },
  testimonialsScroll: {
    paddingLeft: 20,
  },
  testimonialCard: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ctaSection: {
    padding: 20,
    marginBottom: 40,
  },
  ctaContainer: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  ctaSecondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaSecondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});