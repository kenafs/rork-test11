import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Quote } from '@/types';
import Colors from '@/constants/colors';
import { FileText, Calendar, Euro } from 'lucide-react-native';

interface QuotePreviewProps {
  quote: Quote;
}

export default function QuotePreview({ quote }: QuotePreviewProps) {
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              <Text style={[styles.tableCellText, styles.descriptionColumn]}>
                {item.name || item.description || ''}
              </Text>
              <Text style={[styles.tableCellText, styles.quantityColumn]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCellText, styles.priceColumn]}>
                {item.unitPrice.toFixed(2)}€
              </Text>
              <Text style={[styles.tableCellText, styles.totalColumn]}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: Colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tableCellText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  descriptionColumn: {
    flex: 2,
    textAlign: 'left',
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
});