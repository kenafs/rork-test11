import { Provider, Venue } from '@/types';

export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'DJ Alex',
    email: 'dj.alex@example.com',
    phone: '+33612345678',
    profileImage: 'https://images.unsplash.com/photo-1601993236621-b7fd416e8e47?w=800&auto=format&fit=crop',
    userType: 'provider',
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
    },
    rating: 0, // FIXED: Set to 0
    reviewCount: 0,
    services: ['DJ', 'Sound Equipment', 'Lighting'],
    description: "Professional DJ with 10 years of experience in weddings, corporate events, and private parties. I bring high-quality sound equipment and can adapt to any musical style.",
    availability: ['Weekends', 'Evenings'],
    priceRange: {
      min: 300,
      max: 1200,
    },
    socialLinks: {
      instagram: 'https://instagram.com/djalex_official',
      website: 'https://djalex-events.com',
      facebook: 'https://facebook.com/djalex.events',
    },
    portfolio: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571266028243-d220c9c3b8c2?w=800&auto=format&fit=crop',
    ],
    createdAt: Date.now() - 86400000 * 120,
  },
  {
    id: '2',
    name: 'Cuisine Élégante',
    email: 'contact@cuisine-elegante.fr',
    phone: '+33698765432',
    profileImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop',
    userType: 'provider',
    location: {
      latitude: 48.8606,
      longitude: 2.3376,
      city: 'Paris',
    },
    rating: 0, // FIXED: Set to 0
    reviewCount: 0,
    services: ['Catering', 'Chef Service', 'Food Styling'],
    description: "Gourmet catering service specializing in French cuisine with a modern twist. We use locally-sourced ingredients and can accommodate dietary restrictions.",
    availability: ['All Week'],
    priceRange: {
      min: 500,
      max: 5000,
    },
    socialLinks: {
      instagram: 'https://instagram.com/cuisine_elegante',
      website: 'https://cuisine-elegante.fr',
    },
    portfolio: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&auto=format&fit=crop',
    ],
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: '3',
    name: 'Service Elite',
    email: 'staff@serviceelite.com',
    phone: '+33623456789',
    profileImage: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=800&auto=format&fit=crop',
    userType: 'provider',
    location: {
      latitude: 45.7640,
      longitude: 4.8357,
      city: 'Lyon',
    },
    rating: 0, // FIXED: Set to 0
    reviewCount: 0,
    services: ['Waitstaff', 'Bartenders', 'Event Coordination'],
    description: "Professional waitstaff and bartenders for any event. Our team is experienced, punctual, and provides exceptional service.",
    availability: ['Weekends', 'Evenings', 'Holidays'],
    priceRange: {
      min: 200,
      max: 1500,
    },
    socialLinks: {
      website: 'https://service-elite.com',
      linkedin: 'https://linkedin.com/company/service-elite',
    },
    portfolio: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop',
    ],
    createdAt: Date.now() - 86400000 * 60,
  },
];

export const mockVenues: Venue[] = [
  {
    id: '4',
    name: 'Le Jardin Secret',
    email: 'events@jardinsecret.fr',
    phone: '+33712345678',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
    userType: 'business',
    location: {
      latitude: 48.8744,
      longitude: 2.3526,
      city: 'Paris',
    },
    rating: 0, // FIXED: Set to 0
    reviewCount: 0,
    venueType: 'Restaurant with Garden',
    description: "A hidden gem in the heart of Paris with a beautiful garden terrace. Perfect for intimate gatherings and cocktail parties.",
    capacity: 80,
    amenities: ['Garden', 'Private Dining Room', 'Sound System', 'Wheelchair Access'],
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    ],
    socialLinks: {
      instagram: 'https://instagram.com/jardinsecret_paris',
      website: 'https://jardinsecret.fr',
      facebook: 'https://facebook.com/jardinsecretparis',
    },
    portfolio: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&auto=format&fit=crop',
    ],
    createdAt: Date.now() - 86400000 * 150,
  },
  {
    id: '5',
    name: 'Loft Industriel',
    email: 'bookings@loftindustriel.com',
    phone: '+33787654321',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
    userType: 'business',
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
    },
    rating: 0, // FIXED: Set to 0
    reviewCount: 0,
    venueType: 'Industrial Loft',
    description: "Spacious industrial loft with exposed brick walls and high ceilings. Ideal for corporate events, photo shoots, and private parties.",
    capacity: 150,
    amenities: ['Projector', 'Kitchen', 'Elevator', 'Rooftop Access'],
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    ],
    socialLinks: {
      website: 'https://loft-industriel.com',
      instagram: 'https://instagram.com/loft_industriel_paris',
    },
    portfolio: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop',
    ],
    createdAt: Date.now() - 86400000 * 100,
  },
  {
    id: '6',
    name: 'Château des Lumières',
    email: 'events@chateaudeslumieres.fr',
    phone: '+33723456789',
    profileImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
    userType: 'business',
    location: {
      latitude: 43.2965,
      longitude: 5.3698,
      city: 'Marseille',
    },
    rating: 0, // FIXED: Set to 0
    reviewCount: 0,
    venueType: 'Historic Château',
    description: "Magnificent 18th-century château surrounded by vineyards. Perfect for weddings, galas, and corporate retreats.",
    capacity: 250,
    amenities: ['Gardens', 'Swimming Pool', 'Parking', 'Accommodation'],
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    ],
    socialLinks: {
      website: 'https://chateau-des-lumieres.fr',
      instagram: 'https://instagram.com/chateau_des_lumieres',
      facebook: 'https://facebook.com/chateaudeslumieres',
    },
    portfolio: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop',
    ],
    createdAt: Date.now() - 86400000 * 200,
  },
];

export const getAllUsers = () => [...mockProviders, ...mockVenues];