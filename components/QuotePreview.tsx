import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Quote } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { FileText, Calendar, Euro, Download, Share } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface QuotePreviewProps {
  quote: Quote;
  showActions?: boolean;
}

export default function QuotePreview({ quote, showActions = true }: QuotePreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // CRITICAL FIX: Generate PDF with proper HTML content
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Devis ${quote.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #6366f1;
              padding-bottom: 20px;
            }
            .company { 
              color: #6366f1; 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 10px;
            }
            .quote-title { 
              font-size: 22px; 
              margin: 20px 0; 
              color: #333;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              background-color: ${getStatusColor(quote.status)};
            }
            .info-section { 
              margin: 20px 0; 
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
            }
            .info-row { 
              margin: 8px 0; 
              display: flex;
              justify-content: space-between;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .description-section {
              margin: 20px 0;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .items-table th { 
              background-color: #6366f1; 
              color: white;
              font-weight: bold;
            }
            .items-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .total-section { 
              margin-top: 30px; 
              text-align: right; 
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
            }
            .total-row { 
              margin: 8px 0; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-final { 
              font-size: 20px; 
              font-weight: bold; 
              color: #6366f1; 
              border-top: 2px solid #6366f1;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">EventApp</div>
            <h1 class="quote-title">Devis #${quote.id.slice(-6)}</h1>
            <span class="status-badge">${getStatusText(quote.status)}</span>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Date d'émission:</span>
              <span>${new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Valide jusqu'au:</span>
              <span>${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Numéro de devis:</span>
              <span>#${quote.id.slice(-6)}</span>
            </div>
          </div>
          
          <div class="description-section">
            <h3 style="margin-top: 0; color: #6366f1;">${quote.title}</h3>
            <p style="margin-bottom: 0;">${quote.description}</p>
          </div>
          
          <h3 style="color: #6366f1; margin-top: 30px;">Détail des prestations</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40%;">Description</th>
                <th style="width: 15%;">Quantité</th>
                <th style="width: 20%;">Prix unitaire</th>
                <th style="width: 25%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map((item) => `
                <tr>
                  <td>
                    <strong>${item.name || ''}</strong>
                    ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ''}
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${item.unitPrice.toFixed(2)}€</td>
                  <td style="text-align: right; font-weight: bold;">${item.total.toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>${quote.subtotal.toFixed(2)}€</span>
            </div>
            <div class="total-row">
              <span>TVA (20%):</span>
              <span>${quote.tax.toFixed(2)}€</span>
            </div>
            <div class="total-row total-final">
              <span>Total TTC:</span>
              <span>${quote.total.toFixed(2)}€</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EventApp</strong> - Plateforme de mise en relation pour événements</p>
            <p>Devis généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
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
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Partager le devis',
      'Comment souhaitez-vous partager ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Générer PDF', onPress: generatePDF },
        { text: 'Copier le lien', onPress: () => Alert.alert('Info', 'Fonctionnalité à implémenter') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.companyName}>EventApp</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
              <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
            </View>
          </View>
          <Text style={styles.quoteTitle}>Devis #{quote.id.slice(-6)}</Text>
        </View>

        {/* Quote Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.textLight} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.textLight} />
            <Text style={styles.infoLabel}>Valide jusqu'au:</Text>
            <Text style={styles.infoValue}>{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{quote.title}</Text>
          <Text style={styles.description}>{quote.description}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail des prestations</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.quantityColumn]}>Qté</Text>
              <Text style={[styles.tableHeaderText, styles.priceColumn]}>Prix unit.</Text>
              <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
            </View>
            
            {quote.items.map((item, index) => (
              <View key={`quote-item-${index}`} style={styles.tableRow}>
                <View style={styles.descriptionColumn}>
                  <Text style={styles.tableCellText}>
                    {item.name || item.description || ''}
                  </Text>
                  {item.description && item.name && (
                    <Text style={styles.itemSubtext}>{item.description}</Text>
                  )}
                </View>
                <Text style={[styles.tableCellText, styles.quantityColumn]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCellText, styles.priceColumn]}>
                  {item.unitPrice.toFixed(2)}€
                </Text>
                <Text style={[styles.tableCellText, styles.totalColumn, styles.totalCellText]}>
                  {item.total.toFixed(2)}€
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.section}>
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Devis généré par EventApp - {new Date().toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </ScrollView>

      {/* CRITICAL FIX: Action buttons for PDF generation and sharing */}
      {showActions && (
        <View style={styles.actionContainer}>
          <Button
            title="📄 Générer PDF"
            onPress={generatePDF}
            loading={isGeneratingPDF}
            style={styles.pdfButton}
            variant="outline"
          />
          <Button
            title="📤 Partager"
            onPress={handleShare}
            style={styles.shareButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
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
  quoteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  table: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-start',
  },
  tableCellText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  itemSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  descriptionColumn: {
    flex: 2,
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
  totalCellText: {
    fontWeight: '600',
    color: Colors.primary,
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
  },
  totalValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  finalTotalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  pdfButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
  },
});