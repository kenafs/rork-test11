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
          height: Platform.OS === 'ios' ? 90 : 75,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          paddingTop: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
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
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: 'hidden',
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: Colors.text,
        },
        // Enhanced tab bar item styling
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
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
              size={focused ? 28 : 24} 
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
              size={focused ? 28 : 24} 
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
              size={focused ? 28 : 24} 
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
              size={focused ? 28 : 24} 
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
              size={focused ? 28 : 24} 
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