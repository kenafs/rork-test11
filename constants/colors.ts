// Modern Airbnb-inspired Color Palette - Clean and Minimal with Dark Mode Support
const lightColors = {
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

const darkColors = {
  // Primary colors - Airbnb inspired (same as light)
  primary: '#FF385C',
  secondary: '#00A699',
  accent: '#FC642D',
  success: '#00A699',
  error: '#FF6B6B',
  warning: '#FFD93D',
  
  // Neutral grays - Dark theme
  gray50: '#1A1A1A',
  gray100: '#2D2D2D',
  gray200: '#404040',
  gray300: '#525252',
  gray400: '#737373',
  gray500: '#A3A3A3',
  gray600: '#D4D4D4',
  gray700: '#E5E5E5',
  gray800: '#F5F5F5',
  gray900: '#FFFFFF',
  
  // Backgrounds - Dark theme
  background: '#000000',
  backgroundAlt: '#1A1A1A',
  backgroundDark: '#000000',
  surface: '#1A1A1A',
  surfaceElevated: '#2D2D2D',
  
  // Text colors - Dark theme
  text: '#FFFFFF',
  textLight: '#A3A3A3',
  textMuted: '#737373',
  textInverse: '#000000',
  
  // Borders - Dark theme
  border: '#404040',
  borderLight: '#2D2D2D',
  borderDark: '#525252',
  
  // Interactive states
  hover: '#FF5A75',
  pressed: '#FF1A3D',
  disabled: '#404040',
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.8)',
} as const;

// Function to get colors based on theme
export const getColors = (isDark: boolean = false) => {
  return isDark ? darkColors : lightColors;
};

// Default export for backward compatibility
const Colors = lightColors;
export default Colors;

export const gradients = {
  primary: [lightColors.primary, '#E31C5F'] as const,
  secondary: [lightColors.secondary, '#008A80'] as const,
  accent: [lightColors.accent, '#E8590C'] as const,
  success: [lightColors.success, '#008A80'] as const,
  warning: [lightColors.warning, '#E8590C'] as const,
  
  // Subtle gradients for modern look
  subtle: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
  
  // Dark theme gradients
  darkSubtle: ['rgba(26, 26, 26, 0.9)', 'rgba(26, 26, 26, 0.7)'] as const,
  darkGlass: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const,
};

export const getDarkGradients = (isDark: boolean = false) => {
  if (isDark) {
    return {
      primary: [darkColors.primary, '#E31C5F'] as const,
      secondary: [darkColors.secondary, '#008A80'] as const,
      accent: [darkColors.accent, '#E8590C'] as const,
      success: [darkColors.success, '#008A80'] as const,
      warning: [darkColors.warning, '#E8590C'] as const,
      subtle: gradients.darkSubtle,
      glass: gradients.darkGlass,
    };
  }
  return gradients;
};