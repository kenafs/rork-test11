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
  location?: Location;
  city?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: number;
  
  // Social links
  website?: string;
  instagram?: string;
}

export interface Provider extends User {
  userType: 'provider';
  services?: string[];
  specialties?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
}

export interface Venue extends User {
  userType: 'business';
  venueType?: string;
  address?: string;
  capacity?: number;
  amenities?: string[];
}

export interface Client extends User {
  userType: 'client';
}

export interface DemoAccount {
  name: string;
  email: string;
  userType: UserType;
  profileImage: string;
  description?: string;
  specialties?: string;
  address?: string;
  website?: string;
  instagram?: string;
  rating: number;
  reviewCount: number;
  city: string;
  services?: string[];
  venueType?: string;
  capacity?: number;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  priceType?: 'fixed' | 'hourly' | 'daily' | 'negotiable';
  images?: string[];
  location: Location;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'inactive' | 'pending';
  createdBy: string;
  creatorType: UserType;
  creatorName: string;
  creatorImage?: string;
  creatorRating?: number;
  creatorReviewCount?: number;
  date?: number;
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
  updatedAt?: number;
}

export interface Quote {
  id: string;
  listingId?: string;
  clientId: string;
  providerId: string;
  title: string;
  description: string;
  price?: number;
  total: number;
  totalAmount: number;
  currency: string;
  validUntil: number;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: number;
  updatedAt: number;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Review {
  id: string;
  listingId?: string;
  userId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImage?: string;
  rating: number;
  comment: string;
  createdAt: number;
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