import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import QuotePreview from '@/components/QuotePreview';
import { FileText, Euro, CheckCircle, XCircle, Clock, Eye, CreditCard, CheckSquare, X, Sparkles, CalendarPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as ExpoCalendar from 'expo-calendar';

export default function QuotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { getQuotesForUser, acceptQuote, rejectQuote, payQuote, completeQuote, fetchQuotes, processPayment } = useQuotes();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  
  const shimmerValue = useSharedValue(0);
  
  useEffect(() => {
    fetchQuotes();
    
    // Start shimmer animation
    shimmerValue.value = withTiming(1, { duration: 1500 }, () => {
      shimmerValue.value = withTiming(0, { duration: 1500 });
    });
  }, []);
  
  // Get quotes based on user type using correct function
  const userQuotes = user ? getQuotesForUser(user.id) : [];
  
  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-100, 100],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateX }],
    };
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      case 'draft': return '#6B7280';
      case 'paid': return '#8B5CF6';
      case 'completed': return '#059669';
      case 'refunded': return '#EF4444';
      default: return Colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      case 'paid': return 'Payé';
      case 'completed': return 'Terminé';
      case 'refunded': return 'Remboursé';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      case 'draft': return FileText;
      case 'paid': return CreditCard;
      case 'completed': return CheckSquare;
      case 'refunded': return XCircle;
      default: return FileText;
    }
  };

  // Create calendar event for quote
  const createCalendarEvent = async (quote: any) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'L\'accès au calendrier est nécessaire pour créer l\'événement');
        return;
      }
      
      const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('Erreur', 'Aucun calendrier disponible');
        return;
      }
      
      const eventDate = quote.eventDate ? new Date(quote.eventDate) : new Date();
      const eventDuration = quote.eventDuration || 4; // Default 4 hours
      
      const eventDetails = {
        title: `📋 ${quote.title}`,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + (eventDuration * 60 * 60 * 1000)),
        location: quote.eventLocation || 'À définir',
        notes: `${quote.description}

Montant: ${quote.total.toFixed(2)}€
Devis #${quote.id.slice(-6)}

${quote.specialRequests ? `Demandes spéciales: ${quote.specialRequests}` : ''}`,
        calendarId: defaultCalendar.id,
        alarms: [
          { relativeOffset: -24 * 60 }, // 1 day before
          { relativeOffset: -60 }, // 1 hour before
        ],
      };
      
      const eventId = await ExpoCalendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      if (eventId) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Succès', 'Événement ajouté au calendrier');
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'événement dans le calendrier');
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await acceptQuote(quoteId);
      Alert.alert('Succès', 'Devis accepté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accepter le devis');
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    Alert.alert(
      'Refuser le devis',
      'Êtes-vous sûr de vouloir refuser ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser', 
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            
            try {
              await rejectQuote(quoteId);
              Alert.alert('Devis refusé', 'Le devis a été refusé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de refuser le devis');
            }
          }
        }
      ]
    );
  };

  // Enhanced payment processing with better UX and client support
  const handlePayQuote = async (quoteId: string) => {
    Alert.alert(
      'Payer le devis',
      'Confirmer le paiement de ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Payer', 
          onPress: async () => {
            setPaymentLoading(quoteId);
            
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            
            try {
              const success = await payQuote(quoteId);
              
              if (success) {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                Alert.alert('Succès', 'Paiement effectué avec succès');
              } else {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
                Alert.alert('Erreur', 'Le paiement a échoué. Veuillez réessayer.');
              }
            } catch (error) {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              Alert.alert('Erreur', 'Impossible d\'effectuer le paiement');
            } finally {
              setPaymentLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleCompleteQuote = async (quoteId: string) => {
    Alert.alert(
      'Marquer comme terminé',
      'Confirmer que la prestation est terminée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Terminer', 
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            
            try {
              await completeQuote(quoteId);
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert('Succès', 'Prestation marquée comme terminée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de marquer comme terminé');
            }
          }
        }
      ]
    );
  };

  const handleViewQuote = (quote: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedQuote(quote);
    setShowPreview(true);
  };

  const generatePDF = async (quote: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Devis ${quote.id}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 40px;
              background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(30, 58, 138, 0.2);
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #1E3A8A;
              padding-bottom: 30px;
            }
            .company { 
              color: #1E3A8A; 
              font-size: 32px; 
              font-weight: 800; 
              margin-bottom: 10px;
            }
            .quote-title { 
              font-size: 24px; 
              margin: 20px 0; 
              color: #0F172A;
              font-weight: 700;
            }
            .status-badge {
              display: inline-block;
              background: ${getStatusColor(quote.status)};
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-top: 10px;
            }
            .info-section { 
              margin: 30px 0; 
              background: #F8FAFC;
              padding: 20px;
              border-radius: 12px;
            }
            .event-details {
              background: linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
              border-left: 4px solid #1E3A8A;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .info-row { 
              margin: 8px 0; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-label {
              font-weight: 600;
              color: #475569;
            }
            .info-value {
              color: #0F172A;
              font-weight: 500;
            }
            .description-section {
              margin: 30px 0;
              padding: 20px;
              background: linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
              border-radius: 12px;
              border-left: 4px solid #1E3A8A;
            }
            .description-title {
              font-size: 20px;
              font-weight: 700;
              color: #1E3A8A;
              margin-bottom: 15px;
            }
            .description-text {
              color: #475569;
              line-height: 1.6;
              font-size: 16px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .items-table th, .items-table td { 
              padding: 16px; 
              text-align: left; 
              border-bottom: 1px solid #E2E8F0;
            }
            .items-table th { 
              background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
              color: white;
              font-weight: 700;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table tr:nth-child(even) {
              background: #F8FAFC;
            }
            .items-table tr:hover {
              background: #F1F5F9;
            }
            .total-section { 
              margin-top: 40px; 
              text-align: right; 
              background: #F8FAFC;
              padding: 30px;
              border-radius: 12px;
            }
            .total-row { 
              margin: 10px 0; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-label {
              font-size: 16px;
              color: #475569;
              font-weight: 500;
            }
            .total-value {
              font-size: 16px;
              color: #0F172A;
              font-weight: 600;
            }
            .total-final { 
              font-size: 24px; 
              font-weight: 800; 
              color: #1E3A8A; 
              border-top: 2px solid #1E3A8A;
              padding-top: 15px;
              margin-top: 15px;
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              color: #94A3B8; 
              font-size: 14px;
              border-top: 1px solid #E2E8F0;
              padding-top: 20px;
            }
            .watermark {
              position: fixed;
              bottom: 20px;
              right: 20px;
              opacity: 0.1;
              font-size: 48px;
              color: #1E3A8A;
              font-weight: 800;
              transform: rotate(-45deg);
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company">EventApp</div>
              <h1 class="quote-title">Devis #${quote.id.slice(-6)}</h1>
              <div class="status-badge">${getStatusText(quote.status)}</div>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Date d'émission:</span>
                <span class="info-value">${new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valide jusqu'au:</span>
                <span class="info-value">${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Statut:</span>
                <span class="info-value">${getStatusText(quote.status)}</span>
              </div>
            </div>
            
            ${quote.eventDate ? `
            <div class="event-details">
              <h3>📅 Détails de l'événement</h3>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(quote.eventDate).toLocaleDateString('fr-FR')} à ${new Date(quote.eventDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              ${quote.eventLocation ? `<div class="info-row"><span class="info-label">Lieu:</span><span class="info-value">${quote.eventLocation}</span></div>` : ''}
              ${quote.eventDuration ? `<div class="info-row"><span class="info-label">Durée:</span><span class="info-value">${quote.eventDuration}h</span></div>` : ''}
              ${quote.specialRequests ? `<div class="info-row"><span class="info-label">Demandes spéciales:</span><span class="info-value">${quote.specialRequests}</span></div>` : ''}
            </div>
            ` : ''}
            
            <div class="description-section">
              <div class="description-title">${quote.title}</div>
              <div class="description-text">${quote.description}</div>
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
                ${quote.items.map((item: any) => `
                  <tr>
                    <td>
                      <strong>${item.name || ''}</strong>
                      ${item.description ? `<br><small style="color: #64748B;">${item.description}</small>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}€</td>
                    <td><strong>${item.total.toFixed(2)}€</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Sous-total:</span>
                <span class="total-value">${quote.subtotal.toFixed(2)}€</span>
              </div>
              <div class="total-row">
                <span class="total-label">TVA (20%):</span>
                <span class="total-value">${quote.tax.toFixed(2)}€</span>
              </div>
              <div class="total-row total-final">
                <span>Total TTC:</span>
                <span>${quote.total.toFixed(2)}€</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Devis généré par EventApp - ${new Date().toLocaleDateString('fr-FR')}</p>
              <p>Merci de votre confiance</p>
            </div>
          </div>
          <div class="watermark">EventApp</div>
        </body>
        </html>
      `;
      
      console.log('Generating PDF for quote:', quote.id);
      
      const result = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      console.log('PDF generation result:', result);
      
      if (result && result.uri) {
        console.log('PDF generated successfully, checking sharing availability...');
        
        if (await Sharing.isAvailableAsync()) {
          console.log('Sharing is available, opening share dialog...');
          await Sharing.shareAsync(result.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Devis ${quote.id.slice(-6)}`
          });
        } else {
          console.log('Sharing not available, showing success message');
          Alert.alert('PDF généré', `Le PDF du devis ${quote.id.slice(-6)} a été généré avec succès.`);
        }
      } else {
        console.error('PDF generation failed - no URI returned');
        Alert.alert('Erreur', 'Impossible de générer le PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Erreur', `Impossible de générer le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };
  
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ title: "Devis" }} />
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={[styles.loginPromptGradient, { 
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40
          }]}
        >
          <Animated.View entering={FadeIn.delay(200)} style={styles.loginPrompt}>
            <BlurView intensity={20} style={styles.loginPromptCard}>
              <Animated.View entering={ZoomIn.delay(400)}>
                <FileText size={64} color={Colors.primary} />
              </Animated.View>
              <Animated.Text entering={SlideInDown.delay(600)} style={styles.loginTitle}>
                Connectez-vous pour voir vos devis
              </Animated.Text>
              <Animated.Text entering={FadeIn.delay(800)} style={styles.loginDescription}>
                Accédez à tous vos devis et gérez vos demandes
              </Animated.Text>
              <Animated.View entering={SlideInDown.delay(1000)}>
                <Button 
                  title="Se connecter" 
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.loginButton}
                />
              </Animated.View>
            </BlurView>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  const getHeaderText = () => {
    switch (user.userType) {
      case 'provider':
        return {
          title: '📋 Mes devis',
          subtitle: 'Gérez vos devis envoyés'
        };
      case 'business':
        return {
          title: '📋 Mes devis',
          subtitle: 'Gérez vos devis envoyés et reçus'
        };
      case 'client':
        return {
          title: '📋 Devis reçus',
          subtitle: 'Consultez les devis reçus'
        };
      default:
        return {
          title: '📋 Devis',
          subtitle: 'Aucun devis disponible'
        };
    }
  };

  const headerText = getHeaderText();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ 
        title: "Devis",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.scrollContent, { 
          paddingBottom: insets.bottom + 120
        }]}
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.header}
        >
          <BlurView intensity={20} style={styles.headerBlur}>
            <Animated.View entering={FadeIn.delay(200)} style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Sparkles size={24} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>{headerText.title}</Text>
              <Text style={styles.headerSubtitle}>{headerText.subtitle}</Text>
            </Animated.View>
          </BlurView>
        </LinearGradient>
        
        {userQuotes.length > 0 ? (
          userQuotes.map((quote, index) => {
            const StatusIcon = getStatusIcon(quote.status);
            
            return (
              <Animated.View 
                key={`quotes-screen-${quote.id}`} 
                entering={SlideInDown.delay(400 + index * 100)}
                style={styles.quoteCardWrapper}
              >
                <BlurView intensity={10} style={styles.quoteCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.9)']}
                    style={styles.quoteCardGradient}
                  >
                    {/* Shimmer effect for loading states */}
                    {paymentLoading === quote.id && (
                      <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
                        <LinearGradient
                          colors={['transparent', 'rgba(255, 255, 255, 0.8)', 'transparent']}
                          style={styles.shimmerGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </Animated.View>
                    )}
                    
                    <View style={styles.quoteHeader}>
                      <View style={styles.quoteInfo}>
                        <Text style={styles.quoteTitle}>Devis #{quote.id.slice(-6)}</Text>
                        <Text style={styles.quoteSubtitle}>{quote.title}</Text>
                        {quote.eventDate && (
                          <Text style={styles.quoteEventDate}>
                            📅 {new Date(quote.eventDate).toLocaleDateString('fr-FR')}
                            {quote.eventLocation && ` • 📍 ${quote.eventLocation}`}
                          </Text>
                        )}
                      </View>
                      <LinearGradient
                        colors={[getStatusColor(quote.status), `${getStatusColor(quote.status)}CC`]}
                        style={styles.statusBadge}
                      >
                        <StatusIcon size={12} color="#fff" />
                        <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
                      </LinearGradient>
                    </View>
                    
                    <Text style={styles.quoteDescription} numberOfLines={2}>
                      {quote.description}
                    </Text>
                    
                    <View style={styles.quoteDetails}>
                      <View style={styles.quoteDetailItem}>
                        <Euro size={12} color={Colors.primary} />
                        <Text style={styles.quoteAmount}>{quote.total.toFixed(2)}€</Text>
                      </View>
                      <View style={styles.quoteDetailItem}>
                        <Clock size={12} color={Colors.textLight} />
                        <Text style={styles.quoteDate}>
                          {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.quoteActions}>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => handleViewQuote(quote)}
                      >
                        <Eye size={12} color={Colors.primary} />
                        <Text style={styles.viewButtonText}>Voir</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.pdfButton}
                        onPress={() => generatePDF(quote)}
                      >
                        <FileText size={12} color={Colors.primary} />
                        <Text style={styles.pdfButtonText}>PDF</Text>
                      </TouchableOpacity>
                      
                      {/* Calendar button for accepted/paid/completed quotes */}
                      {(quote.status === 'accepted' || quote.status === 'paid' || quote.status === 'completed') && quote.eventDate && (
                        <TouchableOpacity 
                          style={styles.calendarButton}
                          onPress={() => createCalendarEvent(quote)}
                        >
                          <CalendarPlus size={12} color="#10B981" />
                          <Text style={styles.calendarButtonText}>Calendrier</Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Business venues and clients can accept/reject quotes */}
                      {((user.userType === 'client') || 
                        (user.userType === 'business' && quote.clientId === user.id)) && 
                        quote.status === 'pending' && (
                        <>
                          <TouchableOpacity 
                            style={styles.acceptButton}
                            onPress={() => handleAcceptQuote(quote.id)}
                          >
                            <CheckCircle size={12} color="#fff" />
                            <Text style={styles.acceptButtonText}>Accepter</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.rejectButton}
                            onPress={() => handleRejectQuote(quote.id)}
                          >
                            <XCircle size={12} color="#fff" />
                            <Text style={styles.rejectButtonText}>Refuser</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      
                      {/* Enhanced payment button with loading state for clients and business venues */}
                      {((user.userType === 'client') || 
                        (user.userType === 'business' && quote.clientId === user.id)) && 
                        quote.status === 'accepted' && (
                        <TouchableOpacity 
                          style={[styles.payButton, paymentLoading === quote.id && styles.payButtonLoading]}
                          onPress={() => handlePayQuote(quote.id)}
                          disabled={paymentLoading === quote.id}
                        >
                          <CreditCard size={12} color="#fff" />
                          <Text style={styles.payButtonText}>
                            {paymentLoading === quote.id ? 'Traitement...' : 'Payer'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Both providers and business venues can complete quotes */}
                      {((user.userType === 'provider') || 
                        (user.userType === 'business' && quote.providerId === user.id)) && 
                        quote.status === 'paid' && (
                        <TouchableOpacity 
                          style={styles.completeButton}
                          onPress={() => handleCompleteQuote(quote.id)}
                        >
                          <CheckSquare size={12} color="#fff" />
                          <Text style={styles.completeButtonText}>Terminer</Text>
                        </TouchableOpacity>
                      )}
                      
                      {quote.status === 'completed' && (
                        <TouchableOpacity 
                          style={styles.reviewButton}
                          onPress={() => router.push(`/reviews?id=${user.userType === 'client' ? quote.providerId : quote.clientId}&type=provider&quoteId=${quote.id}`)}
                        >
                          <CheckSquare size={12} color={Colors.primary} />
                          <Text style={styles.reviewButtonText}>Laisser un avis</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </LinearGradient>
                </BlurView>
              </Animated.View>
            );
          })
        ) : (
          <Animated.View entering={FadeIn.delay(600)} style={styles.emptyStateWrapper}>
            <BlurView intensity={20} style={styles.emptyState}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.9)']}
                style={styles.emptyStateGradient}
              >
                <Animated.View entering={ZoomIn.delay(800)}>
                  <FileText size={64} color={Colors.textLight} />
                </Animated.View>
                <Animated.Text entering={SlideInDown.delay(1000)} style={styles.emptyTitle}>
                  {user.userType === 'provider' ? 'Aucun devis créé' : 
                   user.userType === 'business' ? 'Aucun devis' : 'Aucun devis reçu'}
                </Animated.Text>
                <Animated.Text entering={FadeIn.delay(1200)} style={styles.emptyText}>
                  {user.userType === 'provider' 
                    ? "Vous n'avez pas encore créé de devis. Créez votre premier devis depuis une conversation ou une annonce."
                    : user.userType === 'business'
                    ? "Vous n'avez pas encore créé ou reçu de devis. En tant qu'établissement, vous pouvez créer des devis et en recevoir."
                    : "Vous n'avez pas encore reçu de devis. Contactez des prestataires pour recevoir des propositions."
                  }
                </Animated.Text>
                {(user.userType === 'provider' || user.userType === 'business') && (
                  <Animated.View entering={SlideInDown.delay(1400)}>
                    <Button 
                      title="Créer une annonce"
                      onPress={() => router.push('/(tabs)/create')}
                      style={styles.createButton}
                    />
                  </Animated.View>
                )}
              </LinearGradient>
            </BlurView>
          </Animated.View>
        )}
      </ScrollView>

      {/* Enhanced Quote Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <BlurView intensity={80} style={styles.modalHeader}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.modalHeaderGradient}
            >
              <Text style={styles.modalTitle}>Aperçu du devis</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPreview(false)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
          {selectedQuote && <QuotePreview quote={selectedQuote} />}
        </View>
      </Modal>
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
    flexGrow: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 12,
  },
  headerBlur: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  quoteCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  quoteCard: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteCardGradient: {
    padding: 14,
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  quoteInfo: {
    flex: 1,
    marginRight: 8,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  quoteSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
    marginBottom: 2,
  },
  quoteEventDate: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  quoteDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 14,
    lineHeight: 16,
  },
  quoteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  quoteDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quoteAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  quoteDate: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  viewButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  pdfButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  calendarButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  payButtonLoading: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  reviewButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyStateWrapper: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  emptyState: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateGradient: {
    alignItems: 'center',
    padding: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginPromptGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    width: '90%',
    maxWidth: 400,
  },
  loginPromptCard: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  loginButton: {
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});