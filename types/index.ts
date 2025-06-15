export interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  profileImage?: string;
  description?: string;
  website?: string;
  instagram?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  city?: string;
  createdAt: number;
}

export interface Provider extends User {
  userType: 'provider';
  specialties?: string;
  services?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
}

export interface Venue extends User {
  userType: 'business';
  address?: string;
  venueType?: string;
  capacity?: number;
  amenities?: string[];
}

export interface Client extends User {
  userType: 'client';
}

export type UserType = 'client' | 'provider' | 'business';

export interface Listing {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  creatorType: UserType;
  creatorName: string;
  creatorImage?: string;
  creatorRating?: number;
  creatorReviewCount?: number;
  location: Location;
  category: string;
  price?: number;
  images?: string[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  targetId: string;
  targetType: 'user' | 'listing';
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type?: 'text' | 'quote' | 'image';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: number;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Contact {
  participantId: string;
  participantName: string;
  participantImage?: string;
  participantType: 'client' | 'provider' | 'business';
  lastMessage: string;
  unread: number;
  timestamp: number;
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  title: string;
  description: string;
  listingId?: string;
  listingTitle?: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  items: QuoteItem[];
  validityDays: number;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'paid' | 'completed';
  validUntil: number;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  completedAt?: number;
}

export interface DemoAccount {
  userType: UserType;
  name: string;
  email: string;
  profileImage?: string;
  description?: string;
  specialties?: string;
  website?: string;
  instagram?: string;
  rating?: number;
  reviewCount?: number;
  city: string;
  services?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
  address?: string;
  venueType?: string;
  capacity?: number;
  amenities?: string[];
}