import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

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
  
  const handleLocationPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLocationPress?.();
  };
  
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: focusScale.value }],
    };
  });
  
  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolate(
      focusOpacity.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      borderColor: `rgba(255, 56, 92, ${borderColor * 0.3})`,
      borderWidth: 1 + borderColor,
    };
  });
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchWrapper, animatedContainerStyle]}>
        <Animated.View style={[styles.searchContainer, animatedBorderStyle]}>
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
        </Animated.View>
      </Animated.View>
      
      {showLocationButton && (
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleLocationPress}
          activeOpacity={0.8}
        >
          <MapPin size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: Colors.background,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});