import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useQuotes } from '@/hooks/useQuotes';
import { Message } from '@/types';
import Colors from '@/constants/colors';
import { Send, FileText, Check, CheckCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConversationScreen() {
  const router = useRouter();
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { messages, sendMessage, fetchMessages, markAsRead } = useMessages();
  const { getQuoteById } = useQuotes();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const conversationMessages = conversationId ? messages[conversationId] || [] : [];
  
  // Get other participant info
  const otherParticipantId = conversationMessages.length > 0 
    ? conversationMessages[0].senderId === user?.id 
      ? conversationMessages[0].receiverId 
      : conversationMessages[0].senderId
    : '';
  
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId]);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [conversationMessages.length]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !user || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(conversationId, messageText.trim(), otherParticipantId);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id;
    
    if (message.type === 'quote' && message.quoteId) {
      const quote = getQuoteById(message.quoteId);
      
      return (
        <View key={message.id} style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
          <View style={[styles.quoteMessage, isOwnMessage && styles.ownQuoteMessage]}>
            <View style={styles.quoteHeader}>
              <FileText size={20} color={isOwnMessage ? '#fff' : Colors.primary} />
              <Text style={[styles.quoteTitle, isOwnMessage && styles.ownQuoteTitle]}>
                Devis envoyé
              </Text>
            </View>
            {quote && (
              <>
                <Text style={[styles.quoteText, isOwnMessage && styles.ownQuoteText]}>
                  {quote.title}
                </Text>
                <Text style={[styles.quoteAmount, isOwnMessage && styles.ownQuoteAmount]}>
                  {quote.totalAmount}€
                </Text>
              </>
            )}
            <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <View key={message.id} style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
        <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {message.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
            {isOwnMessage && (
              <View style={styles.readStatus}>
                {message.read ? (
                  <CheckCheck size={16} color="rgba(255, 255, 255, 0.7)" />
                ) : (
                  <Check size={16} color="rgba(255, 255, 255, 0.7)" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  if (!conversationId) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Conversation" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation introuvable</Text>
        </View>
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
          title: "Conversation",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" }
        }} 
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {conversationMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun message pour le moment</Text>
            <Text style={styles.emptySubtext}>Commencez la conversation !</Text>
          </View>
        ) : (
          conversationMessages.map(renderMessage)
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Tapez votre message..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary] as const}
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Send size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    color: Colors.error,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textLight,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readStatus: {
    marginLeft: 4,
  },
  quoteMessage: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    maxWidth: '80%',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ownQuoteMessage: {
    backgroundColor: Colors.primary,
    borderColor: '#fff',
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  ownQuoteTitle: {
    color: '#fff',
  },
  quoteText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  ownQuoteText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quoteAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  ownQuoteAmount: {
    color: '#fff',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});