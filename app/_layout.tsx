// app/_layout.tsx
import { Slot, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/Welcome" />
      <Stack.Screen name="auth/cleaner-login" />
      <Stack.Screen name="auth/customer-login" />
      <Stack.Screen name="tabs" />
      {/* Slot ekliyoruz */}
      <Slot />
    </Stack>
  );
}
