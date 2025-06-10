import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';
import { User, Provider, Venue } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import RatingStars from '@/components/RatingStars';
import { MapPin, Mail, Phone, Calendar, Edit, Plus, Globe, Instagram, ExternalLink, FileText, LogOut } from 'lucide-react-native';
import { mockListings } from '@/mocks/listings';
import ListingCard from '@/components/ListingCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { getQuotesByUser, getQuotesForUser } = useQuotes();
  
  // Get user's listings
  const userListings = user 
    ? mockListings.filter(listing => listing.createdBy === user.id).slice(0, 3)
    : [];
  
  // Get user's quotes (only for providers)
  const userQuotes = user && user.userType === 'provider' 
    ? getQuotesByUser(user.id).slice(0, 3)
    : [];
  
  // Get quotes received by user (only for clients)
  const receivedQuotes = user && user.userType === 'client'
    ? getQuotesForUser(user.id).slice(0, 3)
    : [];
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Starting logout from profile...');
              await logout();
              console.log('Logout completed, redirecting...');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Force logout even if there's an error
              router.replace('/(auth)/login');
            }
          }
        },
      ]
    );
  };

  // Handle external link
  const handleExternalLink = (url: string) => {
    if (url.startsWith('http')) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://${url}`);
    }
  };

  // Handle Instagram link
  const handleInstagramLink = (username: string) => {
    const cleanUsername = username.replace('@', '');
    Linking.openURL(`https://instagram.com/${cleanUsername}`);
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>Connectez-vous pour accéder à votre profil</Text>
          <Text style={styles.loginDescription}>
            Créez un compte ou connectez-vous pour publier des annonces et contacter des prestataires ou établissements.
          </Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Se connecter" 
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginButton}
            />
            <Button 
              title="S'inscrire" 
              variant="outline"
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerButton}
            />
          </View>
        </View>
      </View>
    );
  }
  
  // Render provider-specific info
  const renderProviderInfo = (provider: Provider) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Services proposés</Text>
      <View style={styles.servicesList}>
        {provider.services && provider.services.length > 0 ? provider.services.map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        )) : (
          <Text style={styles.emptyText}>Aucun service défini</Text>
        )}
      </View>
      
      {provider.priceRange && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tarifs:</Text>
          <Text style={styles.infoValue}>
            {provider.priceRange.min}€ - {provider.priceRange.max}€
          </Text>
        </View>
      )}
      
      {provider.availability && provider.availability.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilité:</Text>
          <Text style={styles.infoValue}>{provider.availability.join(', ')}</Text>
        </View>
      )}
    </View>
  );
  
  // Render venue-specific info
  const renderVenueInfo = (venue: Venue) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Informations sur l'établissement</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Type:</Text>
        <Text style={styles.infoValue}>{venue.venueType || 'Non spécifié'}</Text>
      </View>
      
      {venue.capacity && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Capacité:</Text>
          <Text style={styles.infoValue}>{venue.capacity} personnes</Text>
        </View>
      )}
      
      {venue.amenities && venue.amenities.length > 0 && (
        <View>
          <Text style={styles.infoLabel}>Équipements:</Text>
          <View style={styles.servicesList}>
            {venue.amenities.map((amenity, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // Render social links
  const renderSocialLinks = () => {
    const hasWebsite = user.website;
    const hasInstagram = user.instagram;
    
    if (!hasWebsite && !hasInstagram) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Liens</Text>
        
        {hasWebsite && (
          <TouchableOpacity 
            style={styles.socialLink}
            onPress={() => handleExternalLink(user.website!)}
          >
            <Globe size={20} color={Colors.primary} />
            <Text style={styles.socialLinkText}>{user.website}</Text>
            <ExternalLink size={16} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        
        {hasInstagram && (
          <TouchableOpacity 
            style={styles.socialLink}
            onPress={() => handleInstagramLink(user.instagram!)}
          >
            <Instagram size={20} color="#E4405F" />
            <Text style={styles.socialLinkText}>{user.instagram}</Text>
            <ExternalLink size={16} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render quotes section (only for providers and clients)
  const renderQuotesSection = () => {
    if (user.userType === 'business') return null; // No quotes for business accounts
    
    const quotes = user.userType === 'provider' ? userQuotes : receivedQuotes;
    const sectionTitle = user.userType === 'provider' ? 'Mes devis' : 'Devis reçus';
    const emptyTitle = user.userType === 'provider' ? 'Aucun devis créé' : 'Aucun devis reçu';
    const emptyText = user.userType === 'provider' 
      ? "Vous n'avez pas encore créé de devis."
      : "Vous n'avez pas encore reçu de devis.";
    
    return (
      <View style={styles.listingsSection}>
        <View style={styles.listingsHeader}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Text style={styles.viewAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {quotes.length > 0 ? (
          quotes.map(quote => (
            <TouchableOpacity 
              key={quote.id} 
              style={styles.quoteCard}
              onPress={() => router.push('/(tabs)/messages')}
            >
              <View style={styles.quoteHeader}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.quoteTitle}>Devis #{quote.id.slice(-6)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
                </View>
              </View>
              <Text style={styles.quoteTotal}>{quote.totalAmount}€</Text>
              <Text style={styles.quoteDate}>
                {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyListings}>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        )}
      </View>
    );
  };

  // Helper functions for quote status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return Colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  // Get appropriate action button text based on user type
  const getCreateButtonText = () => {
    switch (user.userType) {
      case 'provider':
        return 'Créer une annonce';
      case 'business':
        return 'Publier une offre';
      default:
        return 'Créer une demande';
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImageText}>{user.name.charAt(0)}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton}>
            <Edit size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>
              {user.userType === 'provider' ? 'Prestataire' : 
               user.userType === 'business' ? 'Établissement' : 'Client'}
            </Text>
          </View>
          
          {user.rating && (
            <View style={styles.ratingContainer}>
              <RatingStars 
                rating={user.rating} 
                reviewCount={user.reviewCount} 
                size="medium"
              />
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <Button 
          title="Modifier le profil" 
          variant="outline"
          onPress={() => router.push('/edit-profile')}
          style={styles.actionButton}
        />
        <Button 
          title={getCreateButtonText()}
          onPress={() => router.push('/(tabs)/create')}
          style={styles.actionButton}
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations de contact</Text>
        
        <View style={styles.contactItem}>
          <Mail size={20} color={Colors.primary} style={styles.contactIcon} />
          <Text style={styles.contactText}>{user.email}</Text>
        </View>
        
        {user.phone && (
          <View style={styles.contactItem}>
            <Phone size={20} color={Colors.primary} style={styles.contactIcon} />
            <Text style={styles.contactText}>{user.phone}</Text>
          </View>
        )}
        
        {user.location && user.location.city && (
          <View style={styles.contactItem}>
            <MapPin size={20} color={Colors.primary} style={styles.contactIcon} />
            <Text style={styles.contactText}>{user.location.city}</Text>
          </View>
        )}
        
        <View style={styles.contactItem}>
          <Calendar size={20} color={Colors.primary} style={styles.contactIcon} />
          <Text style={styles.contactText}>
            Membre depuis {formatDate(user.createdAt)}
          </Text>
        </View>
      </View>

      {renderSocialLinks()}
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {user.description || 'Aucune description disponible.'}
        </Text>
      </View>
      
      {/* Render user type specific information */}
      {user.userType === 'provider' 
        ? renderProviderInfo(user as Provider) 
        : user.userType === 'business' && renderVenueInfo(user as Venue)}
      
      {/* User's listings - only show for providers and businesses */}
      {(user.userType === 'provider' || user.userType === 'business') && (
        <View style={styles.listingsSection}>
          <View style={styles.listingsHeader}>
            <Text style={styles.sectionTitle}>
              {user.userType === 'provider' ? 'Mes annonces' : 'Mes offres'}
            </Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.viewAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {userListings.length > 0 ? (
            userListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <View style={styles.emptyListings}>
              <Text style={styles.emptyTitle}>
                {user.userType === 'provider' ? 'Aucune annonce' : 'Aucune offre'}
              </Text>
              <Text style={styles.emptyText}>
                {user.userType === 'provider' 
                  ? "Vous n'avez pas encore publié d'annonces."
                  : "Vous n'avez pas encore publié d'offres."
                }
              </Text>
              <TouchableOpacity 
                style={styles.createListingButton}
                onPress={() => router.push('/(tabs)/create')}
              >
                <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.createListingText}>{getCreateButtonText()}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Quotes section - only for providers and clients */}
      {renderQuotesSection()}
      
      {/* Logout section */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.error} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  typeContainer: {
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  socialLinkText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 12,
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  serviceTag: {
    backgroundColor: 'rgba(62, 146, 204, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  listingsSection: {
    padding: 16,
    paddingTop: 0,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyListings: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  createListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createListingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  quoteTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  quoteDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '500',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  loginButton: {
    flex: 1,
  },
  registerButton: {
    flex: 1,
  },
});