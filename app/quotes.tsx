import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import QuotePreview from '@/components/QuotePreview';
import { FileText, Calendar, Euro, CheckCircle, XCircle, Clock, Eye, CreditCard, CheckSquare, X } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function QuotesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getQuotesForUser, acceptQuote, rejectQuote, payQuote, completeQuote, fetchQuotes } = useQuotes();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    fetchQuotes();
  }, []);
  
  // CRITICAL FIX: Get quotes based on user type and handle all user types properly
  const userQuotes = user ? getQuotesForUser(user.id) : [];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      case 'draft': return '#6B7280';
      case 'paid': return '#8B5CF6';
      case 'completed': return '#059669';
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
      default: return FileText;
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
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

  const handlePayQuote = async (quoteId: string) => {
    Alert.alert(
      'Payer le devis',
      'Confirmer le paiement de ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Payer', 
          onPress: async () => {
            try {
              await payQuote(quoteId);
              Alert.alert('Succès', 'Paiement effectué avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'effectuer le paiement');
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
            try {
              await completeQuote(quoteId);
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
    setSelectedQuote(quote);
    setShowPreview(true);
  };

  // CRITICAL FIX: Improved PDF generation with better error handling
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
            <div class="info-row"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
            <div class="info-row"><strong>Valide jusqu'au:</strong> ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</div>
            <div class="info-row"><strong>Statut:</strong> ${getStatusText(quote.status)}</div>
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
              ${quote.items.map((item: any) => `
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
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Devis" }} />
        <View style={styles.loginPrompt}>
          <FileText size={64} color={Colors.textLight} />
          <Text style={styles.loginTitle}>Connectez-vous pour voir vos devis</Text>
          <Text style={styles.loginDescription}>
            Accédez à tous vos devis et gérez vos demandes
          </Text>
          <Button 
            title="Se connecter" 
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
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
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Devis",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{headerText.title}</Text>
          <Text style={styles.headerSubtitle}>{headerText.subtitle}</Text>
        </View>
        
        {userQuotes.length > 0 ? (
          userQuotes.map((quote) => {
            const StatusIcon = getStatusIcon(quote.status);
            
            return (
              <View key={`quotes-screen-${quote.id}`} style={styles.quoteCard}>
                <View style={styles.quoteHeader}>
                  <View style={styles.quoteInfo}>
                    <Text style={styles.quoteTitle}>Devis #{quote.id.slice(-6)}</Text>
                    <Text style={styles.quoteSubtitle}>{quote.title}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
                    <StatusIcon size={16} color="#fff" />
                    <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.quoteDescription} numberOfLines={2}>
                  {quote.description}
                </Text>
                
                <View style={styles.quoteDetails}>
                  <View style={styles.quoteDetailItem}>
                    <Euro size={16} color={Colors.primary} />
                    <Text style={styles.quoteAmount}>{quote.total.toFixed(2)}€</Text>
                  </View>
                  <View style={styles.quoteDetailItem}>
                    <Calendar size={16} color={Colors.textLight} />
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
                    <Eye size={16} color={Colors.primary} />
                    <Text style={styles.viewButtonText}>Voir</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.pdfButton}
                    onPress={() => generatePDF(quote)}
                  >
                    <FileText size={16} color={Colors.primary} />
                    <Text style={styles.pdfButtonText}>PDF</Text>
                  </TouchableOpacity>
                  
                  {/* CRITICAL FIX: Handle business accounts properly - they can be both clients and providers */}
                  {((user.userType === 'client') || 
                    (user.userType === 'business' && quote.clientId === user.id)) && 
                   quote.status === 'pending' && (
                    <>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAcceptQuote(quote.id)}
                      >
                        <CheckCircle size={16} color="#fff" />
                        <Text style={styles.acceptButtonText}>Accepter</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => handleRejectQuote(quote.id)}
                      >
                        <XCircle size={16} color="#fff" />
                        <Text style={styles.rejectButtonText}>Refuser</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {/* Payment button for clients and businesses receiving quotes */}
                  {((user.userType === 'client') || 
                    (user.userType === 'business' && quote.clientId === user.id)) && 
                   quote.status === 'accepted' && (
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={() => handlePayQuote(quote.id)}
                    >
                      <CreditCard size={16} color="#fff" />
                      <Text style={styles.payButtonText}>Payer</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Complete button for providers and businesses sending quotes */}
                  {((user.userType === 'provider') || 
                    (user.userType === 'business' && quote.providerId === user.id)) && 
                   quote.status === 'paid' && (
                    <TouchableOpacity 
                      style={styles.completeButton}
                      onPress={() => handleCompleteQuote(quote.id)}
                    >
                      <CheckSquare size={16} color="#fff" />
                      <Text style={styles.completeButtonText}>Terminer</Text>
                    </TouchableOpacity>
                  )}
                  
                  {quote.status === 'completed' && (
                    <TouchableOpacity 
                      style={styles.reviewButton}
                      onPress={() => router.push(`/reviews?id=${user.userType === 'client' ? quote.providerId : quote.clientId}&type=provider&quoteId=${quote.id}`)}
                    >
                      <CheckSquare size={16} color={Colors.primary} />
                      <Text style={styles.reviewButtonText}>Laisser un avis</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              {user.userType === 'provider' ? 'Aucun devis créé' : 'Aucun devis reçu'}
            </Text>
            <Text style={styles.emptyText}>
              {user.userType === 'provider' 
                ? "Vous n'avez pas encore créé de devis. Créez votre premier devis depuis une conversation ou une annonce."
                : "Vous n'avez pas encore reçu de devis. Contactez des prestataires pour recevoir des propositions."
              }
            </Text>
            {(user.userType === 'provider' || user.userType === 'business') && (
              <Button 
                title="Créer une annonce"
                onPress={() => router.push('/(tabs)/create')}
                style={styles.createButton}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* CRITICAL FIX: Enhanced Quote Preview Modal with better PDF preview functionality */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aperçu du devis</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
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
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quoteInfo: {
    flex: 1,
    marginRight: 12,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  quoteSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  quoteDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  quoteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quoteDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quoteAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  quoteDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  pdfButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
});