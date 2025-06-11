import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SearchBarProps {
  value?: string;
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showLocationButton?: boolean;
  onLocationPress?: () => void;
}

export default function SearchBar({
  value: propValue,
  onSearch,
  onChangeText,
  onClear,
  placeholder = "Rechercher...",
  showLocationButton = false,
  onLocationPress,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const value = propValue !== undefined ? propValue : internalValue;
  
  const handleChangeText = (text: string) => {
    if (propValue === undefined) {
      setInternalValue(text);
    }
    if (onChangeText) {
      onChangeText(text);
    }
    if (onSearch) {
      onSearch(text);
    }
  };
  
  const handleClear = () => {
    if (propValue === undefined) {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch('');
    }
  };
  
  const handleSubmit = () => {
    if (onSearch) {
      onSearch(value);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          clearButtonMode="never"
        />
        
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      {showLocationButton && (
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={onLocationPress}
          activeOpacity={0.7}
        >
          <MapPin size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchContainerFocused: {
    borderColor: Colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  locationButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});