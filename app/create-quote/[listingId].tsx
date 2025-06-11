import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import { useMessages } from '@/hooks/useMessages';
import { useListings } from '@/hooks/useListings';
import { QuoteItem } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Plus, Trash2, FileText, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateQuoteScreen() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { createQuote, isLoading } = useQuotes();
  const { sendQuoteMessage, createConversation } = useMessages();
  const { getListingById } = useListings();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', name: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  const [validUntil, setValidUntil] = useState('');
  
  const listing = listingId ? getListingById(listingId) : null;
  
  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer un devis.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    
    if (user.userType !== 'provider') {
      Alert.alert(
        'Accès refusé',
        'Seuls les prestataires peuvent créer des devis.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    
    if (!listing) {
      Alert.alert(
        'Annonce introuvable',
        'L\'annonce pour laquelle vous souhaitez créer un devis n\'existe pas.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    
    // Set default title based on listing
    if (listing) {
      setTitle(`Devis pour: ${listing.title}`);
    }
    
    // Set default valid until date (30 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setValidUntil(defaultDate.toISOString().split('T')[0]);
  }, [isAuthenticated, user, listing]);
  
  if (!isAuthenticated || !user || user.userType !== 'provider' || !listing) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Créer un devis" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Impossible d'accéder à cette page</Text>
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
        
        // Recalculate total price when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  // Calculate total amount
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre devis.');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description pour votre devis.');
      return;
    }
    
    if (!validUntil) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date de validité.');
      return;
    }
    
    // Check if all items have names and prices
    const invalidItems = items.filter(item => !item.name.trim() || item.unitPrice <= 0);
    if (invalidItems.length > 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les éléments du devis avec un nom et un prix valide.');
      return;
    }
    
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      Alert.alert('Erreur', 'Le montant total du devis doit être supérieur à 0.');
      return;
    }
    
    try {
      console.log('Creating quote for listing:', listing.id);
      console.log('Client ID:', listing.createdBy);
      console.log('Provider ID:', user.id);
      
      // Create the quote
      const newQuote = await createQuote({
        listingId: listing.id,
        clientId: listing.createdBy,
        providerId: user.id,
        title: title.trim(),
        description: description.trim(),
        totalAmount,
        validUntil: new Date(validUntil).getTime(),
        status: 'pending',
        currency: 'EUR',
        items: items.map(item => ({
          ...item,
          name: item.name.trim(),
          description: item.description?.trim() || '',
        })),
      });
      
      console.log('Quote created successfully:', newQuote);
      
      // Create or get conversation with the client
      const conversationId = await createConversation(
        listing.createdBy,
        undefined, // No initial text message
        listing.id
      );
      
      console.log('Conversation created/found:', conversationId);
      
      // Send the quote as a message
      await sendQuoteMessage(conversationId, newQuote, listing.createdBy);
      
      console.log('Quote message sent successfully');
      
      Alert.alert(
        'Devis envoyé !',
        'Votre devis a été créé et envoyé au client avec succès.',
        [
          {
            text: 'Voir la conversation',
            onPress: () => {
              router.replace(`/conversation/${conversationId}`);
            },
          },
          {
            text: 'Retour',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating quote:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du devis. Veuillez réessayer.');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Créer un devis",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" }
        }} 
      />
      
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <FileText size={32} color="#fff" />
          <Text style={styles.headerTitle}>✨ Créer un devis</Text>
          <Text style={styles.headerSubtitle}>
            Pour: {listing.title}
          </Text>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>📋 Titre du devis *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Prestation DJ pour mariage"
              maxLength={100}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>📝 Description *</Text>
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
            <Text style={styles.label}>📅 Valide jusqu'au *</Text>
            <TextInput
              style={styles.input}
              value={validUntil}
              onChangeText={setValidUntil}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.helperText}>
              💡 Format: AAAA-MM-JJ (ex: 2024-12-31)
            </Text>
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.itemsHeader}>
              <Text style={styles.label}>💰 Éléments du devis *</Text>
              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Plus size={20} color={Colors.primary} />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
            
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Élément {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={styles.itemInput}
                  value={item.name}
                  onChangeText={(value) => updateItem(item.id, 'name', value)}
                  placeholder="Nom de l'élément *"
                  placeholderTextColor={Colors.textLight}
                />
                
                <TextInput
                  style={[styles.itemInput, styles.itemDescription]}
                  value={item.description}
                  onChangeText={(value) => updateItem(item.id, 'description', value)}
                  placeholder="Description (optionnel)"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.textLight}
                />
                
                <View style={styles.itemRow}>
                  <View style={styles.itemQuantity}>
                    <Text style={styles.itemLabel}>Quantité</Text>
                    <TextInput
                      style={styles.itemInput}
                      value={item.quantity.toString()}
                      onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 1)}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                  
                  <View style={styles.itemPrice}>
                    <Text style={styles.itemLabel}>Prix unitaire (€)</Text>
                    <TextInput
                      style={styles.itemInput}
                      value={item.unitPrice.toString()}
                      onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                  
                  <View style={styles.itemTotal}>
                    <Text style={styles.itemLabel}>Total</Text>
                    <Text style={styles.itemTotalText}>{item.totalPrice.toFixed(2)}€</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total du devis:</Text>
              <Text style={styles.totalAmount}>{calculateTotal().toFixed(2)}€</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary] as const}
          style={styles.submitGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer le devis'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
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
    color: Colors.error,
    textAlign: 'center',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    marginBottom: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    fontWeight: '500',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
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
    padding: 4,
  },
  itemInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  itemDescription: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  itemQuantity: {
    flex: 1,
  },
  itemPrice: {
    flex: 2,
  },
  itemTotal: {
    flex: 1,
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  totalSection: {
    backgroundColor: 'rgba(10, 36, 99, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
  },
  submitGradient: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
});