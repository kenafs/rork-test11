import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation } from '@/types';
import { useAuth } from './useAuth';

interface MessagesState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<void>;
  createConversation: (participantId: string, initialMessage?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const useMessages = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      isLoading: false,
      
      fetchConversations: async () => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = useAuth.getState().user;
        if (!user) {
          set({ isLoading: false });
          return;
        }
        
        // Mock conversations - get existing ones from state
        const existingConversations = get().conversations;
        
        set({ 
          conversations: existingConversations,
          isLoading: false 
        });
      },
      
      fetchMessages: async (conversationId: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = useAuth.getState().user;
        if (!user) {
          set({ isLoading: false });
          return;
        }
        
        // Get existing messages for this conversation
        const existingMessages = get().messages[conversationId] || [];
        
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: existingMessages,
          },
          isLoading: false,
        }));
      },
      
      sendMessage: async (conversationId: string, content: string, receiverId: string) => {
        const user = useAuth.getState().user;
        if (!user) return;
        
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId: user.id,
          receiverId,
          content,
          timestamp: Date.now(),
          read: false,
          type: 'text',
        };
        
        // Add message to conversation immediately
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] || []),
              newMessage,
            ],
          },
        }));
        
        // Update conversation's last message and move to top
        set(state => ({
          conversations: [
            // Updated conversation at the top
            ...state.conversations.filter(conv => conv.id === conversationId).map(conv => ({
              ...conv,
              lastMessage: newMessage,
              updatedAt: Date.now(),
            })),
            // Other conversations
            ...state.conversations.filter(conv => conv.id !== conversationId),
          ],
        }));
        
        console.log('Message envoyé:', newMessage);
      },
      
      createConversation: async (participantId: string, initialMessage?: string) => {
        const user = useAuth.getState().user;
        if (!user) throw new Error('User must be logged in');
        
        // Check if conversation already exists
        const existingConversation = get().conversations.find(conv =>
          conv.participants.includes(user.id) && conv.participants.includes(participantId)
        );
        
        if (existingConversation) {
          // Send initial message if provided
          if (initialMessage) {
            await get().sendMessage(existingConversation.id, initialMessage, participantId);
          }
          return existingConversation.id;
        }
        
        const conversationId = `conv-${Date.now()}`;
        
        const newConversation: Conversation = {
          id: conversationId,
          participants: [user.id, participantId],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set(state => ({
          conversations: [newConversation, ...state.conversations],
          messages: {
            ...state.messages,
            [conversationId]: [],
          },
        }));
        
        // Send initial message if provided
        if (initialMessage) {
          await get().sendMessage(conversationId, initialMessage, participantId);
        }
        
        console.log('Nouvelle conversation créée:', conversationId);
        return conversationId;
      },
      
      markAsRead: async (conversationId: string) => {
        const user = useAuth.getState().user;
        if (!user) return;
        
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map(msg =>
              msg.receiverId === user.id ? { ...msg, read: true } : msg
            ),
          },
        }));
      },
      
      refreshConversations: async () => {
        await get().fetchConversations();
      },
    }),
    {
      name: 'messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
    }
  )
);