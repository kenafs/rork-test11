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
  // FIXED: Add payment processing methods
  processPayment: (quoteId: string, paymentMethod: string) => Promise<boolean>;
  validatePayment: (quoteId: string) => Promise<boolean>;
  refundPayment: (quoteId: string) => Promise<boolean>;
}

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
        // FIXED: Enhanced payment processing with validation
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
      
      // FIXED: Enhanced payment processing methods
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