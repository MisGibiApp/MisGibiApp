import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExploreScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("cleanerName");
      const storedEmail = await AsyncStorage.getItem("cleanerEmail");
      const storedImage = await AsyncStorage.getItem("cleanerProfileImage");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedImage) setProfileImage(storedImage);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("loggedIn");
    await AsyncStorage.removeItem("userRole");
    router.replace("/auth/Welcome");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profil Kartı */}
      <View style={styles.profileContainer}>
        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{name || "Kullanıcı Adı"}</Text>
        <Text style={styles.email}>{email || "email@example.com"}</Text>
      </View>

      {/* Ödeme Yöntemleri */}
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>💳 Ödeme Yöntemleri</Text>
        <Text>Visa **** 1234</Text>
      </TouchableOpacity>

      {/* Konum Bilgileri */}
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>📍 Konum Bilgileri</Text>
        <Text>İstanbul, Kadıköy</Text>
      </TouchableOpacity>

      {/* Sepet / Favoriler */}
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>🛒 Sepet / Favoriler</Text>
      </TouchableOpacity>

      {/* Anasayfaya Dön Linki */}
      <TouchableOpacity
        style={styles.discoverButton}
        onPress={() => router.push("/tabs")}
        accessibilityRole="button"
        accessibilityLabel="Keşfet"
        testID="discover-button"
      >
        <Text style={styles.discoverText}>Keşfet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6fc",
    flexGrow: 1,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "700" },
  email: { fontSize: 14, color: "#555" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 5,
    fontSize: 16,
  },
  linkContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  linkText: {
    color: "#4e73df",
    textDecorationLine: "underline",
    fontSize: 16,
    fontWeight: "600",
  },
  discoverButton: {
    backgroundColor: "#40b4e2", // soft mavi
    paddingVertical: 10, // daha kompakt
    paddingHorizontal: 20, // yan boşluk az
    borderRadius: 20, // hafif yuvarlak
    marginVertical: 12, // üst-alt boşluk
    alignSelf: "center", // ortalar
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2, // Android için hafif gölge
  },
  discoverText: {
    color: "#fff", // soft kontrast
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
});
