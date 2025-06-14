export const categories = [
  { id: 'dj', name: 'DJ', icon: '🎧' },
  { id: 'catering', name: 'Traiteur', icon: '🍽️' },
  { id: 'photography', name: 'Photographe', icon: '📸' },
  { id: 'venue', name: 'Lieu', icon: '🏛️' },
  { id: 'decoration', name: 'Décoration', icon: '🎨' },
  { id: 'music', name: 'Musique', icon: '🎵' },
  { id: 'entertainment', name: 'Animation', icon: '🎭' },
  { id: 'flowers', name: 'Fleurs', icon: '💐' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'security', name: 'Sécurité', icon: '🛡️' },
  { id: 'cleaning', name: 'Nettoyage', icon: '🧹' },
  { id: 'equipment', name: 'Matériel', icon: '🔧' },
  { id: 'staff', name: 'Personnel', icon: '👥' },
];

export const listingCategories = [
  { id: 'all', name: 'Tous' },
  { id: 'dj', name: 'DJ' },
  { id: 'catering', name: 'Traiteur' },
  { id: 'photography', name: 'Photographe' },
  { id: 'venue', name: 'Lieu' },
  { id: 'decoration', name: 'Décoration' },
  { id: 'music', name: 'Musique' },
  { id: 'entertainment', name: 'Animation' },
  { id: 'flowers', name: 'Fleurs' },
  { id: 'transport', name: 'Transport' },
  { id: 'security', name: 'Sécurité' },
  { id: 'cleaning', name: 'Nettoyage' },
  { id: 'equipment', name: 'Matériel' },
  { id: 'staff', name: 'Personnel' },
];

export const categoryMap: { [key: string]: string } = {
  'all': 'Tous',
  'dj': 'DJ',
  'catering': 'Traiteur',
  'photography': 'Photographe',
  'venue': 'Lieu',
  'decoration': 'Décoration',
  'music': 'Musique',
  'entertainment': 'Animation',
  'flowers': 'Fleurs',
  'transport': 'Transport',
  'security': 'Sécurité',
  'cleaning': 'Nettoyage',
  'equipment': 'Matériel',
  'staff': 'Personnel',
};

export const businessCategories = [
  { id: 'restaurant', name: 'Restaurant' },
  { id: 'hotel', name: 'Hôtel' },
  { id: 'venue', name: 'Salle de réception' },
  { id: 'bar', name: 'Bar/Pub' },
  { id: 'club', name: 'Boîte de nuit' },
  { id: 'outdoor', name: 'Espace extérieur' },
  { id: 'cultural', name: 'Lieu culturel' },
  { id: 'sports', name: 'Complexe sportif' },
];

// Category mapping for filtering - handles both French and English categories
export const getCategoryFilter = (selectedCategory: string | null, listingCategory: string): boolean => {
  if (!selectedCategory || selectedCategory === 'Tous' || selectedCategory === 'all') {
    return true;
  }
  
  // Direct match
  if (listingCategory === selectedCategory) {
    return true;
  }
  
  // Case insensitive match
  if (listingCategory.toLowerCase() === selectedCategory.toLowerCase()) {
    return true;
  }
  
  // Map French to English and check
  const frenchToEnglish: { [key: string]: string } = {
    'DJ': 'DJ',
    'Traiteur': 'Catering',
    'Photographe': 'Photography',
    'Lieu': 'Venue',
    'Décoration': 'Decoration',
    'Musique': 'Music',
    'Animation': 'Entertainment',
    'Fleurs': 'Flowers',
    'Transport': 'Transport',
    'Sécurité': 'Security',
    'Nettoyage': 'Cleaning',
    'Matériel': 'Equipment',
    'Personnel': 'Staff',
  };
  
  // Map English to French and check
  const englishToFrench: { [key: string]: string } = {
    'DJ': 'DJ',
    'Catering': 'Traiteur',
    'Photography': 'Photographe',
    'Venue': 'Lieu',
    'Decoration': 'Décoration',
    'Music': 'Musique',
    'Entertainment': 'Animation',
    'Flowers': 'Fleurs',
    'Transport': 'Transport',
    'Security': 'Sécurité',
    'Cleaning': 'Nettoyage',
    'Equipment': 'Matériel',
    'Staff': 'Personnel',
  };
  
  // Check if selected category maps to listing category
  const mappedToEnglish = frenchToEnglish[selectedCategory];
  const mappedToFrench = englishToFrench[selectedCategory];
  
  if (mappedToEnglish && listingCategory === mappedToEnglish) {
    return true;
  }
  
  if (mappedToFrench && listingCategory === mappedToFrench) {
    return true;
  }
  
  // Check reverse mapping
  const listingMappedToFrench = englishToFrench[listingCategory];
  const listingMappedToEnglish = frenchToEnglish[listingCategory];
  
  if (listingMappedToFrench && selectedCategory === listingMappedToFrench) {
    return true;
  }
  
  if (listingMappedToEnglish && selectedCategory === listingMappedToEnglish) {
    return true;
  }
  
  return false;
};