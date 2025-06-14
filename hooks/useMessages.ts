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

interface UserMessagesData {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  contacts: MessageContact[];
}

interface MessagesState {
  userMessages: { [userId: string]: UserMessagesData };
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
  getCurrentUserData: () => UserMessagesData;
}

const getEmptyUserData = (): UserMessagesData => ({
  conversations: [],
  messages: {},
  contacts: [],
});

export const useMessages = create<MessagesState>()(
  persist(
    (set, get) => ({
      userMessages: {},
      isLoading: false,
      
      getCurrentUserData: () => {
        const user = useAuth.getState().user;
        if (!user) return getEmptyUserData();
        
        const { userMessages } = get();
        return userMessages[user.id] || getEmptyUserData();
      },
      
      fetchConversations: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = useAuth.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          // Just mark as loaded - conversations are already in state
          set({ isLoading: false });
          
          console.log('Conversations fetched for user:', user.id);
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
          
          // Messages are already in state, just mark as loaded
          set({ isLoading: false });
          
          console.log('Messages fetched for conversation:', conversationId);
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ isLoading: false });
        }
      },
      
      sendMessage: async (conversationId: string, content: string, receiverId: string) => {
        try {
          const user = useAuth.getState().user;
          if (!user) return;
          
          console.log('Sending message:', { conversationId, content, receiverId, userId: user.id });
          
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
          
          // Update messages for current user only
          set(state => {
            const currentUserData = state.userMessages[user.id] || getEmptyUserData();
            
            const updatedMessages = {
              ...currentUserData.messages,
              [conversationId]: [
                ...(currentUserData.messages[conversationId] || []),
                newMessage,
              ],
            };
            
            // Update conversation's last message
            const updatedConversations = currentUserData.conversations.map(conv => {
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
              userMessages: {
                ...state.userMessages,
                [user.id]: {
                  ...currentUserData,
                  conversations: updatedConversations,
                  messages: updatedMessages,
                }
              }
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
          
          console.log('Message sent successfully for user:', user.id);
          
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
          
          const currentUserData = get().getCurrentUserData();
          
          // Check if conversation already exists for this user
          const existingConversation = currentUserData.conversations.find(conv =>
            conv.participants.includes(user.id) && conv.participants.includes(participantId)
          );
          
          if (existingConversation) {
            console.log('Existing conversation found:', existingConversation.id);
            if (initialMessage) {
              await get().sendMessage(existingConversation.id, initialMessage, participantId);
            }
            return existingConversation.id;
          }
          
          const conversationId = `conv-${user.id}-${Date.now()}-${Math.random()}`;
          
          const newConversation: Conversation = {
            id: conversationId,
            participants: [user.id, participantId],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          console.log('Creating new conversation for user:', user.id, newConversation);
          
          // Add conversation to current user's data only
          set(state => {
            const currentUserData = state.userMessages[user.id] || getEmptyUserData();
            
            return {
              userMessages: {
                ...state.userMessages,
                [user.id]: {
                  ...currentUserData,
                  conversations: [newConversation, ...currentUserData.conversations],
                  messages: {
                    ...currentUserData.messages,
                    [conversationId]: [],
                  },
                }
              }
            };
          });
          
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
          
          console.log('New conversation created successfully for user:', user.id, conversationId);
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
            const currentUserData = state.userMessages[user.id] || getEmptyUserData();
            
            const updatedMessages = {
              ...currentUserData.messages,
              [conversationId]: (currentUserData.messages[conversationId] || []).map(msg =>
                msg.receiverId === user.id ? { ...msg, read: true } : msg
              ),
            };
            
            return {
              userMessages: {
                ...state.userMessages,
                [user.id]: {
                  ...currentUserData,
                  messages: updatedMessages,
                }
              }
            };
          });
          
          console.log('Messages marked as read for conversation:', conversationId, 'user:', user.id);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      },
      
      refreshConversations: async () => {
        const user = useAuth.getState().user;
        console.log('Refreshing conversations for user:', user?.id);
        await get().fetchConversations();
      },
      
      addContact: (contact: MessageContact) => {
        const user = useAuth.getState().user;
        if (!user) return;
        
        set(state => {
          const currentUserData = state.userMessages[user.id] || getEmptyUserData();
          const existingContactIndex = currentUserData.contacts.findIndex(c => c.participantId === contact.participantId);
          
          let updatedContacts;
          if (existingContactIndex >= 0) {
            updatedContacts = [...currentUserData.contacts];
            updatedContacts[existingContactIndex] = {
              ...updatedContacts[existingContactIndex],
              lastMessage: contact.lastMessage,
              timestamp: contact.timestamp || Date.now(),
            };
          } else {
            updatedContacts = [
              { ...contact, timestamp: contact.timestamp || Date.now() },
              ...currentUserData.contacts
            ];
          }
          
          updatedContacts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          console.log('Updated contacts for user:', user.id, updatedContacts.length);
          
          return {
            userMessages: {
              ...state.userMessages,
              [user.id]: {
                ...currentUserData,
                contacts: updatedContacts,
              }
            }
          };
        });
      },
      
      addMessage: (contact: MessageContact) => {
        get().addContact(contact);
      },
      
      getConversationByParticipant: (participantId: string) => {
        const user = useAuth.getState().user;
        if (!user) return undefined;
        
        const currentUserData = get().getCurrentUserData();
        return currentUserData.conversations.find(conv =>
          conv.participants.includes(user.id) && conv.participants.includes(participantId)
        );
      },
      
      getAllConversations: () => {
        const user = useAuth.getState().user;
        if (!user) return [];
        
        const currentUserData = get().getCurrentUserData();
        const { conversations, messages, contacts } = currentUserData;
        
        const conversationContacts: MessageContact[] = conversations.map(conv => {
          const otherParticipantId = conv.participants.find(p => p !== user.id) || '';
          const conversationMessages = messages[conv.id] || [];
          const lastMessage = conversationMessages[conversationMessages.length - 1];
          
          let existingContact = contacts.find(c => c.participantId === otherParticipantId);
          
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
        contacts.forEach(contact => {
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
        userMessages: state.userMessages,
      }),
    }
  )
);