import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Quote } from '@/types';
import Colors from '@/constants/colors';
import { FileText, Calendar, Euro, Download, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

interface QuotePreviewProps {
  quote: Quote;
  showActions?: boolean;
}

export default function QuotePreview({ quote, showActions = true }: QuotePreviewProps) {
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

  const generatePDF = async () => {
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.companyName}>EventApp</Text>
            <LinearGradient
              colors={[getStatusColor(quote.status), `${getStatusColor(quote.status)}CC`]}
              style={styles.statusBadge}
            >
              <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.quoteTitle}>Devis #{quote.id.slice(-6)}</Text>
        </LinearGradient>

        {/* Quote Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Valide jusqu'au:</Text>
            <Text style={styles.infoValue}>{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        {/* Description */}
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.05)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.descriptionSection}
        >
          <Text style={styles.sectionTitle}>{quote.title}</Text>
          <Text style={styles.description}>{quote.description}</Text>
        </LinearGradient>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail des prestations</Text>
          <View style={styles.table}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.tableHeader}
            >
              <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.quantityColumn]}>Qté</Text>
              <Text style={[styles.tableHeaderText, styles.priceColumn]}>Prix unit.</Text>
              <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
            </LinearGradient>
            
            {quote.items.map((item, index) => (
              <View key={`quote-item-${index}`} style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
              ]}>
                <View style={styles.descriptionColumn}>
                  <Text style={styles.tableCellTextBold}>
                    {item.name || item.description || ''}
                  </Text>
                  {item.description && item.name && (
                    <Text style={styles.tableCellTextSmall}>{item.description}</Text>
                  )}
                </View>
                <Text style={[styles.tableCellText, styles.quantityColumn]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCellText, styles.priceColumn]}>
                  {item.unitPrice.toFixed(2)}€
                </Text>
                <Text style={[styles.tableCellTextBold, styles.totalColumn]}>
                  {item.total.toFixed(2)}€
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.05)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.totalsSection}
        >
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total:</Text>
              <Text style={styles.totalValue}>{quote.subtotal.toFixed(2)}€</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA (20%):</Text>
              <Text style={styles.totalValue}>{quote.tax.toFixed(2)}€</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>Total TTC:</Text>
              <Text style={styles.finalTotalValue}>{quote.total.toFixed(2)}€</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Devis généré par EventApp - {new Date().toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.footerSubText}>
            Merci de votre confiance
          </Text>
        </View>
      </ScrollView>

      {/* PDF download button */}
      {showActions && (
        <LinearGradient
          colors={['rgba(248, 250, 252, 0.95)', '#FFFFFF']}
          style={styles.actionContainer}
        >
          <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
            <Download size={20} color="#fff" />
            <Text style={styles.pdfButtonText}>Télécharger PDF</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  descriptionSection: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  totalsSection: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowEven: {
    backgroundColor: '#fff',
  },
  tableRowOdd: {
    backgroundColor: Colors.surfaceElevated,
  },
  tableCellText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  tableCellTextBold: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableCellTextSmall: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  descriptionColumn: {
    flex: 2,
    alignItems: 'flex-start',
  },
  quantityColumn: {
    flex: 1,
  },
  priceColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 1,
  },
  totalsContainer: {
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    minWidth: 200,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  finalTotalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    paddingTop: 12,
    marginTop: 12,
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});