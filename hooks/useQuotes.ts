import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, QuoteItem } from '@/types';

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  
  fetchQuotes: () => Promise<void>;
  createQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'tax' | 'total' | 'currency'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  sendQuote: (id: string) => Promise<boolean>;
  acceptQuote: (id: string) => Promise<boolean>;
  rejectQuote: (id: string) => Promise<boolean>;
  payQuote: (id: string) => Promise<boolean>;
  completeQuote: (id: string) => Promise<boolean>;
  getQuoteById: (id: string) => Quote | undefined;
  getQuotesForUser: (userId: string) => Quote[];
  getQuotesByProvider: (providerId: string) => Quote[];
  getQuotesByClient: (clientId: string) => Quote[];
  getUserQuotes: () => Quote[];
  canReview: (quoteId: string) => boolean;
  getCompletedQuotesBetweenUsers: (userId1: string, userId2: string) => Quote[];
  processPayment: (quoteId: string, paymentMethod: string) => Promise<boolean>;
  validatePayment: (quoteId: string) => Promise<boolean>;
  refundPayment: (quoteId: string) => Promise<boolean>;
  initializeDemoQuotes: (clientId: string) => void;
}

// DEMO QUOTES: Create some sample quotes for demo client
const createDemoQuotes = (clientId: string): Quote[] => [
  {
    id: 'quote-demo-1',
    listingId: 'listing-1',
    providerId: 'alex.dubois@djpro.com', // DJ Alex
    clientId: clientId,
    title: 'Animation DJ pour mariage',
    description: 'Prestation DJ complète pour votre mariage avec matériel son et éclairage. Playlist personnalisée selon vos goûts musicaux.',
    items: [
      {
        id: 'item-1',
        name: 'Animation DJ',
        description: 'Animation musicale de 19h à 2h du matin',
        quantity: 1,
        unitPrice: 800,
        total: 800,
      },
      {
        id: 'item-2',
        name: 'Matériel son',
        description: 'Système de sonorisation professionnel',
        quantity: 1,
        unitPrice: 200,
        total: 200,
      },
      {
        id: 'item-3',
        name: 'Éclairage',
        description: 'Éclairage d\'ambiance LED',
        quantity: 1,
        unitPrice: 150,
        total: 150,
      },
    ],
    subtotal: 1150,
    tax: 230,
    total: 1380,
    currency: 'EUR',
    status: 'pending',
    validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    eventDate: Date.now() + (45 * 24 * 60 * 60 * 1000), // 45 days from now
    eventLocation: 'Château de Versailles, Versailles',
    eventDuration: 7,
    specialRequests: 'Playlist avec musique des années 80-90 et hits actuels. Micro sans fil pour les discours.',
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'quote-demo-2',
    listingId: 'listing-2',
    providerId: 'julien@traiteur-moreau.fr', // Traiteur
    clientId: clientId,
    title: 'Traiteur pour événement d\'entreprise',
    description: 'Menu gastronomique français pour 50 personnes avec service complet.',
    items: [
      {
        id: 'item-4',
        name: 'Menu gastronomique',
        description: 'Entrée, plat, dessert par personne',
        quantity: 50,
        unitPrice: 45,
        total: 2250,
      },
      {
        id: 'item-5',
        name: 'Service',
        description: 'Personnel de service pour la soirée',
        quantity: 3,
        unitPrice: 120,
        total: 360,
      },
      {
        id: 'item-6',
        name: 'Matériel',
        description: 'Vaisselle, nappage, décoration',
        quantity: 1,
        unitPrice: 200,
        total: 200,
      },
    ],
    subtotal: 2810,
    tax: 562,
    total: 3372,
    currency: 'EUR',
    status: 'accepted',
    validUntil: Date.now() + (25 * 24 * 60 * 60 * 1000), // 25 days from now
    eventDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    eventLocation: 'Salle de réception Élégance, Paris 16e',
    eventDuration: 4,
    specialRequests: 'Menu végétarien pour 5 personnes. Service à partir de 19h30.',
    createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'quote-demo-3',
    listingId: 'listing-3',
    providerId: 'camille@photo-events.fr', // Photographe
    clientId: clientId,
    title: 'Reportage photo pour mariage',
    description: 'Reportage photo complet de votre mariage avec retouches et album.',
    items: [
      {
        id: 'item-7',
        name: 'Reportage photo',
        description: 'Couverture complète de la journée',
        quantity: 1,
        unitPrice: 800,
        total: 800,
      },
      {
        id: 'item-8',
        name: 'Retouches',
        description: 'Retouche de 100 photos sélectionnées',
        quantity: 1,
        unitPrice: 200,
        total: 200,
      },
      {
        id: 'item-9',
        name: 'Album photo',
        description: 'Album premium 30x30cm, 50 pages',
        quantity: 1,
        unitPrice: 150,
        total: 150,
      },
    ],
    subtotal: 1150,
    tax: 230,
    total: 1380,
    currency: 'EUR',
    status: 'paid',
    validUntil: Date.now() + (20 * 24 * 60 * 60 * 1000), // 20 days from now
    eventDate: Date.now() + (45 * 24 * 60 * 60 * 1000), // Same as DJ quote
    eventLocation: 'Château de Versailles, Versailles',
    eventDuration: 8,
    specialRequests: 'Photos de couple au coucher du soleil. Éviter les photos pendant le repas.',
    paidAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
    createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: 'quote-demo-4',
    listingId: 'listing-4',
    providerId: 'alex.dubois@djpro.com', // DJ Alex again
    clientId: clientId,
    title: 'Animation DJ anniversaire',
    description: 'Animation DJ pour fête d\'anniversaire avec éclairage et sonorisation.',
    items: [
      {
        id: 'item-10',
        name: 'Animation DJ',
        description: 'Animation musicale de 20h à 1h du matin',
        quantity: 1,
        unitPrice: 600,
        total: 600,
      },
      {
        id: 'item-11',
        name: 'Éclairage festif',
        description: 'Éclairage coloré pour ambiance festive',
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
    ],
    subtotal: 700,
    tax: 140,
    total: 840,
    currency: 'EUR',
    status: 'completed',
    validUntil: Date.now() - (5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
    eventDate: Date.now() - (10 * 24 * 60 * 60 * 1000), // Event was 10 days ago
    eventLocation: 'Salle des fêtes, Boulogne',
    eventDuration: 5,
    specialRequests: 'Musique années 2000 et hits actuels.',
    paidAt: Date.now() - (15 * 24 * 60 * 60 * 1000), // Paid 15 days ago
    completedAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // Completed 10 days ago
    createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000), // Created 20 days ago
    updatedAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // Updated 10 days ago
  },
];

export const useQuotes = create<QuotesState>()(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      
      fetchQuotes: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching quotes:', error);
          set({ isLoading: false });
        }
      },
      
      createQuote: async (quoteData) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Calculate totals
          const subtotal = quoteData.items.reduce((sum, item) => sum + item.total, 0);
          const tax = subtotal * 0.2; // 20% VAT
          const total = subtotal + tax;
          
          const newQuote: Quote = {
            ...quoteData,
            id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subtotal,
            tax,
            total,
            currency: 'EUR',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          const currentQuotes = get().quotes || [];
          set({
            quotes: [...currentQuotes, newQuote],
            isLoading: false,
          });
          
          console.log('Quote created successfully:', newQuote);
          return newQuote;
        } catch (error) {
          console.error('Error creating quote:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      updateQuote: async (id: string, updates: Partial<Quote>) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentQuotes = get().quotes || [];
          const updatedQuotes = currentQuotes.map(quote =>
            quote.id === id
              ? { ...quote, ...updates, updatedAt: Date.now() }
              : quote
          );
          
          set({
            quotes: updatedQuotes,
            isLoading: false,
          });
          
          console.log('Quote updated successfully');
          return true;
        } catch (error) {
          console.error('Error updating quote:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      deleteQuote: async (id: string) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentQuotes = get().quotes || [];
          const filteredQuotes = currentQuotes.filter(quote => quote.id !== id);
          
          set({
            quotes: filteredQuotes,
            isLoading: false,
          });
          
          console.log('Quote deleted successfully');
          return true;
        } catch (error) {
          console.error('Error deleting quote:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      sendQuote: async (id: string) => {
        return get().updateQuote(id, { status: 'pending' });
      },
      
      acceptQuote: async (id: string) => {
        return get().updateQuote(id, { status: 'accepted' });
      },
      
      rejectQuote: async (id: string) => {
        return get().updateQuote(id, { status: 'rejected' });
      },
      
      payQuote: async (id: string) => {
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          if (quote.status !== 'accepted') {
            throw new Error('Quote must be accepted before payment');
          }
          
          // Simulate payment processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Process payment
          const paymentSuccess = await get().processPayment(id, 'card');
          
          if (paymentSuccess) {
            return get().updateQuote(id, { 
              status: 'paid',
              paidAt: Date.now()
            });
          } else {
            throw new Error('Payment processing failed');
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          return false;
        }
      },
      
      completeQuote: async (id: string) => {
        return get().updateQuote(id, { 
          status: 'completed',
          completedAt: Date.now()
        });
      },
      
      getQuoteById: (id: string) => {
        const quotes = get().quotes || [];
        return quotes.find(quote => quote.id === id);
      },
      
      getQuotesForUser: (userId: string) => {
        const quotes = get().quotes || [];
        if (!Array.isArray(quotes)) {
          console.warn('Quotes is not an array:', quotes);
          return [];
        }
        return quotes.filter(quote => 
          quote.providerId === userId || quote.clientId === userId
        );
      },
      
      getQuotesByProvider: (providerId: string) => {
        const quotes = get().quotes || [];
        if (!Array.isArray(quotes)) {
          return [];
        }
        return quotes.filter(quote => quote.providerId === providerId);
      },
      
      getQuotesByClient: (clientId: string) => {
        const quotes = get().quotes || [];
        if (!Array.isArray(quotes)) {
          return [];
        }
        return quotes.filter(quote => quote.clientId === clientId);
      },
      
      getUserQuotes: () => {
        const quotes = get().quotes || [];
        if (!Array.isArray(quotes)) {
          return [];
        }
        return quotes;
      },
      
      canReview: (quoteId: string) => {
        const quote = get().getQuoteById(quoteId);
        return quote?.status === 'completed';
      },
      
      getCompletedQuotesBetweenUsers: (userId1: string, userId2: string) => {
        const quotes = get().quotes || [];
        if (!Array.isArray(quotes)) {
          return [];
        }
        return quotes.filter(quote => 
          quote.status === 'completed' &&
          ((quote.providerId === userId1 && quote.clientId === userId2) ||
           (quote.providerId === userId2 && quote.clientId === userId1))
        );
      },
      
      processPayment: async (quoteId: string, paymentMethod: string) => {
        try {
          console.log(`Processing payment for quote ${quoteId} with method ${paymentMethod}`);
          
          // Simulate payment gateway integration
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate payment success (90% success rate)
          const success = Math.random() > 0.1;
          
          if (success) {
            console.log(`Payment successful for quote ${quoteId}`);
            return true;
          } else {
            console.log(`Payment failed for quote ${quoteId}`);
            return false;
          }
        } catch (error) {
          console.error('Payment processing error:', error);
          return false;
        }
      },
      
      validatePayment: async (quoteId: string) => {
        try {
          console.log(`Validating payment for quote ${quoteId}`);
          
          // Simulate payment validation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const quote = get().getQuoteById(quoteId);
          return quote?.status === 'paid' && !!quote.paidAt;
        } catch (error) {
          console.error('Payment validation error:', error);
          return false;
        }
      },
      
      refundPayment: async (quoteId: string) => {
        try {
          console.log(`Processing refund for quote ${quoteId}`);
          
          // Simulate refund processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return get().updateQuote(quoteId, { 
            status: 'refunded',
            refundedAt: Date.now()
          });
        } catch (error) {
          console.error('Refund processing error:', error);
          return false;
        }
      },
      
      // FIXED: Initialize demo quotes for client with consistent ID
      initializeDemoQuotes: (clientId: string) => {
        const currentQuotes = get().quotes || [];
        
        console.log('Initializing demo quotes for client:', clientId);
        const demoQuotes = createDemoQuotes(clientId);
        
        // Check if demo quotes already exist for this client
        const hasExistingDemoQuotes = currentQuotes.some(quote => 
          quote.clientId === clientId && quote.id.startsWith('quote-demo-')
        );
        
        if (!hasExistingDemoQuotes) {
          set({
            quotes: [...currentQuotes, ...demoQuotes],
          });
          console.log('Demo quotes initialized for client:', clientId);
          console.log('Demo quotes created:', demoQuotes);
        } else {
          console.log('Demo quotes already exist for client:', clientId);
        }
      },
    }),
    {
      name: 'quotes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        quotes: Array.isArray(state.quotes) ? state.quotes : [],
      }),
    }
  )
);