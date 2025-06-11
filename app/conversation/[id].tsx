import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { mockProviders, mockVenues } from '@/mocks/users';
import Colors from '@/constants/colors';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react-native';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: 'text' | 'image' | 'quote';
  quoteId?: string;
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { messages, sendMessage, getConversationByParticipant, addContact, fetchMessages, createConversation } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Find the other participant
  const allUsers = [...mockProviders, ...mockVenues];
  const otherUser = allUsers.find(u => u.id === id);
  
  // Get or create conversation
  const [conversation, setConversation] = useState(getConversationByParticipant(id || ''));
  const conversationMessages = conversation ? messages[conversation.id] || [] : [];
  
  // Create conversation if it doesn't exist
  useEffect(() => {
    const initializeConversation = async () => {
      if (!conversation && id && currentUser && otherUser) {
        try {
          console.log('Creating new conversation for participant:', id);
          const conversationId = await createConversation(id);
          const newConversation = getConversationByParticipant(id);
          setConversation(newConversation);
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
    };
    
    initializeConversation();
  }, [id, currentUser, otherUser, conversation]);
  
  // Convert to display format
  const displayMessages: Message[] = conversationMessages.map(msg => ({
    id: msg.id,
    senderId: msg.senderId,
    text: msg.content,
    timestamp: msg.timestamp,
    type: 'text',
  }));
  
  // Load messages when conversation is found
  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id);
    }
  }, [conversation?.id]);
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !otherUser) {
      return;
    }
    
    if (!conversation) {
      Alert.alert('Erreur', 'Conversation non trouvée');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendMessage(conversation.id, newMessage.trim(), otherUser.id);
      
      // Update contact in messages store
      addContact({
        participantId: otherUser.id,
        participantName: otherUser.name,
        participantImage: otherUser.profileImage,
        participantType: otherUser.userType === 'provider' ? 'provider' : 
                        otherUser.userType === 'business' ? 'business' : 'client',
        lastMessage: newMessage.trim(),
        unread: 0,
        timestamp: Date.now(),
      });
      
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send quote - only for providers
  const sendQuote = () => {
    if (!currentUser || currentUser.userType !== 'provider') {
      Alert.alert('Erreur', 'Seuls les prestataires peuvent envoyer des devis');
      return;
    }
    
    router.push(`/create-quote/conversation-${id}`);
  };
  
  // Render message
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUser?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (displayMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [displayMessages.length]);
  
  if (!isAuthenticated || !currentUser) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Messages" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vous devez être connecté pour accéder aux messages</Text>
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
  
  if (!otherUser) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Messages" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation non trouvée</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: otherUser.name,
          headerRight: () => (
            currentUser.userType === 'provider' && otherUser.userType !== 'business' ? (
              <TouchableOpacity onPress={sendQuote} style={styles.quoteButton}>
                <Text style={styles.quoteButtonText}>Devis</Text>
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Début de votre conversation avec {otherUser.name}
            </Text>
            <Text style={styles.emptySubtext}>
              Envoyez votre premier message pour commencer !
            </Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Tapez votre message..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.sendButton, (!newMessage.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isLoading}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currentUserBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: Colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    minHeight: Platform.OS === 'ios' ? 80 : 60,
    marginBottom: Platform.OS === 'ios' ? 100 : 85,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 8,
    maxHeight: 80,
    minHeight: 20,
  },
  attachButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  quoteButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});