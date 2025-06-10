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
        
        // Mock conversations
        const mockConversations: Conversation[] = [
          {
            id: 'conv-1',
            participants: [user.id, 'provider-1'],
            lastMessage: {
              id: 'msg-1',
              conversationId: 'conv-1',
              senderId: 'provider-1',
              receiverId: user.id,
              content: 'Bonjour ! Je serais ravi de discuter de votre événement.',
              timestamp: Date.now() - 3600000,
              read: false,
              type: 'text',
            },
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 3600000,
          },
        ];
        
        set({ 
          conversations: mockConversations,
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
        
        // Mock messages
        const mockMessages: Message[] = [
          {
            id: 'msg-1',
            conversationId,
            senderId: 'provider-1',
            receiverId: user.id,
            content: 'Bonjour ! Je serais ravi de discuter de votre événement.',
            timestamp: Date.now() - 3600000,
            read: false,
            type: 'text',
          },
        ];
        
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: mockMessages,
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
        
        // Add message to conversation
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] || []),
              newMessage,
            ],
          },
        }));
        
        // Update conversation's last message
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, lastMessage: newMessage, updatedAt: Date.now() }
              : conv
          ),
        }));
      },
      
      createConversation: async (participantId: string, initialMessage?: string) => {
        const user = useAuth.getState().user;
        if (!user) throw new Error('User must be logged in');
        
        const conversationId = `conv-${Date.now()}`;
        
        const newConversation: Conversation = {
          id: conversationId,
          participants: [user.id, participantId],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set(state => ({
          conversations: [newConversation, ...state.conversations],
        }));
        
        // Send initial message if provided
        if (initialMessage) {
          await get().sendMessage(conversationId, initialMessage, participantId);
        }
        
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