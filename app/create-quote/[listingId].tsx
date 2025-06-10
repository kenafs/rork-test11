import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import { useMessages } from '@/hooks/useMessages';
import { mockListings } from '@/mocks/listings';
import { mockProviders, mockVenues } from '@/mocks/users';
import { QuoteItem } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Plus, Trash2, Calculator, Send, FileText } from 'lucide-react-native';

export default function CreateQuoteScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { createQuote, isLoading } = useQuotes();
  const { addContact, createConversation } = useMessages();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }
  ]);
  const [validDays, setValidDays] = useState('30');
  
  // Find the listing or handle conversation quotes
  const listing = listingId?.startsWith('conversation-') 
    ? null 
    : mockListings.find(l => l.id === listingId);
  
  // Get conversation participant if it's a conversation quote
  const conversationId = listingId?.startsWith('conversation-') 
    ? listingId.replace('conversation-', '') 
    : null;
  const allUsers = [...mockProviders, ...mockVenues];
  const conversationParticipant = conversationId ? allUsers.find(u => u.id === conversationId) : null;
  
  // Only providers can create quotes, not business accounts or clients
  if (!user || user.userType !== 'provider') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Créer un devis' }} />
        <View style={styles.errorContainer}>
          <FileText size={64} color={Colors.textLight} />
          <Text style={styles.errorTitle}>Accès restreint</Text>
          <Text style={styles.errorText}>
            {user?.userType === 'business' 
              ? 'Les établissements ne peuvent pas créer de devis. Seuls les prestataires peuvent proposer des devis.'
              : 'Seuls les prestataires peuvent créer des devis'
            }
          </Text>
          <Button 
            title="Retour"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }
  
  // Add new item
  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };
  
  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  // Update item
  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Handle submit
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour le devis');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }
    
    if (items.some(item => !item.name.trim() || item.unitPrice <= 0)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les éléments du devis');
      return;
    }
    
    try {
      const validUntil = Date.now() + (parseInt(validDays) * 24 * 60 * 60 * 1000);
      
      const quote = await createQuote({
        listingId: listing?.id,
        providerId: user.id,
        clientId: listing?.createdBy || conversationParticipant?.id || 'unknown',
        title,
        description,
        items,
        totalAmount,
        status: 'pending',
        validUntil,
      });
      
      console.log('Quote created successfully:', quote);
      
      // Create or get conversation and send quote message
      const clientId = listing?.createdBy || conversationParticipant?.id;
      if (clientId) {
        try {
          const conversationId = await createConversation(clientId);
          
          // Add quote message to conversation
          const quoteMessage = `📋 Devis envoyé: ${title}\n💰 Montant: ${totalAmount.toFixed(2)}€\n📅 Valide jusqu'au: ${new Date(validUntil).toLocaleDateString('fr-FR')}`;
          
          // Add contact with quote message
          const targetUser = allUsers.find(u => u.id === clientId) || 
                            (listing ? { id: listing.createdBy, name: listing.creatorName, profileImage: listing.creatorImage, userType: listing.creatorType } : null);
          
          if (targetUser) {
            addContact({
              participantId: clientId,
              participantName: targetUser.name,
              participantImage: targetUser.profileImage,
              participantType: targetUser.userType === 'provider' ? 'provider' : 
                             targetUser.userType === 'business' ? 'business' : 'client',
              lastMessage: quoteMessage,
              unread: 0,
              timestamp: Date.now(),
            });
          }
          
          console.log('Quote message sent to conversation');
        } catch (messageError) {
          console.error('Error sending quote message:', messageError);
        }
      }
      
      Alert.alert('Succès', 'Devis créé et envoyé avec succès', [
        { 
          text: 'Voir les messages', 
          onPress: () => router.replace('/(tabs)/messages') 
        }
      ]);
    } catch (error) {
      console.error('Error creating quote:', error);
      Alert.alert('Erreur', 'Impossible de créer le devis');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Créer un devis',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <FileText size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>💰 Créer un devis</Text>
          {listing && (
            <Text style={styles.subtitle}>Pour: {listing.title}</Text>
          )}
          {conversationParticipant && (
            <Text style={styles.subtitle}>Pour: {conversationParticipant.name}</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Informations générales</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Titre du devis *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Prestation DJ pour mariage"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre prestation en détail..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Validité (jours)</Text>
            <TextInput
              style={styles.input}
              value={validDays}
              onChangeText={setValidDays}
              placeholder="30"
              keyboardType="numeric"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Éléments du devis</Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Élément {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(value) => updateItem(item.id, 'name', value)}
                  placeholder="Ex: Animation musicale"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={item.description}
                  onChangeText={(value) => updateItem(item.id, 'description', value)}
                  placeholder="Détails optionnels"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Quantité *</Text>
                  <TextInput
                    style={styles.input}
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 1)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Prix unitaire (€) *</Text>
                  <TextInput
                    style={styles.input}
                    value={item.unitPrice.toString()}
                    onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{item.totalPrice.toFixed(2)}€</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Calculator size={24} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Total du devis</Text>
          </View>
          <Text style={styles.summaryAmount}>{totalAmount.toFixed(2)}€</Text>
          <Text style={styles.summaryNote}>
            Valide pendant {validDays} jours
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="📤 Envoyer le devis"
          onPress={handleSubmit}
          loading={isLoading}
          fullWidth
          style={styles.submitButton}
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
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  removeButton: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  summaryNote: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: Colors.textLight,
  },
});