import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, QuoteItem } from '@/types';
import { useAuth } from './useAuth';

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  
  fetchQuotes: () => Promise<void>;
  createQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'currency'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  acceptQuote: (id: string) => Promise<boolean>;
  rejectQuote: (id: string) => Promise<boolean>;
  getQuotesByUser: (userId: string) => Quote[];
  getQuotesForUser: (userId: string) => Quote[];
}

export const useQuotes = create<QuotesState>()(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      
      fetchQuotes: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          // Get existing quotes from state
          const existingQuotes = get().quotes;
          
          set({ 
            quotes: existingQuotes,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching quotes:', error);
          set({ isLoading: false });
        }
      },
      
      createQuote: async (quoteData) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const user = useAuth.getState().user;
          if (!user) throw new Error('User must be logged in to create a quote');
          
          const newQuote: Quote = {
            id: `quote-${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            currency: 'EUR',
            ...quoteData,
          };
          
          const updatedQuotes = [...get().quotes, newQuote];
          
          set({ 
            quotes: updatedQuotes,
            isLoading: false 
          });
          
          console.log('Devis créé avec succès:', newQuote);
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
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { quotes } = get();
          const quoteIndex = quotes.findIndex(q => q.id === id);
          
          if (quoteIndex === -1) {
            set({ isLoading: false });
            return false;
          }
          
          const updatedQuotes = [...quotes];
          updatedQuotes[quoteIndex] = {
            ...updatedQuotes[quoteIndex],
            ...updates,
            updatedAt: Date.now(),
          };
          
          set({ 
            quotes: updatedQuotes,
            isLoading: false 
          });
          
          console.log('Devis mis à jour:', updatedQuotes[quoteIndex]);
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
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { quotes } = get();
          const updatedQuotes = quotes.filter(q => q.id !== id);
          
          set({ 
            quotes: updatedQuotes,
            isLoading: false 
          });
          
          console.log('Devis supprimé:', id);
          return true;
        } catch (error) {
          console.error('Error deleting quote:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      acceptQuote: async (id: string) => {
        const result = await get().updateQuote(id, { status: 'accepted' });
        if (result) {
          console.log('Devis accepté:', id);
        }
        return result;
      },
      
      rejectQuote: async (id: string) => {
        const result = await get().updateQuote(id, { status: 'rejected' });
        if (result) {
          console.log('Devis rejeté:', id);
        }
        return result;
      },
      
      getQuotesByUser: (userId: string) => {
        // Get quotes created by this user (provider)
        return get().quotes.filter(quote => quote.providerId === userId);
      },
      
      getQuotesForUser: (userId: string) => {
        // Get quotes sent to this user (client)
        return get().quotes.filter(quote => quote.clientId === userId);
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