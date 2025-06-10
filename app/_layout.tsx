import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="conversation/new" options={{ headerShown: false }} />
      <Stack.Screen name="create-quote/[listingId]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="favorites" options={{ headerShown: false }} />
      <Stack.Screen name="reviews" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}