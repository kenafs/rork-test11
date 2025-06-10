import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { UserType } from '@/types';
import Colors from '@/constants/colors';

interface UserTypeSelectorProps {
  selectedType: UserType | null;
  onSelect: (type: UserType) => void;
}

export default function UserTypeSelector({ selectedType, onSelect }: UserTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          selectedType === 'provider' && styles.selectedOption,
        ]}
        onPress={() => onSelect('provider')}
        activeOpacity={0.8}
      >
        <View style={[
          styles.radioButton,
          selectedType === 'provider' && styles.selectedRadioButton,
        ]}>
          {selectedType === 'provider' && <View style={styles.radioButtonInner} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            selectedType === 'provider' && styles.selectedTitle,
          ]}>
            Prestataire
          </Text>
          <Text style={styles.description}>
            DJ, traiteur, serveur, photographe...
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.option,
          selectedType === 'venue' && styles.selectedOption,
        ]}
        onPress={() => onSelect('venue')}
        activeOpacity={0.8}
      >
        <View style={[
          styles.radioButton,
          selectedType === 'venue' && styles.selectedRadioButton,
        ]}>
          {selectedType === 'venue' && <View style={styles.radioButtonInner} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            selectedType === 'venue' && styles.selectedTitle,
          ]}>
            Établissement
          </Text>
          <Text style={styles.description}>
            Restaurant, bar, salle de réception...
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(10, 36, 99, 0.05)',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedRadioButton: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedTitle: {
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
  },
});