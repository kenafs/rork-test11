import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { FileText, Download, Eye, Trash2, Send, Check, X } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function QuotesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { quotes, fetchQuotes, deleteQuote, acceptQuote, rejectQuote, isLoading } = useQuotes();
  
  useEffect(() => {
    fetchQuotes();
  }, []);
  
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Devis' }} />
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginSubtitle}>
            Vous devez être connecté pour voir vos devis
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
  
  // Filter quotes based on user type
  const userQuotes = user.userType === 'provider' 
    ? quotes.filter(quote => quote.providerId === user.id)
    : quotes.filter(quote => quote.clientId === user.id);
  
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
            <div class="info-row"><strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}</div>
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
                  <td>
                    <strong>${item.name}</strong>
                    ${item.description ? `<br><small>${item.description}</small>` : ''}
                  </td>
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
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
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
  
  const handleDeleteQuote = (quoteId: string) => {
    Alert.alert(
      'Supprimer le devis',
      'Êtes-vous sûr de vouloir supprimer ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => deleteQuote(quoteId)
        }
      ]
    );
  };
  
  const handleAcceptQuote = (quoteId: string) => {
    Alert.alert(
      'Accepter le devis',
      'Êtes-vous sûr de vouloir accepter ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Accepter', 
          onPress: () => acceptQuote(quoteId)
        }
      ]
    );
  };
  
  const handleRejectQuote = (quoteId: string) => {
    Alert.alert(
      'Refuser le devis',
      'Êtes-vous sûr de vouloir refuser ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser', 
          style: 'destructive',
          onPress: () => rejectQuote(quoteId)
        }
      ]
    );
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      case 'draft': return '#6B7280';
      default: return Colors.textLight;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: user.userType === 'provider' ? 'Mes devis' : 'Devis reçus',
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' }
      }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FileText size={32} color={Colors.primary} />
          <Text style={styles.title}>
            {user.userType === 'provider' ? 'Mes devis' : 'Devis reçus'}
          </Text>
          <Text style={styles.subtitle}>
            {userQuotes.length} devis au total
          </Text>
        </View>
        
        {userQuotes.length > 0 ? (
          userQuotes.map(quote => (
            <View key={quote.id} style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <View style={styles.quoteInfo}>
                  <Text style={styles.quoteTitle}>{quote.title}</Text>
                  <Text style={styles.quoteId}>#{quote.id.slice(-6)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.quoteDescription} numberOfLines={2}>
                {quote.description}
              </Text>
              
              <View style={styles.quoteDetails}>
                <Text style={styles.quoteTotal}>{quote.total.toFixed(2)}€</Text>
                <Text style={styles.quoteDate}>
                  {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              
              <View style={styles.quoteActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => generatePDF(quote)}
                >
                  <Download size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>PDF</Text>
                </TouchableOpacity>
                
                {user.userType === 'client' && quote.status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptQuote(quote.id)}
                    >
                      <Check size={16} color="#fff" />
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>Accepter</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectQuote(quote.id)}
                    >
                      <X size={16} color="#fff" />
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>Refuser</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {user.userType === 'provider' && quote.status === 'draft' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteQuote(quote.id)}
                  >
                    <Trash2 size={16} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              {user.userType === 'provider' ? 'Aucun devis créé' : 'Aucun devis reçu'}
            </Text>
            <Text style={styles.emptyText}>
              {user.userType === 'provider' 
                ? "Vous n'avez pas encore créé de devis. Commencez par répondre à une demande client."
                : "Vous n'avez pas encore reçu de devis. Contactez des prestataires pour en recevoir."
              }
            </Text>
            {user.userType === 'client' && (
              <Button
                title="Rechercher des prestataires"
                onPress={() => router.push('/(tabs)/search')}
                style={styles.searchButton}
              />
            )}
          </View>
        )}
      </ScrollView>
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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  quoteId: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteTotal: {
    fontSize: 24,
    fontWeight: '800',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundAlt,
    gap: 4,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
  searchButton: {
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
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
});