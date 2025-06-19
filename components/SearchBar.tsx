import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onLocationPress?: () => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  showLocationButton?: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  onLocationPress,
  onSearch,
  placeholder = "Rechercher...",
  showLocationButton = true,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusScale = useSharedValue(1);
  const focusOpacity = useSharedValue(0);
  
  const handleSubmit = () => {
    if (onSearch) {
      onSearch(value);
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.01, { damping: 15, stiffness: 300 });
    focusOpacity.value = withTiming(1, { duration: 200 });
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    focusOpacity.value = withTiming(0, { duration: 200 });
  };
  
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: focusScale.value }],
    };
  });
  
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: focusOpacity.value,
    };
  });
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchWrapper, animatedContainerStyle]}>
        {/* Glow Effect */}
        <Animated.View style={[styles.glowEffect, animatedGlowStyle]} />
        
        <BlurView intensity={20} style={styles.searchContainer}>
          <View style={styles.searchInner}>
            <Search size={18} color={isFocused ? Colors.primary : Colors.textLight} style={styles.searchIcon} />
            
            <AnimatedTextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={Colors.textLight}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={handleSubmit}
              returnKeyType="search"
              clearButtonMode="never"
            />
            
            {value.length > 0 && (
              <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                <BlurView intensity={40} style={styles.clearButtonBlur}>
                  <X size={14} color={Colors.textLight} />
                </BlurView>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </Animated.View>
      
      {showLocationButton && (
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={onLocationPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.locationGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MapPin size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10, // FIXED: Reduced from 12 to 10
    gap: 10, // FIXED: Reduced from 12 to 10
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -3, // FIXED: Reduced from -4 to -3
    left: -3, // FIXED: Reduced from -4 to -3
    right: -3, // FIXED: Reduced from -4 to -3
    bottom: -3, // FIXED: Reduced from -4 to -3
    borderRadius: 16, // FIXED: Reduced from 20 to 16
    backgroundColor: Colors.primary,
    opacity: 0.2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10, // FIXED: Reduced from 12 to 10
    elevation: 6, // FIXED: Reduced from 8 to 6
  },
  searchContainer: {
    borderRadius: 14, // FIXED: Reduced from 16 to 14
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 }, // FIXED: Reduced shadow
    shadowOpacity: 0.12, // FIXED: Reduced opacity
    shadowRadius: 10, // FIXED: Reduced radius
    elevation: 6, // FIXED: Reduced elevation
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, // FIXED: Reduced from 16 to 14
    paddingVertical: 10, // FIXED: Reduced from 12 to 10
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchIcon: {
    marginRight: 10, // FIXED: Reduced from 12 to 10
  },
  input: {
    flex: 1,
    fontSize: 15, // FIXED: Reduced from 16 to 15
    color: Colors.text,
    fontWeight: '500',
  },
  clearButton: {
    width: 24, // FIXED: Reduced from 28 to 24
    height: 24, // FIXED: Reduced from 28 to 24
    borderRadius: 12, // FIXED: Reduced from 14 to 12
    overflow: 'hidden',
    marginLeft: 6, // FIXED: Reduced from 8 to 6
  },
  clearButtonBlur: {
    width: 24, // FIXED: Reduced from 28 to 24
    height: 24, // FIXED: Reduced from 28 to 24
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    width: 44, // FIXED: Reduced from 52 to 44
    height: 44, // FIXED: Reduced from 52 to 44
    borderRadius: 14, // FIXED: Reduced from 16 to 14
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 }, // FIXED: Reduced shadow
    shadowOpacity: 0.25, // FIXED: Reduced opacity
    shadowRadius: 6, // FIXED: Reduced radius
    elevation: 6, // FIXED: Reduced elevation
  },
  locationGradient: {
    width: 44, // FIXED: Reduced from 52 to 44
    height: 44, // FIXED: Reduced from 52 to 44
    justifyContent: 'center',
    alignItems: 'center',
  },
});