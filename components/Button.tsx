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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
  
  // Gesture handling for premium interactions
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      opacity.value = withSpring(0.8, { damping: 15, stiffness: 300 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 300 });
      if (!disabled && !loading) {
        runOnJS(onPress)();
      }
    });
  
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
      <GestureDetector gesture={tapGesture}>
        <AnimatedTouchableOpacity
          style={[
            styles.button,
            getSizeStyle(),
            fullWidth && styles.fullWidth,
            disabled && styles.disabledButton,
            style,
            animatedStyle,
          ]}
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
      </GestureDetector>
    );
  }
  
  if (variant === 'glass') {
    return (
      <GestureDetector gesture={tapGesture}>
        <AnimatedTouchableOpacity
          style={[
            styles.button,
            getSizeStyle(),
            fullWidth && styles.fullWidth,
            disabled && styles.disabledButton,
            style,
            animatedStyle,
          ]}
          disabled={disabled || loading}
          activeOpacity={1}
        >
          <BlurView intensity={80} style={[styles.blurButton, getSizeStyle()]}>
            {renderButtonContent()}
          </BlurView>
        </AnimatedTouchableOpacity>
      </GestureDetector>
    );
  }
  
  return (
    <GestureDetector gesture={tapGesture}>
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
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {renderButtonContent()}
      </AnimatedTouchableOpacity>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  mediumButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  largeButton: {
    paddingVertical: 20,
    paddingHorizontal: 36,
    borderRadius: 24,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
    shadowOpacity: 0.1,
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
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: Colors.textLight,
  },
});