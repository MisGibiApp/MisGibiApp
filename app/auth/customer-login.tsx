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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "cleaner">("customer");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    const isValid =
      (role === "customer" &&
        email === "customer@example.com" &&
        password === "123456") ||
      (role === "cleaner" &&
        email === "cleaner@example.com" &&
        password === "123456");

    if (!isValid) {
      Alert.alert("Hata", "Email veya şifre yanlış.");
      return;
    }

    await AsyncStorage.setItem("loggedIn", "true");
    await AsyncStorage.setItem("userRole", role);
    router.replace("/tabs");
  };

  return (
    <View style={styles.container}>
      {/* Arka plan video */}
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
        {/* Geri Dön Butonu */}
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

        {role === "customer" ? (
          <TouchableOpacity
            onPress={() => router.push("/auth/customer-signup")}
          >
            <Text style={styles.signupText}>Hesabın yok mu? Kayıt Ol</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push("/auth/cleaner-signup")}>
            <Text style={styles.signupText}>Hesabın yok mu? Kayıt Ol</Text>
          </TouchableOpacity>
        )}
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
  backButtonText: {
    fontSize: 16,
    color: "#4e81dfff",
  },
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
