import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import defaultAvatars from "../constants/defaultAvatars";
import { api } from "../lib/api";

export default function ExploreScreen() {
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // modal için state
  const [modalVisible, setModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // kullanıcı bilgilerini getir
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        setPhone(res.data.phone || "");
        setCity(res.data.city || "");
        setDistrict(res.data.district || "");
      } catch (err: any) {
        console.error("Fetch user error:", err?.response?.data || err.message);
      }
    };

    fetchUser();
  }, []);

  // 📷 profil fotoğrafı seç
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets[0].uri;
      setUser({ ...user, profileImageUrl: selected });

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append("file", {
          uri: selected,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);

        await api.post("/profile/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        Alert.alert("Başarılı ✅", "Profil fotoğrafı güncellendi");
      } catch (err) {
        Alert.alert("Hata", "Fotoğraf yüklenemedi");
      }
    }
  };

  // profili güncelle
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await api.post(
        `/profile/${user.role}`, // -> role: customer | cleaner
        { phone, city, district },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Başarılı ✅", "Profil bilgileriniz güncellendi");
    } catch (err: any) {
      Alert.alert("Hata", "Profil güncellenemedi");
    }
  };

  // kart kaydet
  const handleSaveCard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await api.post(
        "/payment/cards",
        { cardNumber, expiry, cvv },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Başarılı ✅", "Kart kaydedildi");
      setModalVisible(false);
      setCardNumber("");
      setExpiry("");
      setCvv("");
    } catch (err: any) {
      Alert.alert("Hata", "Kart kaydedilemedi");
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profil resmi */}
      <Image
        source={
          user.profileImageUrl
            ? { uri: user.profileImageUrl }
            : defaultAvatars[user.gender || "male"]
        }
        style={styles.avatar}
      />
      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.changePhoto}>📷 Fotoğrafı Değiştir</Text>
      </TouchableOpacity>

      {/* Kullanıcı adı ve email */}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* Telefon */}
      <View style={styles.card}>
        <Text style={styles.label}>📞 Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="Telefon numarası"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Şehir */}
      <View style={styles.card}>
        <Text style={styles.label}>📍 Şehir</Text>
        <TextInput
          style={styles.input}
          placeholder="Şehir"
          value={city}
          onChangeText={setCity}
        />
      </View>

      {/* İlçe */}
      <View style={styles.card}>
        <Text style={styles.label}>🏘️ İlçe</Text>
        <TextInput
          style={styles.input}
          placeholder="İlçe"
          value={district}
          onChangeText={setDistrict}
        />
      </View>

      {/* Ödeme yöntemleri */}
      <View style={styles.card}>
        <Text style={styles.label}>💳 Ödeme Yöntemleri</Text>
        <Text style={{ color: "#666", marginBottom: 6 }}>Visa **** 1234</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.linkText}>+ Kart Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Güncelle butonu */}
      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
        <Text style={styles.updateBtnText}>✅ Profili Güncelle</Text>
      </TouchableOpacity>

      {/* Kart ekleme modalı */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kart Bilgileri</Text>
            <TextInput
              placeholder="Kart Sahibi (Ad Soyad)"
              style={styles.input}
              value={cardHolder}
              autoCapitalize="characters" // otomatik büyük harf
              onChangeText={(text) => {
                // sadece harf ve boşluk izin ver
                const formatted = text.replace(/[^A-Za-zĞÜŞİÖÇğüşıöç\s]/g, "");
                setCardHolder(formatted.toUpperCase()); // büyük harfe çevir
              }}
            />

            <TextInput
              placeholder="Kart Numarası"
              style={styles.input}
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <TextInput
              placeholder="Son Kullanma (MM/YY)"
              style={styles.input}
              keyboardType="numeric"
              maxLength={5}
              value={expiry}
              onChangeText={(text) => {
                // sadece rakam al
                let formatted = text.replace(/[^0-9]/g, "");

                // 2. haneden sonra otomatik '/'
                if (formatted.length > 2) {
                  formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
                }

                // maksimum 5 karakter (MM/YY)
                setExpiry(formatted.slice(0, 5));
              }}
            />

            <TextInput
              placeholder="CVV"
              style={styles.input}
              keyboardType="numeric"
              maxLength={3}
              value={cvv}
              onChangeText={(text) => {
                // sadece rakam ve max 3 hane
                const numeric = text.replace(/[^0-9]/g, "");
                setCvv(numeric);
              }}
            />

            <TouchableOpacity style={styles.updateBtn} onPress={handleSaveCard}>
              <Text style={styles.updateBtnText}>Kaydet</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{ color: "red", marginTop: 10, textAlign: "center" }}
              >
                İptal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#4e73df",
  },
  changePhoto: {
    color: "#4e73df",
    marginTop: 8,
    marginBottom: 20,
    fontWeight: "600",
  },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 14, color: "#777", marginBottom: 20 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontWeight: "600", marginBottom: 6, color: "#333" },
  input: {
    backgroundColor: "#f1f3f6",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  linkText: {
    color: "#4e73df",
    fontWeight: "600",
  },
  updateBtn: {
    marginTop: 15,
    backgroundColor: "#4e73df",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  updateBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
});
