export default {
  // Modern Navy Blue Theme - Elegant and Professional
  primary: '#1E3A8A', // Deep navy blue
  secondary: '#3B82F6', // Bright blue
  accent: '#F59E0B', // Warm amber
  success: '#10B981', // Emerald
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  
  // Navy variations
  navyDark: '#0F172A', // Very dark navy
  navyMedium: '#1E293B', // Medium navy
  navyLight: '#334155', // Light navy
  navyPale: '#64748B', // Pale navy
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  
  // Text colors
  text: '#0F172A',
  textLight: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#334155',
  
  // Event-themed colors with navy undertones
  party: '#EC4899', // Pink
  celebration: '#06B6D4', // Cyan
  elegant: '#8B5CF6', // Purple
  festive: '#10B981', // Emerald
  luxury: '#F59E0B', // Amber
  
  // Premium navy gradients
  gradientNavyStart: '#1E3A8A',
  gradientNavyEnd: '#3B82F6',
  gradientDarkStart: '#0F172A',
  gradientDarkEnd: '#1E293B',
  
  // Card colors with navy theme
  cardPrimary: '#1E3A8A',
  cardSecondary: '#3B82F6',
  cardTertiary: '#10B981',
  cardQuaternary: '#F59E0B',
  cardElegant: '#8B5CF6',
  cardLuxury: '#EC4899',
  
  // Interactive states
  hover: '#1E40AF',
  pressed: '#1D4ED8',
  disabled: '#94A3B8',
  
  // Shadows and overlays
  shadow: 'rgba(15, 23, 42, 0.1)',
  shadowDark: 'rgba(15, 23, 42, 0.3)',
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(248, 250, 252, 0.9)',
  
} as const;

// Premium gradient combinations
export const gradients = {
  primary: ['#1E3A8A', '#3B82F6'] as const,
  secondary: ['#3B82F6', '#06B6D4'] as const,
  dark: ['#0F172A', '#1E293B'] as const,
  elegant: ['#8B5CF6', '#EC4899'] as const,
  success: ['#10B981', '#06B6D4'] as const,
  warning: ['#F59E0B', '#EF4444'] as const,
  
  // Category specific gradients
  music: ['#8B5CF6', '#EC4899'] as const,
  catering: ['#F59E0B', '#EF4444'] as const,
  venue: ['#06B6D4', '#3B82F6'] as const,
  staff: ['#10B981', '#06B6D4'] as const,
  
  // Premium effects
  glass: ['rgba(248, 250, 252, 0.1)', 'rgba(248, 250, 252, 0.05)'] as const,
  darkGlass: ['rgba(15, 23, 42, 0.1)', 'rgba(15, 23, 42, 0.05)'] as const,
};