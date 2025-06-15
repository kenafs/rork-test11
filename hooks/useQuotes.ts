import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, QuoteItem } from '@/types';
import { useAuth } from './useAuth';

interface QuotesState {
  quotes: { [userId: string]: Quote[] };
  isLoading: boolean;
  
  fetchQuotes: () => Promise<void>;
  createQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'currency' | 'subtotal' | 'tax' | 'total'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  acceptQuote: (id: string) => Promise<boolean>;
  rejectQuote: (id: string) => Promise<boolean>;
  sendQuote: (id: string) => Promise<boolean>;
  payQuote: (id: string) => Promise<boolean>;
  completeQuote: (id: string) => Promise<boolean>;
  getQuotesByUser: (userId: string) => Quote[];
  getQuotesForUser: (userId: string) => Quote[];
  getUserQuotes: () => Quote[];
  getAllQuotes: () => Quote[];
  canUserRate: (quoteId: string, userId: string) => boolean;
}

export const useQuotes = create<QuotesState>()(
  persist(
    (set, get) => ({
      quotes: {},
      isLoading: false,
      
      fetchQuotes: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching quotes:', error);
          set({ isLoading: false });
        }
      },
      
      createQuote: async (quoteData) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const user = useAuth.getState().user;
          if (!user) throw new Error('User must be logged in to create a quote');
          
          const subtotal = quoteData.items.reduce((sum, item) => sum + (item.total || 0), 0);
          const tax = subtotal * 0.2;
          const total = subtotal + tax;
          
          const newQuote: Quote = {
            ...quoteData,
            id: `quote-${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            currency: 'EUR',
            subtotal,
            tax,
            total,
          };
          
          set(state => {
            const userQuotes = state.quotes[user.id] || [];
            return {
              quotes: {
                ...state.quotes,
                [user.id]: [...userQuotes, newQuote],
              },
              isLoading: false,
            };
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
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return false;
          }
          
          const userQuotes = get().quotes[user.id] || [];
          const quoteIndex = userQuotes.findIndex(q => q.id === id);
          
          if (quoteIndex === -1) {
            set({ isLoading: false });
            return false;
          }
          
          const updatedQuotes = [...userQuotes];
          updatedQuotes[quoteIndex] = {
            ...updatedQuotes[quoteIndex],
            ...updates,
            updatedAt: Date.now(),
          };
          
          set(state => ({
            quotes: {
              ...state.quotes,
              [user.id]: updatedQuotes,
            },
            isLoading: false,
          }));
          
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
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return false;
          }
          
          const userQuotes = get().quotes[user.id] || [];
          const updatedQuotes = userQuotes.filter(q => q.id !== id);
          
          set(state => ({
            quotes: {
              ...state.quotes,
              [user.id]: updatedQuotes,
            },
            isLoading: false,
          }));
          
          console.log('Devis supprimé:', id);
          return true;
        } catch (error) {
          console.error('Error deleting quote:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      sendQuote: async (id: string) => {
        const result = await get().updateQuote(id, { status: 'pending' });
        if (result) {
          console.log('Devis envoyé:', id);
        }
        return result;
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
      
      payQuote: async (id: string) => {
        const result = await get().updateQuote(id, { 
          status: 'paid',
          paidAt: Date.now()
        });
        if (result) {
          console.log('Devis payé:', id);
        }
        return result;
      },
      
      completeQuote: async (id: string) => {
        const result = await get().updateQuote(id, { 
          status: 'completed',
          completedAt: Date.now()
        });
        if (result) {
          console.log('Devis terminé:', id);
        }
        return result;
      },
      
      canUserRate: (quoteId: string, userId: string) => {
        const allQuotes = get().getAllQuotes();
        const quote = allQuotes.find(q => q.id === quoteId);
        
        if (!quote) return false;
        
        // Only allow rating if:
        // 1. Quote is completed
        // 2. User is either the client or provider (not rating themselves)
        // 3. User is not the same as the other party
        const isCompleted = quote.status === 'completed';
        const isParticipant = quote.clientId === userId || quote.providerId === userId;
        const isNotSelfRating = quote.clientId !== quote.providerId;
        
        return isCompleted && isParticipant && isNotSelfRating;
      },
      
      getUserQuotes: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        return get().quotes[user.id] || [];
      },
      
      getQuotesByUser: (userId: string) => {
        return get().quotes[userId] || [];
      },
      
      getQuotesForUser: (userId: string) => {
        // Get all quotes where this user is the client
        const allQuotes = Object.values(get().quotes).flat();
        return allQuotes.filter(quote => quote.clientId === userId);
      },
      
      getAllQuotes: () => {
        return Object.values(get().quotes).flat();
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