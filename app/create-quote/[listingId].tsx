import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import { useMessages } from '@/hooks/useMessages';
import { useListings } from '@/hooks/useListings';
import { mockProviders, mockVenues } from '@/mocks/users';
import { QuoteItem } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Plus, Trash2, Calculator, FileText } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function CreateQuoteScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { createQuote, sendQuote, isLoading } = useQuotes();
  const { addContact, sendMessage, getConversationByParticipant, createConversation } = useMessages();
  const { getListingById } = useListings();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
  ]);
  const [validDays, setValidDays] = useState('30');
  
  // Find the listing or handle conversation quotes
  const listing = listingId?.startsWith('conversation-') 
    ? null 
    : getListingById(listingId as string);
  
  // Get conversation participant if it's a conversation quote
  const conversationId = listingId?.startsWith('conversation-') 
    ? listingId.replace('conversation-', '') 
    : null;
  const allUsers = [...mockProviders, ...mockVenues];
  const conversationParticipant = conversationId ? allUsers.find(u => u.id === conversationId) : null;
  
  // FIXED: Both providers and business establishments can create quotes
  if (!user || (user.userType !== 'provider' && user.userType !== 'business')) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Créer un devis' }} />
        <View style={styles.errorContainer}>
          <FileText size={64} color={Colors.textLight} />
          <Text style={styles.errorTitle}>Accès restreint</Text>
          <Text style={styles.errorText}>
            Seuls les prestataires et établissements peuvent créer des devis
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
      id: `item-${Date.now()}-${Math.random()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
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
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);
  
  // Generate PDF
  const generatePDF = async (quote: any) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Devis ${quote.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { color: #6366f1; font-size: 24px; font-weight: bold; }
            .quote-title { font-size: 20px; margin: 20px 0; }
            .info-section { margin: 20px 0; }
            .info-row { margin: 5px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total-section { margin-top: 20px; text-align: right; }
            .total-row { margin: 5px 0; }
            .total-final { font-size: 18px; font-weight: bold; color: #6366f1; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">EventApp</div>
            <h1 class="quote-title">Devis #${quote.id.slice(-6)}</h1>
          </div>
          
          <div class="info-section">
            <div class="info-row"><strong>Prestataire:</strong> ${user.name}</div>
            <div class="info-row"><strong>Email:</strong> ${user.email}</div>
            <div class="info-row"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
            <div class="info-row"><strong>Valide jusqu'au:</strong> ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</div>
          </div>
          
          <div class="info-section">
            <h3>${quote.title}</h3>
            <p>${quote.description}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map((item: QuoteItem) => `
                <tr>
                  <td>${item.name || item.description || ''}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice.toFixed(2)}€</td>
                  <td>${item.total.toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">Sous-total: ${quote.subtotal.toFixed(2)}€</div>
            <div class="total-row">TVA (20%): ${quote.tax.toFixed(2)}€</div>
            <div class="total-row total-final">Total TTC: ${quote.total.toFixed(2)}€</div>
          </div>
          
          <div class="footer">
            <p>Devis généré par EventApp - ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </body>
        </html>
      `;
      
      const result = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      if (result && result.uri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Devis ${quote.id.slice(-6)}`
        });
      } else {
        Alert.alert('Succès', 'PDF généré avec succès');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };
  
  // CRITICAL FIX: Handle submit with correct message recipient
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
      
      // Determine the target user ID (recipient of the quote)
      const targetUserId = listing?.createdBy || conversationParticipant?.id;
      
      if (!targetUserId) {
        Alert.alert('Erreur', 'Impossible de déterminer le destinataire du devis');
        return;
      }
      
      // Create the quote
      const quote = await createQuote({
        listingId: listing?.id,
        providerId: user.id,
        clientId: targetUserId,
        title,
        description,
        items,
        status: 'pending',
        validUntil,
      });
      
      console.log('Quote created successfully:', quote);
      
      // Send the quote immediately
      await sendQuote(quote.id);
      
      // CRITICAL FIX: Send message to the RECIPIENT (targetUserId), not the sender
      try {
        // Get or create conversation with the target user
        let conversation = getConversationByParticipant(targetUserId);
        let conversationId: string;
        
        if (!conversation) {
          console.log('Creating new conversation for quote with user:', targetUserId);
          conversationId = await createConversation(targetUserId);
        } else {
          conversationId = conversation.id;
          console.log('Using existing conversation:', conversationId);
        }
        
        // CRITICAL FIX: Send quote notification message to the RECIPIENT
        const quoteMessage = `📋 **Nouveau devis reçu**

**${title}**
${description}

💰 **Montant total:** ${quote.total.toFixed(2)}€ TTC
📅 **Valide jusqu'au:** ${new Date(validUntil).toLocaleDateString('fr-FR')}

Vous pouvez consulter et répondre à ce devis dans la section "Devis".`;

        console.log('Sending quote message to recipient:', targetUserId);
        
        // CRITICAL FIX: Send message to targetUserId (recipient), not user.id (sender)
        await sendMessage(conversationId, quoteMessage, targetUserId);
        
        // Update contact with quote info for the RECIPIENT
        const targetUser = allUsers.find(u => u.id === targetUserId);
        if (targetUser) {
          addContact({
            participantId: targetUserId,
            participantName: targetUser.name,
            participantImage: targetUser.profileImage,
            participantType: targetUser.userType === 'provider' ? 'provider' : 
                            targetUser.userType === 'business' ? 'business' : 'client',
            lastMessage: `📋 Devis reçu: ${title} - ${quote.total.toFixed(2)}€`,
            unread: 1, // FIXED: Set unread to 1 for recipient
            timestamp: Date.now(),
          });
        }
        
        console.log('Quote message sent successfully to recipient');
      } catch (messageError) {
        console.error('Error sending quote message:', messageError);
        // Don't fail the whole process if message sending fails
        Alert.alert('Attention', 'Devis créé mais impossible d\'envoyer la notification. Le devis est disponible dans la section "Devis".');
      }
      
      Alert.alert('Succès', 'Devis créé et envoyé avec succès', [
        { 
          text: 'Générer PDF', 
          onPress: () => generatePDF(quote)
        },
        { 
          text: 'Voir les devis', 
          onPress: () => router.push('/quotes') 
        },
        { 
          text: 'Retour aux messages', 
          onPress: () => router.push('/(tabs)/messages') 
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
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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
              <View key={`quote-item-${item.id}`} style={styles.itemCard}>
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
                  <Text style={styles.label}>Nom/Description *</Text>
                  <TextInput
                    style={styles.input}
                    value={item.name}
                    onChangeText={(value) => updateItem(item.id, 'name', value)}
                    placeholder="Ex: Animation musicale"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description détaillée</Text>
                  <TextInput
                    style={styles.input}
                    value={item.description || ''}
                    onChangeText={(value) => updateItem(item.id, 'description', value)}
                    placeholder="Détails supplémentaires (optionnel)"
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
                  <Text style={styles.totalValue}>{(item.total || 0).toFixed(2)}€</Text>
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  keyboardContainer: {
    flex: 1,
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
    paddingBottom: 120, // Extra space for submit button
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
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
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