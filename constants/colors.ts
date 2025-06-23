// Modern Airbnb-inspired Color Palette
const Colors = {
  // Primary colors - Modern and clean
  primary: '#FF385C', // Airbnb red
  secondary: '#00A699', // Teal accent
  accent: '#FC642D', // Orange accent
  success: '#00A699', // Teal
  error: '#C13515', // Red error
  warning: '#FFB400', // Amber warning
  
  // Neutral grays - Clean and modern
  gray50: '#F7F7F7',
  gray100: '#F0F0F0',
  gray200: '#E0E0E0',
  gray300: '#C7C7C7',
  gray400: '#A0A0A0',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Backgrounds - Clean and minimal
  background: '#FFFFFF',
  backgroundAlt: '#F7F7F7',
  backgroundDark: '#171717',
  surface: '#FFFFFF',
  surfaceElevated: '#F7F7F7',
  
  // Text colors - High contrast and readable
  text: '#222222', // Airbnb dark text
  textLight: '#717171', // Airbnb light text
  textMuted: '#B0B0B0',
  textInverse: '#FFFFFF',
  
  // Borders - Subtle and clean
  border: '#DDDDDD', // Airbnb border
  borderLight: '#EBEBEB',
  borderDark: '#717171',
  
  // Interactive states
  hover: '#E31C5F', // Darker red
  pressed: '#D70466', // Even darker red
  disabled: '#B0B0B0',
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.9)',
  
  // Glass morphism colors
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(0, 0, 0, 0.1)',
  glassBlur: 'rgba(255, 255, 255, 0.05)',
  
} as const;

export default Colors;

// Modern gradient combinations
export const gradients = {
  primary: [Colors.primary, '#E31C5F'] as const,
  secondary: [Colors.secondary, '#008A80'] as const,
  accent: [Colors.accent, '#E8590C'] as const,
  success: [Colors.success, '#008A80'] as const,
  warning: [Colors.warning, '#E8590C'] as const,
  
  // Category specific gradients
  music: ['#FF385C', '#FC642D'] as const,
  catering: ['#FFB400', '#FC642D'] as const,
  venue: ['#00A699', '#008A80'] as const,
  staff: ['#FF385C', '#00A699'] as const,
  
  // Premium effects
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
  darkGlass: ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)'] as const,
  
  // Shimmer effects
  shimmer: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0)'] as const,
  shimmerDark: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)'] as const,
};