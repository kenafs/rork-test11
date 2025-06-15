import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import Colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
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
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: Colors.primary,
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: Colors.backgroundAlt,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
            name="listing/[id]" 
            options={{ 
              title: "Détail de l'annonce",
              headerBackTitle: "Retour",
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
            name="create-listing" 
            options={{ 
              title: "Créer une annonce",
              headerBackTitle: "Retour",
              presentation: "modal",
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}