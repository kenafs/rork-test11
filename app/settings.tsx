import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGES } from '@/constants/languages';
import Colors from '@/constants/colors';
import { 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    darkMode, 
    notifications, 
    emailNotifications, 
    pushNotifications,
    setDarkMode,
    setNotifications,
    setEmailNotifications,
    setPushNotifications
  } = useSettings();
  const { currentLanguage, setLanguage, t } = useLanguage();
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      'Langue',
      'Choisissez votre langue',
      [
        ...LANGUAGES.map(lang => ({
          text: `${lang.flag} ${lang.name}`,
          onPress: () => setLanguage(lang.code as any),
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handlePrivacy = () => {
    Alert.alert('Confidentialité', 'Cette fonctionnalité sera disponible prochainement.');
  };

  const handlePayments = () => {
    Alert.alert('Stripe Integration', 'L\'intégration Stripe sera disponible prochainement pour gérer vos paiements.');
  };

  const handleHelp = () => {
    Alert.alert('Support', 'Contactez-nous à support@eventapp.com');
  };

  const handleAbout = () => {
    Alert.alert('À propos', 'Event App v1.0.0\nDéveloppé avec ❤️');
  };
  
  const settingsGroups = [
    {
      title: 'Apparence',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          title: 'Mode sombre',
          subtitle: 'Activer le thème sombre',
          type: 'switch' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Globe,
          title: 'Langue',
          subtitle: `${LANGUAGES.find(l => l.code === currentLanguage)?.flag} ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`,
          type: 'navigation' as const,
          onPress: handleLanguageSelect,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Recevoir des notifications',
          type: 'switch' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Mail,
          title: 'Notifications email',
          subtitle: 'Recevoir des emails',
          type: 'switch' as const,
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          icon: Phone,
          title: 'Notifications push',
          subtitle: 'Notifications sur l\'appareil',
          type: 'switch' as const,
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
      ],
    },
    {
      title: 'Compte',
      items: [
        {
          icon: User,
          title: 'Modifier le profil',
          subtitle: 'Informations personnelles',
          type: 'navigation' as const,
          onPress: handleEditProfile,
        },
        {
          icon: Shield,
          title: 'Confidentialité',
          subtitle: 'Paramètres de confidentialité',
          type: 'navigation' as const,
          onPress: handlePrivacy,
        },
        {
          icon: CreditCard,
          title: 'Paiements',
          subtitle: 'Gérer vos moyens de paiement',
          type: 'navigation' as const,
          onPress: handlePayments,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Aide',
          subtitle: 'FAQ et contact',
          type: 'navigation' as const,
          onPress: handleHelp,
        },
        {
          icon: MapPin,
          title: 'À propos',
          subtitle: 'Version et informations',
          type: 'navigation' as const,
          onPress: handleAbout,
        },
      ],
    },
  ];
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Paramètres' }} />
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>Connectez-vous pour accéder aux paramètres</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Paramètres',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <User size={32} color={Colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userType}>
                {user.userType === 'provider' ? 'Prestataire' : 
                 user.userType === 'business' ? 'Établissement' : 'Client'}
              </Text>
            </View>
          </View>
        </View>
        
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === group.items.length - 1 && styles.lastItem
                  ]}
                  onPress={item.type === 'navigation' ? item.onPress : undefined}
                  disabled={item.type === 'switch'}
                  activeOpacity={item.type === 'switch' ? 1 : 0.7}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <item.icon size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.settingRight}>
                    {item.type === 'switch' ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: Colors.border, true: Colors.primary }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <ChevronRight size={20} color={Colors.textLight} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 20,
  },
  groupItems: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  settingRight: {
    marginLeft: 12,
  },
  logoutSection: {
    padding: 20,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});