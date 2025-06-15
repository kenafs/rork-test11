import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useListings } from '@/hooks/useListings';
import { useQuotes } from '@/hooks/useQuotes';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { QuoteItem } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Plus, Minus, FileText, Send } from 'lucide-react-native';

export default function CreateQuoteScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { getListingById } = useListings();
  const { createQuote, isLoading } = useQuotes();
  const { createConversation, sendMessage } = useMessages();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [validityDays, setValidityDays] = useState('30');
  const [notes, setNotes] = useState('');
  
  const listing = getListingById(listingId as string);
  
  if (!listing) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Annonce non trouvée" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Annonce non trouvée</Text>
          <Button title="Retour" onPress={() => router.back()} />
        </View>
      </View>
    );
  }
  
  if (!user || user.userType !== 'provider') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Accès restreint" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Seuls les prestataires peuvent créer des devis
          </Text>
          <Button title="Retour" onPress={() => router.back()} />
        </View>
      </View>
    );
  }
  
  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };
  
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or unitPrice changed
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour le devis.');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description.');
      return;
    }
    
    if (items.some(item => !item.name || item.name.trim() === '' || !item.description || item.description.trim() === '' || item.unitPrice <= 0)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les éléments du devis.');
      return;
    }
    
    try {
      const subtotal = calculateSubtotal();
      const tax = subtotal * 0.2;
      const total = subtotal + tax;
      
      // Create the quote
      const newQuote = await createQuote({
        title: title.trim(),
        description: description.trim(),
        listingId: listing.id,
        clientId: listing.createdBy,
        clientName: listing.creatorName,
        providerId: user.id,
        providerName: user.name,
        items,
        validityDays: parseInt(validityDays) || 30,
        notes: notes.trim(),
        status: 'pending',
        subtotal,
        tax,
        total,
        validUntil: Date.now() + (parseInt(validityDays) || 30) * 24 * 60 * 60 * 1000,
      });
      
      console.log('Quote created:', newQuote);
      
      // Create or find conversation with the client
      const conversationId = await createConversation(listing.createdBy);
      
      // Send quote message to conversation
      const quoteMessage = `📋 Nouveau devis: ${title}

${description}

Montant total: ${total.toFixed(2)}€ TTC
Validité: ${validityDays} jours

Consultez le devis complet dans vos messages.`;
      
      await sendMessage(conversationId, quoteMessage, listing.createdBy);
      
      console.log('Quote message sent to conversation:', conversationId);
      
      Alert.alert(
        'Devis créé',
        'Votre devis a été créé avec succès et envoyé au client.',
        [
          {
            text: 'Voir la conversation',
            onPress: () => router.push(`/conversation/${listing.createdBy}`)
          },
          {
            text: 'Mes devis',
            onPress: () => router.push('/quotes')
          }
        ]
      );
      
    } catch (error) {
      console.error('Error creating quote:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du devis.');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Créer un devis",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Listing Info */}
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingClient}>Client: {listing.creatorName}</Text>
        </View>
        
        {/* Quote Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>📋 Informations du devis</Text>
          
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
        </View>
        
        {/* Quote Items */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 Détail du devis</Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {items.map((item, index) => (
            <View key={`quote-item-${item.id}`} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Élément {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Minus size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Nom de l'élément *</Text>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(value) => updateItem(item.id, 'name', value)}
                  placeholder="Ex: Prestation DJ"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Description *</Text>
                <TextInput
                  style={styles.input}
                  value={item.description}
                  onChangeText={(value) => updateItem(item.id, 'description', value)}
                  placeholder="Description détaillée de l'élément"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.itemRow}>
                <View style={styles.itemField}>
                  <Text style={styles.fieldLabel}>Quantité</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 1)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                
                <View style={styles.itemField}>
                  <Text style={styles.fieldLabel}>Prix unitaire (€)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={item.unitPrice.toString()}
                    onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                
                <View style={styles.itemField}>
                  <Text style={styles.fieldLabel}>Total (€)</Text>
                  <Text style={styles.totalText}>{item.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
          
          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT:</Text>
              <Text style={styles.totalValue}>{calculateSubtotal().toFixed(2)}€</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA (20%):</Text>
              <Text style={styles.totalValue}>{(calculateSubtotal() * 0.2).toFixed(2)}€</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total TTC:</Text>
              <Text style={styles.finalTotalValue}>{(calculateSubtotal() * 1.2).toFixed(2)}€</Text>
            </View>
          </View>
        </View>
        
        {/* Additional Info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>ℹ️ Informations complémentaires</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Validité du devis (jours)</Text>
            <TextInput
              style={styles.input}
              value={validityDays}
              onChangeText={setValidityDays}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Conditions particulières, modalités de paiement..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title={isLoading ? "Création..." : "📤 Envoyer le devis"}
          onPress={handleSubmit}
          disabled={isLoading}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
    marginBottom: 20,
  },
  listingInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  listingClient: {
    fontSize: 14,
    color: Colors.textLight,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundAlt,
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
  itemContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  removeButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  itemField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  totalsContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
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
  },
});