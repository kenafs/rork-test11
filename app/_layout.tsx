import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="create-quote/[listingId]" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="reviews" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}