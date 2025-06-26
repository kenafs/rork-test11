import React from "react";
import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 16,
          paddingTop: 12,
          backgroundColor: Colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 16,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          marginHorizontal: 0,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: Colors.background,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: Colors.text,
          letterSpacing: -0.3,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
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
              size={focused ? 26 : 22}
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
              size={focused ? 26 : 22}
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
              size={focused ? 26 : 22}
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
              size={focused ? 26 : 22}
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
              size={focused ? 26 : 22}
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