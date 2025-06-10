import { create } from 'zustand';

interface Message {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  participantType: 'provider' | 'business' | 'client';
  lastMessage: string;
  timestamp: number;
  unread: number;
}

interface MessagesState {
  conversations: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  markAsRead: (conversationId: string) => void;
}

export const useMessages = create<MessagesState>((set, get) => ({
  conversations: [],
  
  addMessage: (messageData) => {
    const { conversations } = get();
    const existingIndex = conversations.findIndex(
      conv => conv.participantId === messageData.participantId
    );
    
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    if (existingIndex >= 0) {
      // Update existing conversation
      const updatedConversations = [...conversations];
      updatedConversations[existingIndex] = {
        ...updatedConversations[existingIndex],
        lastMessage: messageData.lastMessage,
        timestamp: Date.now(),
        unread: updatedConversations[existingIndex].unread + 1,
      };
      set({ conversations: updatedConversations });
    } else {
      // Add new conversation
      set({ conversations: [newMessage, ...conversations] });
    }
  },
  
  markAsRead: (conversationId: string) => {
    const { conversations } = get();
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unread: 0 } : conv
    );
    set({ conversations: updatedConversations });
  },
}));