import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
    <View style={styles.container}>
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
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>Commencer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.secondaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: '#FFE066',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  heroButtons: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});