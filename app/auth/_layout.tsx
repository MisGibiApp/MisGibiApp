// app/auth/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="Welcome">
      <Stack.Screen name="Welcome" options={{ headerShown: false }} />
      <Stack.Screen name="cleaner-login" options={{ headerShown: false }} />
      <Stack.Screen name="cleaner-signup" options={{ headerShown: false }} />
      <Stack.Screen name="customer-login" options={{ headerShown: false }} />
      <Stack.Screen name="customer-signup" options={{ headerShown: false }} />
    </Stack>
  );
}
