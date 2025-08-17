import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Welcome() {
  const router = useRouter();

  // Animasyon için
  const fadeAnim = useRef(new Animated.Value(0)).current; // opacity 0'dan başlar
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // küçük başlar

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Arka plan video */}
      <Video
        source={require("../../assets/cleaner-bg.mp4")}
        style={StyleSheet.absoluteFillObject}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Şık ve hafif transparan başlık */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Text style={styles.title}>MisGibi App’e Hoş Geldin!</Text>
        </Animated.View>

        {/* Butonlar */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/auth/cleaner-login")}
        >
          <Text style={styles.buttonText}>Temizlikçi Olarak Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/auth/customer-login")}
        >
          <Text style={styles.buttonText}>Müşteri Olarak Giriş Yap</Text>
        </TouchableOpacity>

        {/* Keşfet Butonu (Sade ve net) */}
        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => router.push("/tabs")}
          accessibilityRole="button"
          accessibilityLabel="Keşfet"
          testID="discover-button"
        >
          <Text style={styles.discoverText}>Keşfet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // ön plan butonları için hafif karartma
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "rgba(255,255,255,0.9)", // hafif transparan
    textShadowColor: "rgba(0,0,0,0.6)", // arka planla kaybolmasın
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#4e81dfff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  discoverButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 8,
    minWidth: 160,
    alignItems: "center",
  },
  discoverText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 16,
  },
});
