import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Cleaner = {
  id: string;
  name: string;
  avatar: string;
  region: string;
  hourlyRate: number;
};

const cleaners: Cleaner[] = [
  {
    id: "1",
    name: "Ahmet",
    avatar: "https://i.pravatar.cc/150?img=1",
    region: "Kadıköy",
    hourlyRate: 120,
  },
  {
    id: "2",
    name: "Ayşe",
    avatar: "https://i.pravatar.cc/150?img=2",
    region: "Beşiktaş",
    hourlyRate: 100,
  },
  {
    id: "3",
    name: "Mehmet",
    avatar: "https://i.pravatar.cc/150?img=3",
    region: "Üsküdar",
    hourlyRate: 90,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleGoBack = async () => {
    // Gerekirse kullanıcı bilgilerini temizleyebilirsin
    await AsyncStorage.removeItem("loggedIn");
    await AsyncStorage.removeItem("userRole");
    // Kullanıcıyı Welcome ekranına gönder
    router.replace("/auth/Welcome");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/misgibiapp-logo.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.linkContainer}>
        <TouchableOpacity
          style={styles.backLink}
          activeOpacity={0.7} // basınca hafif opaklık efekti
          onPress={async () => {
            await AsyncStorage.removeItem("loggedIn");
            await AsyncStorage.removeItem("userRole");
            router.replace("/auth/Welcome");
          }}
        >
          <Text style={styles.backLinkText}> Anasayfaya Dön</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cleaners}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.region}>📍 {item.region}</Text>
              <Text style={styles.rate}>Ücret: {item.hourlyRate}₺ / saat</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push(
                    `/offer?cleanerId=${item.id}&cleanerName=${item.name}`
                  )
                }
              >
                <Text style={styles.buttonText}>Teklif Et</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fc", paddingHorizontal: 10 },
  logoContainer: { alignItems: "center", marginVertical: 15 },
  logoutContainer: { alignItems: "flex-start", marginBottom: 15 },
  logoutButton: {
    backgroundColor: "#40b4e2",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 5 },
  region: { fontSize: 14, color: "#555" },
  rate: {
    fontSize: 14,
    color: "#2a9d8f",
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 3,
  },
  button: {
    backgroundColor: "#40b4e2",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-end", // sağa yasla
    marginRight: 10, // sağdan biraz boşluk
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  linkContainer: {
    alignItems: "center", // ortada kalsın
    marginVertical: 10,
  },

  backLink: {
    backgroundColor: "rgba(78, 115, 223, 0.1)", // hafif mavi transparan
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  backLinkText: {
    color: "#40b4e2",
    fontSize: 16,
    fontWeight: "600",
  },
});
