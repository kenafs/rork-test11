import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation } from '@/types';
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
  conversations: { [userId: string]: Conversation[] };
  messages: { [userId: string]: { [conversationId: string]: Message[] } };
  contacts: { [userId: string]: MessageContact[] };
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<void>;
  createConversation: (participantId: string, initialMessage?: string, listingId?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  addContact: (contact: MessageContact) => void;
  addMessage: (contact: MessageContact) => void;
  getConversationByParticipant: (participantId: string) => Conversation | undefined;
  getAllConversations: () => MessageContact[];
  getUserConversations: () => Conversation[];
  getUserMessages: (conversationId: string) => Message[];
}

export const useMessages = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: {},
      messages: {},
      contacts: {},
      isLoading: false,
      
      fetchConversations: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          const userConversations = get().conversations[user.id] || [];
          
          set({ 
            isLoading: false 
          });
          
          console.log('Conversations fetched for user:', user.id, userConversations.length);
        } catch (error) {
          console.error('Error fetching conversations:', error);
          set({ isLoading: false });
        }
      },
      
      fetchMessages: async (conversationId: string) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          const userMessages = get().messages[user.id] || {};
          const conversationMessages = userMessages[conversationId] || [];
          
          set({ isLoading: false });
          
          console.log('Messages fetched for conversation:', conversationId, conversationMessages.length);
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ isLoading: false });
        }
      },
      
      sendMessage: async (conversationId: string, content: string, receiverId: string) => {
        try {
          const user = useAuth.getState().user;
          if (!user) return;
          
          console.log('Sending message:', { conversationId, content, receiverId, senderId: user.id });
          
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
          
          // Add message to current user's messages
          set(state => {
            const userMessages = state.messages[user.id] || {};
            const conversationMessages = userMessages[conversationId] || [];
            
            return {
              messages: {
                ...state.messages,
                [user.id]: {
                  ...userMessages,
                  [conversationId]: [...conversationMessages, newMessage],
                },
              },
            };
          });
          
          // Also add to receiver's messages (simulate real-time messaging)
          set(state => {
            const receiverMessages = state.messages[receiverId] || {};
            const receiverConversationMessages = receiverMessages[conversationId] || [];
            
            return {
              messages: {
                ...state.messages,
                [receiverId]: {
                  ...receiverMessages,
                  [conversationId]: [...receiverConversationMessages, newMessage],
                },
              },
            };
          });
          
          // Update conversation's last message for current user
          set(state => {
            const userConversations = state.conversations[user.id] || [];
            const updatedConversations = userConversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: newMessage,
                  updatedAt: Date.now(),
                };
              }
              return conv;
            });
            
            updatedConversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            
            return {
              conversations: {
                ...state.conversations,
                [user.id]: updatedConversations,
              },
            };
          });
          
          // Update contact info for current user
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
      
      createConversation: async (participantId: string, initialMessage?: string, listingId?: string) => {
        try {
          const user = useAuth.getState().user;
          if (!user) throw new Error('User must be logged in');
          
          console.log('Creating conversation with participant:', participantId, 'for user:', user.id);
          
          // Check if conversation already exists for this user
          const userConversations = get().conversations[user.id] || [];
          const existingConversation = userConversations.find(conv =>
            conv.participants.includes(user.id) && conv.participants.includes(participantId)
          );
          
          if (existingConversation) {
            console.log('Existing conversation found:', existingConversation.id);
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
            unreadCount: 0,
          };
          
          console.log('Creating new conversation:', newConversation);
          
          // Add conversation to current user
          set(state => {
            const userConversations = state.conversations[user.id] || [];
            const userMessages = state.messages[user.id] || {};
            
            return {
              conversations: {
                ...state.conversations,
                [user.id]: [newConversation, ...userConversations],
              },
              messages: {
                ...state.messages,
                [user.id]: {
                  ...userMessages,
                  [conversationId]: [],
                },
              },
            };
          });
          
          // Also add conversation to participant
          set(state => {
            const participantConversations = state.conversations[participantId] || [];
            const participantMessages = state.messages[participantId] || {};
            
            return {
              conversations: {
                ...state.conversations,
                [participantId]: [newConversation, ...participantConversations],
              },
              messages: {
                ...state.messages,
                [participantId]: {
                  ...participantMessages,
                  [conversationId]: [],
                },
              },
            };
          });
          
          // Send initial message if provided
          if (initialMessage) {
            await get().sendMessage(conversationId, initialMessage, participantId);
          }
          
          // Add contact info to ensure it appears in conversation list
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
          
          set(state => {
            const userMessages = state.messages[user.id] || {};
            const conversationMessages = userMessages[conversationId] || [];
            
            return {
              messages: {
                ...state.messages,
                [user.id]: {
                  ...userMessages,
                  [conversationId]: conversationMessages.map(msg =>
                    msg.receiverId === user.id ? { ...msg, read: true } : msg
                  ),
                },
              },
            };
          });
          
          console.log('Messages marked as read for conversation:', conversationId);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      },
      
      refreshConversations: async () => {
        console.log('Refreshing conversations...');
        await get().fetchConversations();
      },
      
      addContact: (contact: MessageContact) => {
        const user = useAuth.getState().user;
        if (!user) return;
        
        set(state => {
          const userContacts = state.contacts[user.id] || [];
          const existingContactIndex = userContacts.findIndex(c => c.participantId === contact.participantId);
          
          let updatedContacts;
          if (existingContactIndex >= 0) {
            updatedContacts = [...userContacts];
            updatedContacts[existingContactIndex] = {
              ...updatedContacts[existingContactIndex],
              lastMessage: contact.lastMessage,
              timestamp: contact.timestamp || Date.now(),
            };
          } else {
            updatedContacts = [
              { ...contact, timestamp: contact.timestamp || Date.now() },
              ...userContacts
            ];
          }
          
          updatedContacts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          console.log('Updated contacts for user:', user.id, updatedContacts.length);
          
          return {
            contacts: {
              ...state.contacts,
              [user.id]: updatedContacts,
            },
          };
        });
      },
      
      addMessage: (contact: MessageContact) => {
        get().addContact(contact);
      },
      
      getConversationByParticipant: (participantId: string) => {
        const user = useAuth.getState().user;
        if (!user) return undefined;
        
        const userConversations = get().conversations[user.id] || [];
        return userConversations.find(conv =>
          conv.participants.includes(user.id) && conv.participants.includes(participantId)
        );
      },
      
      getUserConversations: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        return get().conversations[user.id] || [];
      },
      
      getUserMessages: (conversationId: string) => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        const userMessages = get().messages[user.id] || {};
        return userMessages[conversationId] || [];
      },
      
      getAllConversations: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        const userConversations = get().conversations[user.id] || [];
        const userMessages = get().messages[user.id] || {};
        const userContacts = get().contacts[user.id] || [];
        
        const conversationContacts: MessageContact[] = userConversations.map(conv => {
          const otherParticipantId = conv.participants.find(p => p !== user.id) || '';
          const conversationMessages = userMessages[conv.id] || [];
          const lastMessage = conversationMessages[conversationMessages.length - 1];
          
          let existingContact = userContacts.find(c => c.participantId === otherParticipantId);
          
          if (!existingContact) {
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
            lastMessage: lastMessage?.content || 'Nouvelle conversation',
            unread: conversationMessages.filter(msg => !msg.read && msg.receiverId === user.id).length,
            timestamp: conv.updatedAt || conv.createdAt,
          };
        });
        
        const allContacts = [...conversationContacts];
        userContacts.forEach(contact => {
          if (!allContacts.find(c => c.participantId === contact.participantId)) {
            allContacts.push(contact);
          }
        });
        
        const sortedContacts = allContacts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        console.log('Getting all conversations for user:', user.id, sortedContacts.length);
        return sortedContacts;
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