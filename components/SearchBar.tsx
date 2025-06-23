import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        <Animated.View style={[styles.glowEffect, animatedGlowStyle]} />
        
        <View style={styles.searchContainer}>
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
                <X size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
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
    borderRadius: 24,
    backgroundColor: Colors.primary,
    opacity: 0.1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  searchContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#fff',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  locationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  locationGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});