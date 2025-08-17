// app/tabs/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4e73df",
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Ana Sayfa", // index yerine gösterilen yazı
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: "Profil", // explore yerine gösterilecek yazı
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Diğer tablar buraya eklenebilir */}
    </Tabs>
  );
}
