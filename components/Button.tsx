import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  gradient?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
  gradient = true,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  // Determine button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'glass':
        return styles.glassButton;
      default:
        return styles.primaryButton;
    }
  };
  
  // Determine text styles based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'glass':
        return styles.glassText;
      default:
        return styles.primaryText;
    }
  };
  
  // Determine button size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };
  
  // Determine text size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };
  
  const renderButtonContent = () => (
    <View style={styles.buttonContent}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'glass' ? Colors.primary : '#fff'} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              getTextStyle(),
              getTextSizeStyle(),
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );
  
  if (variant === 'primary' && gradient) {
    return (
      <AnimatedTouchableOpacity
        style={[
          styles.button,
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <LinearGradient
          colors={disabled ? [Colors.border, Colors.border] : [Colors.primary, Colors.secondary]}
          style={[styles.gradientButton, getSizeStyle()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderButtonContent()}
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  }
  
  if (variant === 'glass') {
    return (
      <AnimatedTouchableOpacity
        style={[
          styles.button,
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <BlurView intensity={80} style={[styles.blurButton, getSizeStyle()]}>
          {renderButtonContent()}
        </BlurView>
      </AnimatedTouchableOpacity>
    );
  }
  
  return (
    <AnimatedTouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledButton,
        style,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {renderButtonContent()}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16, // FIXED: Reduced from 20 to 16
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // FIXED: Reduced shadow
    shadowOpacity: 0.2, // FIXED: Reduced opacity
    shadowRadius: 12, // FIXED: Reduced radius
    elevation: 8, // FIXED: Reduced elevation
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // FIXED: Reduced from 8 to 6
  },
  gradientButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  blurButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  smallButton: {
    paddingVertical: 10, // FIXED: Reduced from 12 to 10
    paddingHorizontal: 16, // FIXED: Reduced from 20 to 16
    borderRadius: 14, // FIXED: Reduced from 16 to 14
  },
  mediumButton: {
    paddingVertical: 14, // FIXED: Reduced from 16 to 14
    paddingHorizontal: 24, // FIXED: Reduced from 28 to 24
    borderRadius: 16, // FIXED: Reduced from 20 to 16
  },
  largeButton: {
    paddingVertical: 18, // FIXED: Reduced from 20 to 18
    paddingHorizontal: 32, // FIXED: Reduced from 36 to 32
    borderRadius: 20, // FIXED: Reduced from 24 to 20
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
    shadowOpacity: 0.05, // FIXED: Reduced from 0.1 to 0.05
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  glassText: {
    color: '#fff',
    fontWeight: '700',
  },
  smallText: {
    fontSize: 13, // FIXED: Reduced from 14 to 13
  },
  mediumText: {
    fontSize: 15, // FIXED: Reduced from 16 to 15
  },
  largeText: {
    fontSize: 17, // FIXED: Reduced from 18 to 17
  },
  disabledText: {
    color: Colors.textLight,
  },
});