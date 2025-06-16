import { Listing } from '@/types';
import { mockProviders, mockVenues } from './users';

export const mockListings: Listing[] = [
  {
    id: '1',
    title: "DJ Available for Corporate Holiday Party",
    description: "Professional DJ with extensive experience in corporate events. I provide high-quality sound equipment and can create playlists tailored to your company culture and event theme.",
    createdBy: mockProviders[0].id,
    creatorType: 'provider',
    creatorName: mockProviders[0].name,
    creatorImage: mockProviders[0].profileImage,
    creatorRating: 0, // CRITICAL FIX: Set to 0
    creatorReviewCount: 0,
    location: mockProviders[0].location!,
    category: 'DJ',
    price: 800,
    priceType: 'negotiable',
    date: Date.now() + 86400000 * 14, // 14 days from now
    images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop'],
    tags: ['DJ', 'Corporate', 'Holiday Party'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    status: 'active',
  },
  {
    id: '2',
    title: "Seeking Experienced Bartenders for New Year's Eve",
    description: "Our restaurant is hosting a New Year's Eve gala and we need 3 experienced bartenders who can create signature cocktails and provide excellent service for our guests.",
    createdBy: mockVenues[0].id,
    creatorType: 'business',
    creatorName: mockVenues[0].name,
    creatorImage: mockVenues[0].profileImage,
    creatorRating: 0, // CRITICAL FIX: Set to 0
    creatorReviewCount: 0,
    location: mockVenues[0].location!,
    category: 'Personnel',
    price: 250,
    priceType: 'hourly',
    date: Date.now() + 86400000 * 30, // 30 days from now
    images: ['https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=800&auto=format&fit=crop'],
    tags: ['Bartender', 'New Year', 'Urgent'],
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    status: 'active',
  },
  {
    id: '3',
    title: "Gourmet Catering for Corporate Events",
    description: "We offer premium catering services for corporate events, from breakfast meetings to formal dinners. Our menu can be customized to accommodate dietary restrictions and preferences.",
    createdBy: mockProviders[1].id,
    creatorType: 'provider',
    creatorName: mockProviders[1].name,
    creatorImage: mockProviders[1].profileImage,
    creatorRating: 0, // CRITICAL FIX: Set to 0
    creatorReviewCount: 0,
    location: mockProviders[1].location!,
    category: 'Traiteur',
    price: 45, // per person
    priceType: 'daily',
    images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop'],
    tags: ['Catering', 'Gourmet', 'Corporate'],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    status: 'active',
  },
  {
    id: '4',
    title: "Venue Available for Private Events",
    description: "Our beautiful restaurant with garden is available for private events. We can accommodate up to 80 guests and offer in-house catering and bar service.",
    createdBy: mockVenues[0].id,
    creatorType: 'business',
    creatorName: mockVenues[0].name,
    creatorImage: mockVenues[0].profileImage,
    creatorRating: 0, // CRITICAL FIX: Set to 0
    creatorReviewCount: 0,
    location: mockVenues[0].location!,
    category: 'Lieu',
    price: 3000,
    priceType: 'negotiable',
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop'],
    tags: ['Venue', 'Private Events', 'Garden'],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
    status: 'active',
  },
  {
    id: '5',
    title: "Professional Waitstaff for Wedding",
    description: "Team of professional waiters and waitresses available for a wedding reception. We provide impeccable service and can help with setup and cleanup.",
    createdBy: mockProviders[2].id,
    creatorType: 'provider',
    creatorName: mockProviders[2].name,
    creatorImage: mockProviders[2].profileImage,
    creatorRating: 0, // CRITICAL FIX: Set to 0
    creatorReviewCount: 0,
    location: mockProviders[2].location!,
    category: 'Personnel',
    price: 1200,
    priceType: 'negotiable',
    date: Date.now() + 86400000 * 45, // 45 days from now
    images: ['https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=800&auto=format&fit=crop'],
    tags: ['Waitstaff', 'Wedding', 'Service'],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    status: 'active',
  },
  {
    id: '6',
    title: "Historic Château Available for Weddings",
    description: "Our magnificent château is the perfect setting for your dream wedding. We offer exclusive use of the château and grounds, with accommodation for up to 30 guests.",
    createdBy: mockVenues[2].id,
    creatorType: 'business',
    creatorName: mockVenues[2].name,
    creatorImage: mockVenues[2].profileImage,
    creatorRating: 0, // CRITICAL FIX: Set to 0
    creatorReviewCount: 0,
    location: mockVenues[2].location!,
    category: 'Lieu',
    price: 12000,
    priceType: 'negotiable',
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop'],
    tags: ['Wedding', 'Château', 'Luxury'],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
    status: 'active',
  },
];

export const getListingsByCategory = (category: string) => {
  return mockListings.filter(listing => listing.category === category);
};

export const getListingsByLocation = (latitude: number, longitude: number, radiusInKm: number = 50) => {
  return mockListings.filter(listing => {
    // Simple distance calculation (not accounting for Earth's curvature)
    const distance = Math.sqrt(
      Math.pow(listing.location.latitude - latitude, 2) + 
      Math.pow(listing.location.longitude - longitude, 2)
    ) * 111; // Rough conversion to kilometers
    return distance <= radiusInKm;
  });
};