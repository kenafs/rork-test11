import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, Quote } from '@/types';
import { useAuth } from './useAuth';
import { mockProviders, mockVenues } from '@/mocks/users';

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
  sendQuoteMessage: (conversationId: string, quote: Quote, receiverId: string) => Promise<void>;
  createConversation: (participantId: string, initialMessage?: string, listingId?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  addContact: (contact: MessageContact) => void;
  addMessage: (contact: MessageContact) => void;
  getConversationByParticipant: (participantId: string) => Conversation | undefined;
  getAllConversations: () => MessageContact[];
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
          await new Promise(resolve => setTimeout(resolve, 500));
          
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
          await new Promise(resolve => setTimeout(resolve, 300));
          
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
          
          console.log('Sending message:', { conversationId, content, receiverId });
          
          const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
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
          
          // Update contact info
          const allUsers = [...mockProviders, ...mockVenues];
          const receiverUser = allUsers.find(u => u.id === receiverId);
          
          if (receiverUser) {
            get().addContact({
              participantId: receiverId,
              participantName: receiverUser.name,
              participantImage: receiverUser.profileImage,
              participantType: receiverUser.userType === 'provider' ? 'provider' : 
                             receiverUser.userType === 'business' ? 'business' : 'client',
              lastMessage: content,
              unread: 0,
              timestamp: Date.now(),
            });
          }
          
          console.log('Message sent successfully:', newMessage);
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },
      
      sendQuoteMessage: async (conversationId: string, quote: Quote, receiverId: string) => {
        try {
          const user = useAuth.getState().user;
          if (!user) return;
          
          console.log('Sending quote message:', { conversationId, quote, receiverId });
          
          const quoteMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            conversationId,
            senderId: user.id,
            receiverId,
            content: `Nouveau devis: ${quote.title} - ${quote.totalAmount}€`,
            timestamp: Date.now(),
            read: false,
            type: 'quote',
            quoteId: quote.id,
          };
          
          // Add quote message to conversation
          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                quoteMessage,
              ],
            },
          }));
          
          // Update conversation's last message
          set(state => {
            const updatedConversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: quoteMessage,
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
          
          // Update contact info
          const allUsers = [...mockProviders, ...mockVenues];
          const receiverUser = allUsers.find(u => u.id === receiverId);
          
          if (receiverUser) {
            get().addContact({
              participantId: receiverId,
              participantName: receiverUser.name,
              participantImage: receiverUser.profileImage,
              participantType: receiverUser.userType === 'provider' ? 'provider' : 
                             receiverUser.userType === 'business' ? 'business' : 'client',
              lastMessage: `Nouveau devis: ${quote.title}`,
              unread: 0,
              timestamp: Date.now(),
            });
          }
          
          console.log('Quote message sent successfully:', quoteMessage);
        } catch (error) {
          console.error('Error sending quote message:', error);
          throw error;
        }
      },
      
      createConversation: async (participantId: string, initialMessage?: string, listingId?: string) => {
        try {
          const user = useAuth.getState().user;
          if (!user) throw new Error('User must be logged in');
          
          console.log('Creating conversation with participant:', participantId);
          
          // Check if conversation already exists
          const existingConversation = get().conversations.find(conv =>
            conv.participants.includes(user.id) && conv.participants.includes(participantId)
          );
          
          if (existingConversation) {
            console.log('Existing conversation found:', existingConversation.id);
            // Send initial message if provided
            if (initialMessage) {
              await get().sendMessage(existingConversation.id, initialMessage, participantId);
            }
            return existingConversation.id;
          }
          
          const conversationId = `conv-${Date.now()}-${Math.random()}`;
          
          const newConversation: Conversation = {
            id: conversationId,
            participants: [user.id, participantId],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          console.log('Creating new conversation:', newConversation);
          
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
          
          // Add contact info
          const allUsers = [...mockProviders, ...mockVenues];
          const participantUser = allUsers.find(u => u.id === participantId);
          
          if (participantUser) {
            get().addContact({
              participantId,
              participantName: participantUser.name,
              participantImage: participantUser.profileImage,
              participantType: participantUser.userType === 'provider' ? 'provider' : 
                             participantUser.userType === 'business' ? 'business' : 'client',
              lastMessage: initialMessage || 'Nouvelle conversation',
              unread: 0,
              timestamp: Date.now(),
            });
          }
          
          console.log('New conversation created successfully:', conversationId);
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
              timestamp: contact.timestamp || Date.now(),
            };
          } else {
            // Add new contact
            updatedContacts = [
              { ...contact, timestamp: contact.timestamp || Date.now() },
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
      
      getConversationByParticipant: (participantId: string) => {
        const user = useAuth.getState().user;
        if (!user) return undefined;
        
        return get().conversations.find(conv =>
          conv.participants.includes(user.id) && conv.participants.includes(participantId)
        );
      },
      
      getAllConversations: () => {
        const { conversations, messages, contacts } = get();
        const user = useAuth.getState().user;
        if (!user) return [];
        
        // Convert conversations to MessageContact format
        const conversationContacts: MessageContact[] = conversations.map(conv => {
          const otherParticipantId = conv.participants.find(p => p !== user.id) || '';
          const conversationMessages = messages[conv.id] || [];
          const lastMessage = conversationMessages[conversationMessages.length - 1];
          
          // Find participant info from contacts or users
          let existingContact = contacts.find(c => c.participantId === otherParticipantId);
          
          if (!existingContact) {
            // Try to find user info from mock data
            const allUsers = [...mockProviders, ...mockVenues];
            const participantUser = allUsers.find(u => u.id === otherParticipantId);
            
            if (participantUser) {
              existingContact = {
                participantId: otherParticipantId,
                participantName: participantUser.name,
                participantImage: participantUser.profileImage,
                participantType: participantUser.userType === 'provider' ? 'provider' : 
                               participantUser.userType === 'business' ? 'business' : 'client',
                lastMessage: '',
                unread: 0,
              };
            }
          }
          
          return {
            participantId: otherParticipantId,
            participantName: existingContact?.participantName || 'Utilisateur',
            participantImage: existingContact?.participantImage,
            participantType: existingContact?.participantType || 'client',
            lastMessage: lastMessage?.content || existingContact?.lastMessage || 'Nouvelle conversation',
            unread: conversationMessages.filter(msg => !msg.read && msg.receiverId === user.id).length,
            timestamp: conv.updatedAt || conv.createdAt,
          };
        });
        
        // Merge with standalone contacts and remove duplicates
        const allContacts = [...conversationContacts];
        contacts.forEach(contact => {
          if (!allContacts.find(c => c.participantId === contact.participantId)) {
            allContacts.push(contact);
          }
        });
        
        // Sort by timestamp (most recent first)
        return allContacts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
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