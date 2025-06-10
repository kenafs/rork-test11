export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  address?: string;
}

export type UserType = 'client' | 'provider' | 'business';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  profileImage?: string;
  location?: Location;
  rating?: number;
  reviewCount?: number;
  createdAt: number;
  description?: string;
  website?: string;
  instagram?: string;
  specialties?: string;
  address?: string;
  city?: string;
}

export interface DemoAccount {
  name: string;
  email: string;
  userType: 'provider' | 'business' | 'client';
  profileImage: string;
  description: string;
  specialties?: string;
  address?: string;
  website?: string;
  instagram?: string;
  rating: number;
  reviewCount: number;
  city: string;
}

export interface Provider extends User {
  userType: 'provider';
  services: string[];
  description: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
  portfolio?: string[];
}

export interface Venue extends User {
  userType: 'business';
  venueType: string;
  description: string;
  capacity?: number;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface Client extends User {
  userType: 'client';
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price?: number;
  priceType?: 'fixed' | 'hourly' | 'daily' | 'negotiable';
  images?: string[];
  location: Location;
  createdBy: string;
  creatorName: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  creatorRating?: number;
  creatorReviewCount?: number;
}

export interface Review {
  id: string;
  listingId?: string;
  providerId?: string;
  venueId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImage?: string;
  rating: number;
  comment: string;
  createdAt: number;
  helpful?: number;
  response?: string;
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
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  listingId?: string;
  providerId: string;
  clientId: string;
  title: string;
  description: string;
  items: QuoteItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: number;
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface SettingItemSwitch {
  icon: any;
  title: string;
  subtitle: string;
  type: 'switch';
  value: boolean;
  onToggle: (value: boolean) => void;
}

export interface SettingItemNavigation {
  icon: any;
  title: string;
  subtitle: string;
  type: 'navigation';
  onPress: () => void;
}

export type SettingItem = SettingItemSwitch | SettingItemNavigation;