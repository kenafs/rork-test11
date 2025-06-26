// Modern Airbnb-inspired Color Palette - Clean and Minimal
const Colors = {
  // Primary colors - Airbnb inspired
  primary: '#FF385C', // Airbnb red
  secondary: '#00A699', // Teal accent
  accent: '#FC642D', // Orange accent
  success: '#00A699',
  error: '#C13515',
  warning: '#FFB400',
  
  // Neutral grays - Ultra clean
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Backgrounds - Pure and clean
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  backgroundDark: '#212121',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  
  // Text colors - Airbnb style
  text: '#222222',
  textLight: '#717171',
  textMuted: '#B0B0B0',
  textInverse: '#FFFFFF',
  
  // Borders - Minimal
  border: '#EEEEEE',
  borderLight: '#F5F5F5',
  borderDark: '#E0E0E0',
  
  // Interactive states
  hover: '#E31C5F',
  pressed: '#D70466',
  disabled: '#E0E0E0',
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.16)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(255, 255, 255, 0.95)',
  
} as const;

export default Colors;

export const gradients = {
  primary: [Colors.primary, '#E31C5F'] as const,
  secondary: [Colors.secondary, '#008A80'] as const,
  accent: [Colors.accent, '#E8590C'] as const,
  success: [Colors.success, '#008A80'] as const,
  warning: [Colors.warning, '#E8590C'] as const,
  
  // Subtle gradients for modern look
  subtle: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
};