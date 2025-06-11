export default {
  primary: '#6366F1', // Modern indigo
  secondary: '#8B5CF6', // Purple
  accent: '#F59E0B', // Amber
  success: '#10B981', // Emerald
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  surface: '#FFFFFF',
  
  text: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Event-themed colors
  party: '#EC4899', // Pink
  celebration: '#06B6D4', // Cyan
  elegant: '#8B5CF6', // Purple
  festive: '#10B981', // Emerald
  luxury: '#F59E0B', // Amber
  
  // Fun vibrant colors for event app
  neonPink: '#FF1493',
  electricBlue: '#00BFFF',
  vibrantOrange: '#FF6B35',
  limeGreen: '#32CD32',
  hotPink: '#FF69B4',
  turquoise: '#40E0D0',
  coral: '#FF7F50',
  
  // Gradients - properly typed as const tuples
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
  
  // Card colors with more vibrant options
  cardPrimary: '#6366F1',
  cardSecondary: '#EC4899',
  cardTertiary: '#10B981',
  cardQuaternary: '#F59E0B',
  cardVibrant1: '#FF1493',
  cardVibrant2: '#00BFFF',
  cardVibrant3: '#FF6B35',
  cardVibrant4: '#32CD32',
} as const;

// Gradient combinations as const tuples
export const gradients = {
  music: ['#FF1493', '#FF69B4'] as const,
  catering: ['#FF6B35', '#FF7F50'] as const,
  venue: ['#00BFFF', '#40E0D0'] as const,
  staff: ['#10B981', '#32CD32'] as const,
  primary: ['#6366F1', '#8B5CF6'] as const,
  secondary: ['#8B5CF6', '#EC4899'] as const,
};