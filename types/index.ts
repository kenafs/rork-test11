export type UserType = 'client' | 'provider' | 'business';

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
  location?: Location;
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

export interface DemoAccount {
  userType: UserType;
  name: string;
  email: string;
  profileImage?: string;
  description?: string;
  city: string;
  rating: number;
  reviewCount: number;
  
  // Provider specific
  specialties?: string;
  website?: string;
  instagram?: string;
  services?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
  
  // Business specific
  address?: string;
  venueType?: string;
  capacity?: number;
  amenities?: string[];
}

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
  images: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
  featured?: boolean;
  status?: 'active' | 'inactive' | 'pending';
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
  type: 'text' | 'image' | 'quote';
  quoteId?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: number;
  updatedAt: number;
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  providerId: string;
  clientId: string;
  listingId?: string;
  title: string;
  description: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  validUntil: number;
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SettingItem {
  icon: any;
  title: string;
  subtitle: string;
  type: 'switch' | 'navigation';
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}