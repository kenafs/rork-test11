import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import Colors from "@/constants/colors";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={Colors.primary} />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 18,
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: Colors.backgroundAlt,
              },
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          >
            {/* CRITICAL FIX: Landing page - always show first unless authenticated */}
            <Stack.Screen 
              name="index" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
            
            {/* Tabs - show if authenticated */}
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_bottom',
              }} 
            />
            
            {/* Auth screens */}
            <Stack.Screen 
              name="(auth)/login" 
              options={{ 
                title: "Connexion",
                headerShown: false,
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="(auth)/register" 
              options={{ 
                title: "Inscription",
                headerShown: false,
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="(auth)/demo" 
              options={{ 
                title: "Comptes démo",
                headerShown: false,
                animation: 'slide_from_right',
              }} 
            />
            
            {/* Other screens */}
            <Stack.Screen 
              name="listing/[id]" 
              options={{ 
                title: "Détail de l'annonce",
                headerBackTitle: "Retour",
                headerShown: false,
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="profile/[id]" 
              options={{ 
                title: "Profil",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="create-quote/[listingId]" 
              options={{ 
                title: "Créer un devis",
                headerBackTitle: "Retour",
                presentation: "modal",
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="conversation/[id]" 
              options={{ 
                title: "Conversation",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="conversation/new" 
              options={{ 
                title: "Nouvelle conversation",
                headerBackTitle: "Retour",
                presentation: "modal",
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="favorites" 
              options={{ 
                title: "Mes favoris",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="quotes" 
              options={{ 
                title: "Mes devis",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="my-listings" 
              options={{ 
                title: "Mes annonces",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="reviews" 
              options={{ 
                title: "Avis et notes",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ 
                title: "Paramètres",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="edit-profile" 
              options={{ 
                title: "Modifier le profil",
                headerBackTitle: "Retour",
                animation: 'slide_from_right',
              }} 
            />
          </Stack>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}