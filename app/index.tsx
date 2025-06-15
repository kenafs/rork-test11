import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import { 
  Star, 
  Users, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Heart,
  ArrowRight,
  Play,
  Shield,
  Award,
  Zap
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to main app
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // Don't render landing page for authenticated users
  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: Calendar,
      title: "Événements sur mesure",
      description: "Trouvez le prestataire parfait pour votre événement unique",
      color: "#3b82f6"
    },
    {
      icon: Users,
      title: "Communauté vérifiée",
      description: "Des professionnels certifiés et des avis authentiques",
      color: "#8b5cf6"
    },
    {
      icon: Shield,
      title: "Paiement sécurisé",
      description: "Transactions protégées et garantie satisfaction",
      color: "#10b981"
    },
    {
      icon: Zap,
      title: "Réponse rapide",
      description: "Obtenez des devis en moins de 24h",
      color: "#f59e0b"
    }
  ];

  const stats = [
    { number: "10K+", label: "Événements réalisés", icon: Calendar },
    { number: "5K+", label: "Prestataires actifs", icon: Users },
    { number: "4.9", label: "Note moyenne", icon: Star },
    { number: "98%", label: "Clients satisfaits", icon: Heart }
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Organisatrice d'événements",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      text: "EventApp a révolutionné ma façon de travailler. Je trouve des prestataires de qualité en quelques clics !",
      rating: 5
    },
    {
      name: "Alexandre Dubois",
      role: "DJ Professionnel",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      text: "Grâce à cette plateforme, j'ai doublé mon chiffre d'affaires en 6 mois. Les clients sont de qualité !",
      rating: 5
    },
    {
      name: "Emma Rousseau",
      role: "Future mariée",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "J'ai organisé mon mariage de rêve grâce aux prestataires trouvés sur EventApp. Tout était parfait !",
      rating: 5
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#1e3a8a', '#3730a3', '#1e40af']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <Sparkles size={32} color="#fbbf24" />
              <Text style={styles.logoText}>EventApp</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Créez des événements{'\n'}
              <Text style={styles.heroTitleAccent}>inoubliables</Text>
            </Text>
            
            <Text style={styles.heroSubtitle}>
              La plateforme qui connecte organisateurs et prestataires pour des événements d'exception
            </Text>
            
            <View style={styles.heroButtons}>
              <Button
                title="Essayer gratuitement"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
              />
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Play size={20} color="#fff" />
                <Text style={styles.secondaryButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Floating Cards */}
          <View style={styles.floatingCards}>
            <View style={[styles.floatingCard, styles.floatingCard1]}>
              <Star size={16} color="#fbbf24" />
              <Text style={styles.floatingCardText}>4.9/5</Text>
            </View>
            <View style={[styles.floatingCard, styles.floatingCard2]}>
              <Users size={16} color="#3b82f6" />
              <Text style={styles.floatingCardText}>10K+ événements</Text>
            </View>
            <View style={[styles.floatingCard, styles.floatingCard3]}>
              <Heart size={16} color="#ec4899" />
              <Text style={styles.floatingCardText}>98% satisfaits</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Ils nous font confiance</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIcon}>
                  <stat.icon size={24} color="#1e3a8a" />
                </View>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pourquoi choisir EventApp ?</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <LinearGradient
                  colors={[feature.color + '20', feature.color + '10']}
                  style={styles.featureIconContainer}
                >
                  <feature.icon size={28} color={feature.color} />
                </LinearGradient>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>Ce qu'ils en disent</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Image 
                    source={{ uri: testimonial.image }} 
                    style={styles.testimonialImage}
                  />
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                  </View>
                  <View style={styles.testimonialRating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />
                    ))}
                  </View>
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['#1e3a8a', '#3730a3']}
          style={styles.ctaSection}
        >
          <View style={styles.ctaContent}>
            <Award size={48} color="#fbbf24" />
            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
            <Text style={styles.ctaSubtitle}>
              Rejoignez des milliers d'organisateurs et prestataires qui font confiance à EventApp
            </Text>
            
            <View style={styles.ctaButtons}>
              <Button
                title="Comptes démo"
                onPress={() => router.push('/(auth)/demo')}
                style={styles.ctaPrimaryButton}
                textStyle={styles.ctaPrimaryButtonText}
              />
              
              <TouchableOpacity 
                style={styles.ctaSecondaryButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.ctaSecondaryButtonText}>S'inscrire</Text>
                <ArrowRight size={20} color="#1e3a8a" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerBrand}>
              <Sparkles size={24} color="#1e3a8a" />
              <Text style={styles.footerBrandText}>EventApp</Text>
            </View>
            <Text style={styles.footerText}>
              La plateforme de référence pour vos événements
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Inscription</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/demo')}>
                <Text style={styles.footerLink}>Démo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Hero Section
  heroSection: {
    minHeight: height * 0.85,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 50,
  },
  heroTitleAccent: {
    color: '#fbbf24',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Floating Cards
  floatingCards: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingCard: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingCard1: {
    top: 120,
    right: 20,
  },
  floatingCard2: {
    top: 200,
    left: 20,
  },
  floatingCard3: {
    bottom: 120,
    right: 30,
  },
  floatingCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  
  // Stats Section
  statsSection: {
    padding: 32,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: (width - 80) / 2,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Features Section
  featuresSection: {
    padding: 32,
    backgroundColor: '#f8fafc',
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
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIconContainer: {
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
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Testimonials Section
  testimonialsSection: {
    padding: 32,
    backgroundColor: '#fff',
  },
  testimonialsScroll: {
    paddingHorizontal: 4,
  },
  testimonialCard: {
    width: width * 0.8,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    color: '#1e293b',
  },
  testimonialRole: {
    fontSize: 14,
    color: '#64748b',
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  // CTA Section
  ctaSection: {
    padding: 40,
    margin: 20,
    borderRadius: 24,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  ctaPrimaryButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  ctaPrimaryButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  ctaSecondaryButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Footer
  footer: {
    backgroundColor: '#fff',
    padding: 32,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerContent: {
    alignItems: 'center',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerBrandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
  },
});