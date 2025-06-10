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

// Mock messages for demo
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    text: "Bonjour ! Je suis intéressé par vos services de DJ pour un événement d'entreprise le mois prochain.",
    timestamp: Date.now() - 3600000,
    type: 'text',
  },
  {
    id: '2',
    senderId: 'current-user',
    text: "Bonjour ! Merci pour votre message. Je serais ravi de vous aider avec votre événement. Pouvez-vous me donner plus de détails ?",
    timestamp: Date.now() - 3000000,
    type: 'text',
  },
  {
    id: '3',
    senderId: '1',
    text: "C'est pour une soirée d'entreprise avec environ 100 personnes. Nous cherchons une ambiance festive mais professionnelle.",
    timestamp: Date.now() - 2400000,
    type: 'text',
  },
  {
    id: '4',
    senderId: 'current-user',
    text: "Parfait ! Je peux vous préparer un devis personnalisé. Quelle est la date prévue ?",
    timestamp: Date.now() - 1800000,
    type: 'text',
  },
];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addContact } = useMessages();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Find the other participant
  const allUsers = [...mockProviders, ...mockVenues];
  const otherUser = allUsers.find(u => u.id === id);
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser || !otherUser) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Add to global messages store
    if (addContact) {
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
    }
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
  
  if (!isAuthenticated || !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vous devez être connecté pour accéder aux messages</Text>
      </View>
    );
  }
  
  if (!otherUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Conversation non trouvée</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{ 
          title: otherUser.name,
          headerRight: () => (
            currentUser.userType === 'provider' ? (
              <TouchableOpacity onPress={sendQuote} style={styles.quoteButton}>
                <Text style={styles.quoteButtonText}>Devis</Text>
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
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
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 8,
    maxHeight: 80,
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
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    margin: 20,
  },
});