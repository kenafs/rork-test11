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
    focusScale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
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
            <Search size={20} color={isFocused ? Colors.primary : Colors.textLight} style={styles.searchIcon} />
            
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
                  <X size={16} color={Colors.textLight} />
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
            <MapPin size={20} color="#fff" />
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
    paddingVertical: 12,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginLeft: 8,
  },
  clearButtonBlur: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationGradient: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
});