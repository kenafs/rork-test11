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
          }}
        >
          {/* CRITICAL FIX: Landing page - always show first unless authenticated */}
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
            }} 
          />
          
          {/* Tabs - show if authenticated */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          {/* Auth screens */}
          <Stack.Screen 
            name="(auth)/login" 
            options={{ 
              title: "Connexion",
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="(auth)/register" 
            options={{ 
              title: "Inscription",
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="(auth)/demo" 
            options={{ 
              title: "Comptes démo",
              headerShown: false,
            }} 
          />
          
          {/* Other screens */}
          <Stack.Screen 
            name="listing/[id]" 
            options={{ 
              title: "Détail de l'annonce",
              headerBackTitle: "Retour",
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="profile/[id]" 
            options={{ 
              title: "Profil",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="create-quote/[listingId]" 
            options={{ 
              title: "Créer un devis",
              headerBackTitle: "Retour",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="conversation/[id]" 
            options={{ 
              title: "Conversation",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="conversation/new" 
            options={{ 
              title: "Nouvelle conversation",
              headerBackTitle: "Retour",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="favorites" 
            options={{ 
              title: "Mes favoris",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="quotes" 
            options={{ 
              title: "Mes devis",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="my-listings" 
            options={{ 
              title: "Mes annonces",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="reviews" 
            options={{ 
              title: "Avis et notes",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: "Paramètres",
              headerBackTitle: "Retour",
            }} 
          />
          <Stack.Screen 
            name="edit-profile" 
            options={{ 
              title: "Modifier le profil",
              headerBackTitle: "Retour",
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}