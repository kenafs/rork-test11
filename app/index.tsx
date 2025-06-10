import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Star, Users, Calendar, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: Users,
    title: 'Réseau de confiance',
    description: 'Connectez-vous avec des prestataires et établissements vérifiés',
  },
  {
    icon: Star,
    title: 'Avis authentiques',
    description: 'Consultez les avis clients pour faire le bon choix',
  },
  {
    icon: Calendar,
    title: 'Réservation simple',
    description: 'Organisez vos événements en quelques clics',
  },
  {
    icon: MapPin,
    title: 'Recherche locale',
    description: 'Trouvez des services près de chez vous',
  },
];

const testimonials = [
  {
    name: 'Marie Dubois',
    role: 'Organisatrice d\'événements',
    text: 'Grâce à cette app, j\'ai trouvé les meilleurs prestataires pour mon mariage !',
    rating: 5,
  },
  {
    name: 'Pierre Martin',
    role: 'DJ Professionnel',
    text: 'Une plateforme parfaite pour développer mon activité et rencontrer de nouveaux clients.',
    rating: 5,
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Organisez vos événements{'\n'}
            <Text style={styles.heroTitleAccent}>parfaits</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            La plateforme qui connecte organisateurs, prestataires et établissements pour créer des événements inoubliables.
          </Text>
          
          <View style={styles.heroButtons}>
            <Button
              title="Commencer"
              onPress={() => router.push('/(auth)/register')}
              style={styles.primaryButton}
              icon={<ArrowRight size={20} color="#fff" />}
            />
            <Button
              title="Se connecter"
              variant="outline"
              onPress={() => router.push('/(auth)/login')}
              style={styles.secondaryButton}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => router.push('/(auth)/demo')}
          >
            <Text style={styles.demoButtonText}>
              ✨ Essayer avec un compte de démonstration
            </Text>
          </TouchableOpacity>
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
      
      {/* How it works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Créez votre profil</Text>
            <Text style={styles.stepDescription}>
              Inscrivez-vous en tant que client, prestataire ou établissement
            </Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Publiez ou recherchez</Text>
            <Text style={styles.stepDescription}>
              Créez vos annonces ou trouvez les services dont vous avez besoin
            </Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Connectez-vous</Text>
            <Text style={styles.stepDescription}>
              Échangez, négociez et organisez vos événements parfaits
            </Text>
          </View>
        </View>
      </View>
      
      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.sectionTitle}>Ce que disent nos utilisateurs</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.testimonialsContainer}
        >
          {testimonials.map((testimonial, index) => (
            <View key={index} style={styles.testimonialCard}>
              <View style={styles.testimonialRating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
                ))}
              </View>
              <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              <Text style={styles.testimonialName}>{testimonial.name}</Text>
              <Text style={styles.testimonialRole}>{testimonial.role}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* CTA Section */}
      <LinearGradient
        colors={[Colors.secondary, Colors.primary]}
        style={styles.ctaSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
        <Text style={styles.ctaSubtitle}>
          Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
        </Text>
        <Button
          title="Créer mon compte"
          onPress={() => router.push('/(auth)/register')}
          style={styles.ctaButton}
          icon={<ArrowRight size={20} color={Colors.primary} />}
        />
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
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
    lineHeight: 40,
  },
  heroTitleAccent: {
    color: '#FFE066',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  secondaryButton: {
    flex: 1,
    borderColor: '#fff',
  },
  demoButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    lineHeight: 20,
  },
  howItWorksSection: {
    padding: 20,
    backgroundColor: Colors.backgroundAlt,
  },
  stepsContainer: {
    gap: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    flex: 1,
  },
  testimonialsSection: {
    padding: 20,
    paddingTop: 40,
  },
  testimonialsContainer: {
    paddingHorizontal: 10,
    gap: 16,
  },
  testimonialCard: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 2,
  },
  testimonialText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: 14,
    color: Colors.textLight,
  },
  ctaSection: {
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
});