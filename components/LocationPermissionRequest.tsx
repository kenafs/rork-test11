import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LocationPermissionRequestProps {
  onRequestPermission: () => void;
}

export default function LocationPermissionRequest({ onRequestPermission }: LocationPermissionRequestProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={32} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Activez la localisation</Text>
      <Text style={styles.description}>
        Pour vous montrer les annonces et prestataires près de chez vous, nous avons besoin de votre position.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={onRequestPermission}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Activer la localisation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});