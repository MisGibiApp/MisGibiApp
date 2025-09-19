import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to Welcome screen
    const timer = setTimeout(() => {
      router.replace("/auth/Welcome");
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
}
