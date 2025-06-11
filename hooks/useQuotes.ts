import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '@/types';

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  
  fetchQuotes: () => Promise<void>;
  createQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  getQuoteById: (id: string) => Quote | undefined;
  getQuotesByUser: (userId: string) => Quote[];
  getQuotesForUser: (userId: string) => Quote[];
  acceptQuote: (id: string) => Promise<boolean>;
  rejectQuote: (id: string) => Promise<boolean>;
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newQuote: Quote = {
            id: `quote-${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...quoteData,
            total: quoteData.totalAmount, // Add backward compatibility
          };
          
          set(state => ({
            quotes: [newQuote, ...state.quotes],
            isLoading: false 
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
            total: updates.totalAmount || updatedQuotes[quoteIndex].totalAmount, // Update backward compatibility
          };
          
          set({ 
            quotes: updatedQuotes,
            isLoading: false 
          });
          
          console.log('Quote updated:', updatedQuotes[quoteIndex]);
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
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const { quotes } = get();
          const updatedQuotes = quotes.filter(q => q.id !== id);
          
          set({ 
            quotes: updatedQuotes,
            isLoading: false 
          });
          
          console.log('Quote deleted:', id);
          return true;
        } catch (error) {
          console.error('Error deleting quote:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      getQuoteById: (id: string) => {
        return get().quotes.find(quote => quote.id === id);
      },
      
      getQuotesByUser: (userId: string) => {
        return get().quotes.filter(quote => quote.providerId === userId);
      },
      
      getQuotesForUser: (userId: string) => {
        return get().quotes.filter(quote => quote.clientId === userId);
      },
      
      acceptQuote: async (id: string) => {
        return await get().updateQuote(id, { status: 'accepted' });
      },
      
      rejectQuote: async (id: string) => {
        return await get().updateQuote(id, { status: 'rejected' });
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