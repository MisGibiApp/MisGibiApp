import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function RootRedirect() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Stack mount olduktan sonra yönlendir
    if (ready) {
      router.replace("/auth/Welcome");
    }
  }, [ready]);

  useEffect(() => {
    setReady(true);
  }, []);

  return <View />;
}
