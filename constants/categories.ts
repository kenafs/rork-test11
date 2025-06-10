export const CATEGORIES = [
  {
    id: 'dj_services',
    name: 'Services DJ',
    icon: '🎵',
    subcategories: [
      'DJ Mariage',
      'DJ Soirée',
      'DJ Entreprise',
      'DJ Bar/Club',
      'Animation musicale'
    ]
  },
  {
    id: 'catering',
    name: 'Traiteur',
    icon: '🍽️',
    subcategories: [
      'Traiteur Mariage',
      'Traiteur Entreprise',
      'Buffet',
      'Cocktail dinatoire',
      'Service à table'
    ]
  },
  {
    id: 'venue_rental',
    name: 'Location de Lieu',
    icon: '🏛️',
    subcategories: [
      'Salle de réception',
      'Château',
      'Restaurant privatisé',
      'Loft',
      'Jardin/Terrasse'
    ]
  },
  {
    id: 'staff_services',
    name: 'Services de Personnel',
    icon: '👥',
    subcategories: [
      'Serveurs',
      'Barman',
      'Hôtesses',
      'Sécurité',
      'Photographe'
    ]
  },
  {
    id: 'decoration',
    name: 'Décoration',
    icon: '🎨',
    subcategories: [
      'Fleuriste',
      'Décoration florale',
      'Éclairage',
      'Mobilier',
      'Thématique'
    ]
  },
  {
    id: 'entertainment',
    name: 'Animation',
    icon: '🎭',
    subcategories: [
      'Magicien',
      'Groupe de musique',
      'Danseurs',
      'Spectacle',
      'Jeux'
    ]
  }
];

export const getCategoryById = (id: string) => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryName = (id: string) => {
  const category = getCategoryById(id);
  return category ? category.name : id;
};