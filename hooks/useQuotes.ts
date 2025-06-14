import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, QuoteItem } from '@/types';

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  
  fetchQuotes: () => Promise<void>;
  createQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'currency' | 'subtotal' | 'tax' | 'total'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  sendQuote: (id: string) => Promise<boolean>;
  acceptQuote: (id: string) => Promise<boolean>;
  rejectQuote: (id: string) => Promise<boolean>;
  getQuoteById: (id: string) => Quote | undefined;
  getQuotesByProvider: (providerId: string) => Quote[];
  getQuotesByClient: (clientId: string) => Quote[];
}

export const useQuotes = create<QuotesState>()(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      
      fetchQuotes: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching quotes:', error);
          set({ isLoading: false });
        }
      },
      
      createQuote: async (quoteData) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set(state => ({
            quotes: [...state.quotes, newQuote],
            isLoading: false,
          }));
          
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
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            quotes: state.quotes.map(quote =>
              quote.id === id 
                ? { ...quote, ...updates, updatedAt: Date.now() }
                : quote
            ),
            isLoading: false,
          }));
          
          console.log('Quote updated successfully:', id);
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
          
          set(state => ({
            quotes: state.quotes.filter(quote => quote.id !== id),
            isLoading: false,
          }));
          
          console.log('Quote deleted successfully:', id);
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
      
      getQuoteById: (id: string) => {
        return get().quotes.find(quote => quote.id === id);
      },
      
      getQuotesByProvider: (providerId: string) => {
        return get().quotes.filter(quote => quote.providerId === providerId);
      },
      
      getQuotesByClient: (clientId: string) => {
        return get().quotes.filter(quote => quote.clientId === clientId);
      },
    }),
    {
      name: 'quotes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        quotes: state.quotes,
      }),
    }
  )
);