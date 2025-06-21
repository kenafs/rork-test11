import React from "react";
import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Platform } from "react-native";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 85 : 70, // FIXED: Reduced heights
          paddingBottom: Platform.OS === 'ios' ? 30 : 16, // FIXED: Reduced padding
          paddingTop: 12, // FIXED: Reduced from 16 to 12
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 }, // FIXED: Reduced shadow
          shadowOpacity: 0.12, // FIXED: Reduced opacity
          shadowRadius: 16, // FIXED: Reduced radius
          elevation: 16, // FIXED: Reduced elevation
          borderTopLeftRadius: 20, // FIXED: Reduced from 24 to 20
          borderTopRightRadius: 20, // FIXED: Reduced from 24 to 20
          position: 'absolute',
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 0 : 16,
          // Enhanced glass morphism effect
          backdropFilter: 'blur(20px)',
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={80} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 20, // FIXED: Reduced from 24 to 20
              borderTopRightRadius: 20, // FIXED: Reduced from 24 to 20
              overflow: 'hidden',
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 10, // FIXED: Reduced from 11 to 10
          fontWeight: '700',
          marginTop: 4, // FIXED: Reduced from 6 to 4
        },
        tabBarIconStyle: {
          marginTop: 3, // FIXED: Reduced from 4 to 3
        },
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18, // FIXED: Reduced from 20 to 18
          color: Colors.text,
        },
        // Enhanced tab bar item styling
        tabBarItemStyle: {
          borderRadius: 14, // FIXED: Reduced from 16 to 14
          marginHorizontal: 3, // FIXED: Reduced from 4 to 3
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={focused ? 26 : 22} // FIXED: Reduced sizes
              color={color} 
              fill={focused ? color : 'transparent'}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color, focused }) => (
            <Search 
              size={focused ? 26 : 22} // FIXED: Reduced sizes
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Publier",
          tabBarIcon: ({ color, focused }) => (
            <PlusCircle 
              size={focused ? 26 : 22} // FIXED: Reduced sizes
              color={color}
              fill={focused ? color : 'transparent'}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle 
              size={focused ? 26 : 22} // FIXED: Reduced sizes
              color={color}
              fill={focused ? color : 'transparent'}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <User 
              size={focused ? 26 : 22} // FIXED: Reduced sizes
              color={color}
              fill={focused ? color : 'transparent'}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}