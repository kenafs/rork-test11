import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGES } from '@/constants/languages';
import { SettingItem } from '@/types';
import Colors from '@/constants/colors';
import { 
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
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { 
    notifications, 
    emailNotifications, 
    pushNotifications,
    toggleNotifications,
    toggleEmailNotifications,
    togglePushNotifications
  } = useSettings();
  const { currentLanguage, setLanguage, t } = useLanguage();
  
  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Starting logout from settings...");
              await logout();
              console.log("Logout completed successfully");
              // Force navigation to home after logout
              router.dismissAll();
              router.replace("/(tabs)");
            } catch (error) {
              console.error('Logout error in settings:', error);
              // Force navigation even if logout fails
              router.dismissAll();
              router.replace("/(tabs)");
            }
          }
        }
      ]
    );
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      "Choisir la langue",
      "Sélectionnez votre langue préférée",
      [
        ...LANGUAGES.map(lang => ({
          text: `${lang.flag} ${lang.name}`,
          onPress: () => {
            console.log("Setting language to:", lang.code);
            setLanguage(lang.code as any);
            Alert.alert("Langue modifiée", `Langue changée vers ${lang.name}`);
          },
        })),
        { text: "Annuler", style: "cancel" },
      ]
    );
  };

  const handleEditProfile = () => {
    try {
      console.log("Navigating to edit-profile...");
      router.push("/edit-profile");
    } catch (error) {
      console.error('Navigation error to edit-profile:', error);
      Alert.alert("Erreur", "Impossible d'accéder à la modification du profil");
    }
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Confidentialité et sécurité", 
      "Paramètres de confidentialité:\n\n• Vos données sont protégées\n• Contrôlez qui peut vous voir\n• Gérez vos préférences de contact\n\nCette section sera bientôt disponible avec plus d'options."
    );
  };

  const handlePayments = () => {
    Alert.alert(
      "Moyens de paiement", 
      "Gestion des paiements:\n\n• Ajouter une carte bancaire\n• Configurer les virements\n• Historique des transactions\n• Intégration Stripe sécurisée\n\nCette fonctionnalité sera disponible prochainement."
    );
  };

  const handleHelp = () => {
    Alert.alert(
      "Centre d'aide", 
      "Besoin d'aide ?\n\n📧 Email: support@eventapp.com\n📞 Téléphone: +33 1 23 45 67 89\n💬 Chat en direct disponible\n\nNous sommes là pour vous aider !"
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "À propos de l'application", 
      "Event App v1.0.0\n\n🎉 Plateforme de mise en relation pour événements\n👥 Connecte clients, prestataires et établissements\n🇫🇷 Développé en France\n\n© 2024 Event App. Tous droits réservés.\n\nDéveloppé avec ❤️ par l'équipe Event App"
    );
  };

  const handleNotificationsToggle = () => {
    console.log("Toggling notifications from:", notifications, "to:", !notifications);
    toggleNotifications();
    Alert.alert(
      "Notifications", 
      !notifications ? "Notifications activées" : "Notifications désactivées"
    );
  };

  const handleEmailNotificationsToggle = () => {
    console.log("Toggling email notifications from:", emailNotifications, "to:", !emailNotifications);
    toggleEmailNotifications();
    Alert.alert(
      "Notifications email", 
      !emailNotifications ? "Emails activés" : "Emails désactivés"
    );
  };

  const handlePushNotificationsToggle = () => {
    console.log("Toggling push notifications from:", pushNotifications, "to:", !pushNotifications);
    togglePushNotifications();
    Alert.alert(
      "Notifications push", 
      !pushNotifications ? "Notifications push activées" : "Notifications push désactivées"
    );
  };
  
  const settingsGroups = [
    {
      title: "Apparence",
      items: [
        {
          icon: Globe,
          title: "Langue",
          subtitle: `${LANGUAGES.find(l => l.code === currentLanguage)?.flag} ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`,
          type: "navigation" as const,
          onPress: handleLanguageSelect,
        },
      ] as SettingItem[],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          title: "Notifications générales",
          subtitle: notifications ? "Activées" : "Désactivées",
          type: "switch" as const,
          value: notifications,
          onToggle: handleNotificationsToggle,
        },
        {
          icon: Mail,
          title: "Notifications email",
          subtitle: emailNotifications ? "Activées" : "Désactivées",
          type: "switch" as const,
          value: emailNotifications,
          onToggle: handleEmailNotificationsToggle,
        },
        {
          icon: Phone,
          title: "Notifications push",
          subtitle: pushNotifications ? "Activées" : "Désactivées",
          type: "switch" as const,
          value: pushNotifications,
          onToggle: handlePushNotificationsToggle,
        },
      ] as SettingItem[],
    },
    {
      title: "Compte",
      items: [
        {
          icon: User,
          title: "Modifier le profil",
          subtitle: "Informations personnelles",
          type: "navigation" as const,
          onPress: handleEditProfile,
        },
        {
          icon: Shield,
          title: "Confidentialité",
          subtitle: "Sécurité et vie privée",
          type: "navigation" as const,
          onPress: handlePrivacy,
        },
        ...(user?.userType === "provider" || user?.userType === "business" ? [{
          icon: CreditCard,
          title: "Paiements",
          subtitle: "Cartes et virements",
          type: "navigation" as const,
          onPress: handlePayments,
        }] : []),
      ] as SettingItem[],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Centre d'aide",
          subtitle: "FAQ et assistance",
          type: "navigation" as const,
          onPress: handleHelp,
        },
        {
          icon: MapPin,
          title: "À propos",
          subtitle: "Version et informations",
          type: "navigation" as const,
          onPress: handleAbout,
        },
      ] as SettingItem[],
    },
  ];
  
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ title: "Paramètres" }} />
        <View style={[styles.loginPrompt, { 
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40
        }]}>
          <Text style={styles.loginTitle}>Connectez-vous pour accéder aux paramètres</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ 
        title: "Paramètres",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { 
          paddingBottom: insets.bottom + 120
        }]}
      >
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <User size={32} color={Colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userType}>
                {user.userType === "provider" ? "Prestataire" : 
                 user.userType === "business" ? "Établissement" : "Client"}
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
                  onPress={item.type === "navigation" ? item.onPress : undefined}
                  disabled={item.type === "switch"}
                  activeOpacity={item.type === "switch" ? 1 : 0.7}
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
                    {item.type === "switch" ? (
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
  scrollContent: {
    flexGrow: 1,
  },
  userSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
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
    fontWeight: "600",
    textTransform: "uppercase",
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 20,
  },
  groupItems: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});