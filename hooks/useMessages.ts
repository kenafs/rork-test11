import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation } from '@/types';
import { useAuth } from './useAuth';

interface MessageContact {
  participantId: string;
  participantName: string;
  participantImage?: string;
  participantType: 'provider' | 'business' | 'client';
  lastMessage: string;
  unread: number;
  timestamp?: number;
}

interface MessagesState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  contacts: MessageContact[];
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<void>;
  createConversation: (participantId: string, initialMessage?: string, listingId?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  addContact: (contact: MessageContact) => void;
  addMessage: (contact: MessageContact) => void;
}

export const useMessages = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      contacts: [],
      isLoading: false,
      
      fetchConversations: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          // Get existing conversations from state
          const existingConversations = get().conversations;
          
          set({ 
            conversations: existingConversations,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching conversations:', error);
          set({ isLoading: false });
        }
      },
      
      fetchMessages: async (conversationId: string) => {
        set({ isLoading: true });
        
        try {
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
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ isLoading: false });
        }
      },
      
      sendMessage: async (conversationId: string, content: string, receiverId: string) => {
        try {
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
          set(state => {
            const updatedConversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: newMessage,
                  updatedAt: Date.now(),
                };
              }
              return conv;
            });
            
            // Sort conversations by updatedAt (most recent first)
            updatedConversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            
            return {
              conversations: updatedConversations,
            };
          });
          
          console.log('Message envoyé:', newMessage);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      },
      
      createConversation: async (participantId: string, initialMessage?: string, listingId?: string) => {
        try {
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
        } catch (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }
      },
      
      markAsRead: async (conversationId: string) => {
        try {
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
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      },
      
      refreshConversations: async () => {
        await get().fetchConversations();
      },
      
      addContact: (contact: MessageContact) => {
        set(state => {
          // Check if contact already exists
          const existingContactIndex = state.contacts.findIndex(c => c.participantId === contact.participantId);
          
          let updatedContacts;
          if (existingContactIndex >= 0) {
            // Update existing contact
            updatedContacts = [...state.contacts];
            updatedContacts[existingContactIndex] = {
              ...updatedContacts[existingContactIndex],
              lastMessage: contact.lastMessage,
              timestamp: Date.now(),
            };
          } else {
            // Add new contact
            updatedContacts = [
              { ...contact, timestamp: Date.now() },
              ...state.contacts
            ];
          }
          
          // Sort by timestamp (most recent first)
          updatedContacts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          return {
            contacts: updatedContacts,
          };
        });
      },
      
      addMessage: (contact: MessageContact) => {
        // Alias for addContact for backward compatibility
        get().addContact(contact);
      },
    }),
    {
      name: 'messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        contacts: state.contacts,
      }),
    }
  )
);