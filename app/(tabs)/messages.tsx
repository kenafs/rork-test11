import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import Colors from '@/constants/colors';
import { mockProviders, mockVenues } from '@/mocks/users';
import { MessageCircle, Clock, User } from 'lucide-react-native';

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getAllConversations, fetchConversations } = useMessages();
  
  // Get all conversations
  const allConversations = getAllConversations();
  
  // Mock conversation data for demo - merge with real conversations
  const mockConversations = [
    {
      id: '1',
      participantId: mockProviders[0].id,
      participantName: mockProviders[0].name,
      participantImage: mockProviders[0].profileImage,
      participantType: 'provider' as const,
      lastMessage: "Bonjour, je suis intéressé par vos services de DJ pour un événement d'entreprise le mois prochain.",
      timestamp: Date.now() - 3600000, // 1 hour ago
      unread: 2,
    },
    {
      id: '2',
      participantId: mockVenues[0].id,
      participantName: mockVenues[0].name,
      participantImage: mockVenues[0].profileImage,
      participantType: 'business' as const,
      lastMessage: "Merci pour votre message. Nous serions ravis de discuter de votre événement. Quand seriez-vous disponible pour un appel?",
      timestamp: Date.now() - 86400000, // 1 day ago
      unread: 0,
    },
    {
      id: '3',
      participantId: mockProviders[1].id,
      participantName: mockProviders[1].name,
      participantImage: mockProviders[1].profileImage,
      participantType: 'provider' as const,
      lastMessage: "Voici le devis pour le service de traiteur comme demandé. N'hésitez pas si vous avez des questions.",
      timestamp: Date.now() - 172800000, // 2 days ago
      unread: 0,
    },
  ];
  
  // Merge mock conversations with real ones, avoiding duplicates
  const combinedConversations = [...allConversations];
  mockConversations.forEach(mockConv => {
    if (!combinedConversations.find(conv => conv.participantId === mockConv.participantId)) {
      combinedConversations.push(mockConv);
    }
  });
  
  // Sort by timestamp (most recent first)
  const sortedConversations = combinedConversations.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60000) {
      return "À l'instant";
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} min`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Il y a ${days}j`;
    }
    
    // Format as date
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  
  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);
  
  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <MessageCircle size={64} color={Colors.primary} />
          <Text style={styles.loginTitle}>Connectez-vous pour accéder à vos messages</Text>
          <Text style={styles.loginDescription}>
            Vous devez être connecté pour voir vos conversations avec les prestataires et établissements.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => router.push('/(auth)/demo')}
          >
            <Text style={styles.demoButtonText}>Essayer avec un compte démo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Messages</Text>
        <TouchableOpacity 
          style={styles.newMessageButton}
          onPress={() => router.push('/conversation/new')}
        >
          <MessageCircle size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={sortedConversations}
        keyExtractor={(item) => item.participantId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationItem}
            onPress={() => router.push(`/conversation/${item.participantId}`)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              {item.participantImage ? (
                <Image 
                  source={{ uri: item.participantImage }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <User size={24} color="#fff" />
                </View>
              )}
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
              <View style={[styles.typeBadge, { 
                backgroundColor: item.participantType === 'provider' ? Colors.primary : Colors.accent 
              }]}>
                <Text style={styles.typeText}>
                  {item.participantType === 'provider' ? 'P' : item.participantType === 'business' ? 'B' : 'C'}
                </Text>
              </View>
            </View>
            
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.participantName} numberOfLines={1}>
                  {item.participantName}
                </Text>
                <View style={styles.timeContainer}>
                  <Clock size={12} color={Colors.textLight} />
                  <Text style={styles.timestamp}>
                    {formatRelativeTime(item.timestamp || Date.now())}
                  </Text>
                </View>
              </View>
              
              <Text 
                style={[
                  styles.lastMessage,
                  item.unread > 0 && styles.unreadMessage,
                ]} 
                numberOfLines={2}
              >
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptyText}>
              Vos conversations avec les prestataires et établissements apparaîtront ici.
            </Text>
            <TouchableOpacity 
              style={styles.startChatButton}
              onPress={() => router.push('/conversation/new')}
            >
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.startChatButtonText}>Commencer une conversation</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={sortedConversations.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  newMessageButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  demoButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});