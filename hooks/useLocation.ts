import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    city: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        setLocation(prev => ({ ...prev, error: 'Location permission denied' }));
      }
    } catch (error) {
      setLocation(prev => ({ ...prev, error: 'Error requesting location permission' }));
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Use browser geolocation API for web
        navigator.geolocation.getCurrentPosition(
          position => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: null, // We'd need a reverse geocoding service for web
              error: null,
            });
            setIsLoading(false);
          },
          error => {
            setLocation(prev => ({ ...prev, error: error.message }));
            setIsLoading(false);
          }
        );
      } else {
        // Use Expo Location for native platforms
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocation(prev => ({ ...prev, error: 'Location permission not granted' }));
          setIsLoading(false);
          return;
        }
        
        const position = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = position.coords;
        
        // Get city name through reverse geocoding
        const [geocodedLocation] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        setLocation({
          latitude,
          longitude,
          city: geocodedLocation?.city || null,
          error: null,
        });
      }
    } catch (error) {
      setLocation(prev => ({ ...prev, error: 'Error getting location' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check permission status on mount
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        getCurrentLocation();
      }
    })();
  }, []);

  // Computed properties for backward compatibility
  const hasPermission = permissionStatus === 'granted';

  return {
    ...location,
    isLoading,
    permissionStatus,
    hasPermission,
    requestPermission,
    getCurrentLocation,
  };
}