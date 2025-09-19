// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/Welcome" />
      <Stack.Screen name="auth/cleaner-login" />
      <Stack.Screen name="auth/customer-login" />
      <Stack.Screen name="auth/cleaner-signup" />
      <Stack.Screen name="auth/customer-signup" />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="offer" />
    </Stack>
  );
}
