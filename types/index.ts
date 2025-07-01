export type UserType = 'client' | 'provider' | 'business';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  address?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  eventType: string;
  eventDate: number;
  clientName?: string;
  tags?: string[];
  featured?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
  location?: string;
  attendees?: string[];
  quoteId?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reminders?: number[]; // Minutes before event
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType: UserType;
  location: Location;
  rating: number;
  reviewCount: number;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  portfolio?: PortfolioItem[];
  createdAt: number;
  // Add optional properties that might be accessed directly
  specialties?: string;
  address?: string;
  city?: string;
}

export interface Provider extends User {
  userType: 'provider';
  services: string[];
  specialties?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
  portfolio?: PortfolioItem[];
  socialLinks?: {
    instagram?: string;
    website?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface Venue extends User {
  userType: 'business';
  venueType: string;
  capacity: number;
  amenities: string[];
  photos?: string[];
  address?: string;
  portfolio?: PortfolioItem[];
  socialLinks?: {
    instagram?: string;
    website?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface Client extends User {
  userType: 'client';
  preferences?: string[];
  eventHistory?: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  images?: string[];
  location: Location;
  createdBy: string;
  creatorName: string;
  creatorImage?: string;
  creatorType: UserType;
  creatorRating?: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'inactive' | 'draft';
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImage?: string;
  targetId: string;
  targetType: 'user' | 'listing';
  rating: number;
  comment: string;
  createdAt: number;
  quoteId?: string;
  // Add missing properties
  listingId?: string;
  providerId?: string;
  venueId?: string;
  response?: string;
  helpful?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'image' | 'quote';
  quoteId?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: number;
  createdAt: number;
  updatedAt: number;
  unreadCount: number;
}

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  listingId?: string;
  providerId: string;
  clientId: string;
  title: string;
  description: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'paid' | 'completed' | 'refunded';
  validUntil: number;
  eventDate?: number;
  eventLocation?: string;
  eventDuration?: number; // in hours
  specialRequests?: string;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  completedAt?: number;
  refundedAt?: number;
  calendarEventId?: string;
}

export interface DemoAccount {
  userType: UserType;
  name: string;
  email: string;
  profileImage?: string;
  description: string;
  city: string;
  rating: number;
  reviewCount: number;
  
  // Provider specific
  specialties?: string;
  website?: string;
  instagram?: string;
  services?: string[];
  priceRange?: { min: number; max: number };
  availability?: string[];
  
  // Business specific
  address?: string;
  venueType?: string;
  capacity?: number;
  amenities?: string[];
  canActAsClient?: boolean;
  
  // Client specific - ENHANCED
  hasReceivedQuotes?: boolean; // NEW: Flag to indicate demo quotes should be created
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories?: string[];
}

export interface SearchFilters {
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availability?: string[];
  distance?: number;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface AppSettings {
  language: string;
  currency: string;
  notifications: NotificationSettings;
  privacy: {
    profileVisible: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
}