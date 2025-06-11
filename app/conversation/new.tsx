import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { mockProviders, mockVenues } from '@/mocks/users';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Send } from 'lucide-react-native';

export default function NewConversationScreen() {
  const { recipientId } = useLocalSearchParams<{ recipientId: string }>();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { createConversation, addContact } = useMessages();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the recipient
  const allUsers = [...mockProviders, ...mockVenues];
  const recipient = allUsers.find(u => u.id === recipientId);
  
  // Send initial message
  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }
    
    if (!currentUser || !recipient) {
      Alert.alert('Erreur', 'Impossible de créer la conversation');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Creating conversation with recipient:', recipient.id);
      
      // Create conversation and send initial message
      const conversationId = await createConversation(recipient.id, message.trim());
      
      console.log('Conversation created successfully:', conversationId);
      
      // Add contact to the messages store
      addContact({
        participantId: recipient.id,
        participantName: recipient.name,
        participantImage: recipient.profileImage,
        participantType: recipient.userType === 'provider' ? 'provider' : 
                        recipient.userType === 'business' ? 'business' : 'client',
        lastMessage: message.trim(),
        unread: 0,
        timestamp: Date.now(),
      });
      
      // Navigate to the conversation with the participant ID
      router.replace(`/conversation/${recipient.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Erreur', 'Impossible de créer la conversation');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated || !currentUser) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Nouveau message" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vous devez être connecté pour envoyer un message</Text>
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
  
  if (!recipient) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Nouveau message" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Destinataire non trouvé</Text>
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
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Message à ${recipient.name}`,
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{recipient.name}</Text>
          <Text style={styles.recipientType}>
            {recipient.userType === 'provider' ? 'Prestataire' : 
             recipient.userType === 'business' ? 'Établissement' : 'Client'}
          </Text>
        </View>
        
        <View style={styles.messageSection}>
          <Text style={styles.label}>Votre message</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Bonjour, je suis intéressé par vos services..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{message.length}/500</Text>
        </View>
        
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Conseils pour un bon premier message :</Text>
          <Text style={styles.tip}>• Présentez-vous brièvement</Text>
          <Text style={styles.tip}>• Décrivez votre événement</Text>
          <Text style={styles.tip}>• Mentionnez la date souhaitée</Text>
          <Text style={styles.tip}>• Soyez poli et professionnel</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="📤 Envoyer le message"
          onPress={sendMessage}
          loading={isLoading}
          fullWidth
        />
      </View>
    </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  recipientInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipientName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  recipientType: {
    fontSize: 14,
    color: Colors.textLight,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  messageSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  tips: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});