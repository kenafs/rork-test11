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
import { Plus, Trash2, Calculator, FileText, MapPin, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as ExpoCalendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  
  // New fields for enhanced quote
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [eventLocation, setEventLocation] = useState('');
  const [eventDuration, setEventDuration] = useState('4'); // hours
  const [specialRequests, setSpecialRequests] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const animatedScale = useSharedValue(1);
  
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
  
  // Both providers and business establishments can create quotes
  if (!user || (user.userType !== 'provider' && user.userType !== 'business')) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <Stack.Screen options={{ title: 'Créer un devis' }} />
        <Animated.View entering={FadeIn} style={styles.errorContainer}>
          <FileText size={64} color={Colors.textLight} />
          <Text style={[styles.errorTitle, { color: Colors.text }]}>Accès restreint</Text>
          <Text style={[styles.errorText, { color: Colors.textLight }]}>
            Seuls les prestataires et établissements peuvent créer des devis
          </Text>
          <Button 
            title="Retour"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </Animated.View>
      </View>
    );
  }
  
  // Add new item with animation
  const addItem = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    animatedScale.value = withTiming(0.95, { duration: 100 }, () => {
      animatedScale.value = withTiming(1, { duration: 100 });
    });
    
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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };
  
  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(eventDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEventDate(newDate);
    }
  };
  
  // Create calendar event
  const createCalendarEvent = async (quote: any) => {
    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', "L'accès au calendrier est nécessaire pour créer l'événement");
        return;
      }
      
      const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('Erreur', 'Aucun calendrier disponible');
        return;
      }
      
      const eventDetails = {
        title: `📋 ${quote.title}`,
        startDate: new Date(eventDate),
        endDate: new Date(eventDate.getTime() + (parseInt(eventDuration) * 60 * 60 * 1000)),
        location: eventLocation || 'À définir',
        notes: `${quote.description}

Montant: ${quote.total.toFixed(2)}€
Devis #${quote.id.slice(-6)}`,
        calendarId: defaultCalendar.id,
        alarms: [
          { relativeOffset: -24 * 60 }, // 1 day before
          { relativeOffset: -60 }, // 1 hour before
        ],
      };
      
      const eventId = await ExpoCalendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      if (eventId) {
        Alert.alert('Succès', 'Événement ajouté au calendrier');
        return eventId;
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      Alert.alert('Erreur', "Impossible de créer l'événement dans le calendrier");
    }
    return null;
  };
  
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
            .company { color: #1E3A8A; font-size: 24px; font-weight: bold; }
            .quote-title { font-size: 20px; margin: 20px 0; }
            .info-section { margin: 20px 0; }
            .info-row { margin: 5px 0; }
            .event-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total-section { margin-top: 20px; text-align: right; }
            .total-row { margin: 5px 0; }
            .total-final { font-size: 18px; font-weight: bold; color: #1E3A8A; }
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
          
          <div class="event-details">
            <h3>📅 Détails de l'événement</h3>
            <div class="info-row"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('fr-FR')} à ${new Date(eventDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div class="info-row"><strong>Lieu:</strong> ${eventLocation || 'À définir'}</div>
            <div class="info-row"><strong>Durée:</strong> ${eventDuration}h</div>
            ${specialRequests ? `<div class="info-row"><strong>Demandes spéciales:</strong> ${specialRequests}</div>` : ''}
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
  
  // Handle submit with enhanced features
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
      
      // Create the quote with enhanced data
      const quote = await createQuote({
        listingId: listing?.id,
        providerId: user.id,
        clientId: targetUserId,
        title,
        description,
        items,
        status: 'pending',
        validUntil,
        eventDate: eventDate.getTime(),
        eventLocation: eventLocation || undefined,
        eventDuration: parseInt(eventDuration),
        specialRequests: specialRequests || undefined,
      });
      
      console.log('Quote created successfully:', quote);
      
      // Send the quote immediately
      await sendQuote(quote.id);
      
      // Send message to the RECIPIENT
      try {
        let conversation = getConversationByParticipant(targetUserId);
        let conversationId: string;
        
        if (!conversation) {
          console.log('Creating new conversation for quote with user:', targetUserId);
          conversationId = await createConversation(targetUserId);
        } else {
          conversationId = conversation.id;
          console.log('Using existing conversation:', conversationId);
        }
        
        // Send quote notification message to the RECIPIENT
        const quoteMessage = `📋 **Nouveau devis reçu**

**${title}**
${description}

📅 **Date de l'événement:** ${new Date(eventDate).toLocaleDateString('fr-FR')} à ${new Date(eventDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
${eventLocation ? `📍 **Lieu:** ${eventLocation}` : ''}
⏱️ **Durée:** ${eventDuration}h
💰 **Montant total:** ${quote.total.toFixed(2)}€ TTC
📅 **Valide jusqu'au:** ${new Date(validUntil).toLocaleDateString('fr-FR')}

Vous pouvez consulter et répondre à ce devis dans la section "Devis".`;

        console.log('Sending quote message to recipient:', targetUserId);
        
        // Send message to targetUserId (recipient), not user.id (sender)
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
            unread: 1,
            timestamp: Date.now(),
          });
        }
        
        console.log('Quote message sent successfully to recipient');
      } catch (messageError) {
        console.error('Error sending quote message:', messageError);
        Alert.alert('Attention', "Devis créé mais impossible d'envoyer la notification. Le devis est disponible dans la section \"Devis\".");
      }
      
      Alert.alert('Succès', 'Devis créé et envoyé avec succès', [
        { 
          text: 'Ajouter au calendrier', 
          onPress: () => createCalendarEvent(quote)
        },
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
  
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animatedScale.value }],
    };
  });
  
  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundAlt }]}>
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
          <Animated.View entering={FadeIn.delay(200)}>
            <BlurView intensity={20} style={styles.header}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <Animated.View entering={ZoomIn.delay(400)} style={styles.headerIcon}>
                    <FileText size={32} color="#fff" />
                  </Animated.View>
                  <Text style={styles.title}>💰 Créer un devis</Text>
                  {listing && (
                    <Text style={styles.subtitle}>Pour: {listing.title}</Text>
                  )}
                  {conversationParticipant && (
                    <Text style={styles.subtitle}>Pour: {conversationParticipant.name}</Text>
                  )}
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
          
          <Animated.View entering={SlideInDown.delay(300)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>📝 Informations générales</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: Colors.text }]}>Titre du devis *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Prestation DJ pour mariage"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: Colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
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
              <Text style={[styles.label, { color: Colors.text }]}>Validité (jours)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                value={validDays}
                onChangeText={setValidDays}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </Animated.View>
          
          {/* Event Details Section */}
          <Animated.View entering={SlideInDown.delay(350)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>📅 Détails de l'événement</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: Colors.text }]}>Date et heure de l'événement</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={[styles.dateTimeButton, { backgroundColor: Colors.surface, borderColor: Colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Clock size={20} color={Colors.primary} />
                  <Text style={[styles.dateTimeText, { color: Colors.text }]}>
                    {eventDate.toLocaleDateString('fr-FR')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.dateTimeButton, { backgroundColor: Colors.surface, borderColor: Colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={Colors.primary} />
                  <Text style={[styles.dateTimeText, { color: Colors.text }]}>
                    {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: Colors.text }]}>Lieu de l'événement</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.primary} />
                <TextInput
                  style={[styles.inputWithIconText, { color: Colors.text }]}
                  value={eventLocation}
                  onChangeText={setEventLocation}
                  placeholder="Adresse ou nom du lieu"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: Colors.text }]}>Durée estimée (heures)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                value={eventDuration}
                onChangeText={setEventDuration}
                placeholder="4"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: Colors.text }]}>Demandes spéciales</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                placeholder="Demandes particulières, contraintes, préférences..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </Animated.View>
          
          <Animated.View entering={SlideInDown.delay(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>📋 Éléments du devis</Text>
              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity style={styles.addButton} onPress={addItem}>
                  <BlurView intensity={80} style={styles.addButtonBlur}>
                    <Plus size={20} color="#fff" />
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            </View>
            
            {items.map((item, index) => (
              <Animated.View
                key={`quote-item-${item.id}`}
                entering={SlideInDown.delay(500 + index * 100)}
              >
                <BlurView intensity={10} style={[styles.itemCard, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemNumber, { color: Colors.primary }]}>Élément {index + 1}</Text>
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
                    <Text style={[styles.label, { color: Colors.text }]}>Nom/Description *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                      value={item.name}
                      onChangeText={(value) => updateItem(item.id, 'name', value)}
                      placeholder="Ex: Animation musicale"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: Colors.text }]}>Description détaillée</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                      value={item.description || ''}
                      onChangeText={(value) => updateItem(item.id, 'description', value)}
                      placeholder="Détails supplémentaires (optionnel)"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                  
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Text style={[styles.label, { color: Colors.text }]}>Quantité *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                        value={item.quantity.toString()}
                        onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 1)}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textLight}
                      />
                    </View>
                    
                    <View style={styles.halfWidth}>
                      <Text style={[styles.label, { color: Colors.text }]}>Prix unitaire (€) *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
                        value={item.unitPrice.toString()}
                        onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textLight}
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.totalRow, { borderTopColor: Colors.border }]}>
                    <Text style={[styles.totalLabel, { color: Colors.text }]}>Total:</Text>
                    <Text style={[styles.totalValue, { color: Colors.primary }]}>{(item.total || 0).toFixed(2)}€</Text>
                  </View>
                </BlurView>
              </Animated.View>
            ))}
          </Animated.View>
          
          <Animated.View entering={ZoomIn.delay(600)}>
            <BlurView intensity={20} style={[styles.summaryCard, { borderColor: 'rgba(30, 58, 138, 0.2)' }]}>
              <LinearGradient
                colors={['rgba(30, 58, 138, 0.1)', 'rgba(59, 130, 246, 0.1)']}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryRow}>
                  <Calculator size={24} color={Colors.primary} />
                  <Text style={[styles.summaryTitle, { color: Colors.text }]}>Total du devis</Text>
                </View>
                <Text style={[styles.summaryAmount, { color: Colors.primary }]}>{totalAmount.toFixed(2)}€</Text>
                <Text style={[styles.summaryNote, { color: Colors.textLight }]}>
                  Valide pendant {validDays} jours
                </Text>
                <Text style={[styles.summaryEventInfo, { color: Colors.textLight }]}>
                  📅 {eventDate.toLocaleDateString('fr-FR')} • ⏱️ {eventDuration}h
                </Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </ScrollView>
        
        <Animated.View entering={SlideInDown.delay(800)}>
          <BlurView intensity={80} style={[styles.footer, { borderTopColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Button
              title="📤 Envoyer le devis"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
      
      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={eventDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 20,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonBlur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWithIconText: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    fontSize: 16,
  },
  itemCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  summaryNote: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryEventInfo: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: '#FF385C',
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#9E9E9E',
  },
});