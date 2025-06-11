import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Send } from 'lucide-react-native';

export default function NewConversationScreen() {
  const router = useRouter();
  const { participantId, listingId } = useLocalSearchParams<{
    participantId: string;
    listingId?: string;
  }>();
  const { user } = useAuth();
  const { createConversation, isLoading } = useMessages();
  
  const [message, setMessage] = useState('');
  
  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message.');
      return;
    }
    
    if (!user || !participantId) {
      Alert.alert('Erreur', 'Informations manquantes pour créer la conversation.');
      return;
    }
    
    try {
      console.log('Creating new conversation with:', { participantId, message, listingId });
      
      const conversationId = await createConversation(
        participantId,
        message.trim(),
        listingId
      );
      
      console.log('Conversation created successfully:', conversationId);
      
      // Navigate to the conversation
      router.replace(`/conversation/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Erreur', 'Impossible de créer la conversation.');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Nouveau message",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <Text style={styles.label}>Votre message</Text>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Tapez votre message ici..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Envoyer le message"
            onPress={handleSendMessage}
            disabled={isLoading || !message.trim()}
            style={styles.sendButton}
            icon={<Send size={20} color="#fff" />}
          />
        </View>
      </View>
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
    padding: 20,
  },
  messageContainer: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});