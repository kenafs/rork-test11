import { create } from 'zustand';
import { Quote, QuoteItem } from '@/types';

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  
  createQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  getQuotesByProvider: (providerId: string) => Quote[];
  getQuotesByClient: (clientId: string) => Quote[];
}

export const useQuotes = create<QuotesState>((set, get) => ({
  quotes: [],
  isLoading: false,
  
  createQuote: async (quoteData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...quoteData,
    };
    
    set({ 
      quotes: [...get().quotes, newQuote],
      isLoading: false 
    });
    
    return newQuote;
  },
  
  updateQuote: async (id: string, updates: Partial<Quote>) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    return true;
  },
  
  deleteQuote: async (id: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { quotes } = get();
    const updatedQuotes = quotes.filter(q => q.id !== id);
    
    set({ 
      quotes: updatedQuotes,
      isLoading: false 
    });
    
    return true;
  },
  
  getQuotesByProvider: (providerId: string) => {
    return get().quotes.filter(quote => quote.providerId === providerId);
  },
  
  getQuotesByClient: (clientId: string) => {
    return get().quotes.filter(quote => quote.clientId === clientId);
  },
}));