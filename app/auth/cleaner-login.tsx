import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ⚠️ Expo Go (gerçek cihaz) için PC'nizin LAN IP'sini yazın (ipconfig → IPv4)
// Örn: const API = "http://192.168.1.34:4000";
const API = "http://127.0.0.1:4000";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ↙️ varsayılan: Temizlikçi
  const [role, setRole] = useState<"customer" | "cleaner">("cleaner");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen e-posta ve şifre girin.");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Hata", data?.error || "Giriş başarısız");
        return;
      }

      // sunucudan gelen role ile eşitle
      setRole(data.user.role);

      await AsyncStorage.multiSet([
        ["loggedIn", "true"],
        ["token", data.token],
        ["userId", data.user.id],
        ["userRole", data.user.role], // "cleaner" | "customer"
        ["userEmail", data.user.email],
        ["userName", data.user.name ?? ""],
      ]);

      router.replace("/tabs");
    } catch (e) {
      Alert.alert(
        "Hata",
        "Sunucuya bağlanılamadı. (Ağ / IP ayarını kontrol et)"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require("../../assets/cleaner-bg.mp4")}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
      />

      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          onPress={() => router.replace("/auth/Welcome")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>

        {/* Rol Seçim Butonları */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "cleaner" && styles.roleButtonSelected,
            ]}
            onPress={() => setRole("cleaner")}
          >
            <Text
              style={[
                styles.roleText,
                role === "cleaner" && styles.roleTextSelected,
              ]}
            >
              Temizlikçi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "customer" && styles.roleButtonSelected,
            ]}
            onPress={() => setRole("customer")}
          >
            <Text
              style={[
                styles.roleText,
                role === "customer" && styles.roleTextSelected,
              ]}
            >
              Müşteri
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Text style={styles.title}>MisGibi App’e Hoş Geldin!</Text>
        </Animated.View>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            role === "customer"
              ? router.push("/auth/customer-signup")
              : router.push("/auth/cleaner-signup")
          }
        >
          <Text style={styles.signupText}>Hesabın yok mu? Kayıt Ol</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonText: { fontSize: 16, color: "#4e81dfff" },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    zIndex: 10,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
    marginHorizontal: 5,
    backgroundColor: "transparent",
  },
  roleButtonSelected: { backgroundColor: "#4e73df", borderColor: "#4e73df" },
  roleText: { color: "#fff", fontWeight: "600" },
  roleTextSelected: { color: "#fff" },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#4e73df",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  signupText: { color: "#4e73df", fontSize: 14, marginTop: 5 },
});
