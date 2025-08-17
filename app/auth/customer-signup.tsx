import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Video } from "expo-av";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { sehirler } from "../../app/constants/sehirler";

export default function CustomerSignup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [possibleDistricts, setPossibleDistricts] = useState<string[]>([]);
  const [street, setStreet] = useState("");

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

  // Şehir değiştiğinde ilçeleri güncelle
  useEffect(() => {
    const selectedCity = sehirler.find((s) => s.name === city);
    if (selectedCity && selectedCity.districts.length > 0) {
      setPossibleDistricts(selectedCity.districts);
      setDistrict(selectedCity.districts[0]);
    } else {
      setPossibleDistricts([]);
      setDistrict("");
    }
  }, [city]);

  // Konum al ve adresi otomatik doldur
  const getLocationAndAddress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Konum İzni Gerekiyor",
        "Konum bilgisi olmadan kayıt yapamazsınız."
      );
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const [placemark] = await Location.reverseGeocodeAsync(location.coords);
    if (placemark) {
      if (placemark.city) setCity(placemark.city);
      if (placemark.subregion) setDistrict(placemark.subregion);
      if (placemark.street) setStreet(placemark.street);
    }
  };

  useEffect(() => {
    getLocationAndAddress();
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password || !city || !district || !street) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    await AsyncStorage.setItem("loggedIn", "true");
    await AsyncStorage.setItem("userRole", "customer");
    await AsyncStorage.setItem("customerName", name);
    await AsyncStorage.setItem("customerEmail", email);
    await AsyncStorage.setItem("customerCity", city);
    await AsyncStorage.setItem("customerDistrict", district);
    await AsyncStorage.setItem("customerStreet", street);

    router.replace("/tabs/index");
  };

  return (
    <View style={styles.container}>
      <Video
        source={require("../../assets/cleaner-bg.mp4")}
        style={StyleSheet.absoluteFillObject}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
      />

      <ScrollView contentContainerStyle={styles.overlay}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Text style={styles.title}>Müşteri Olarak Kayıt Ol</Text>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", alignItems: "center" }}
        >
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor="#eee"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#eee"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#eee"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Şehir:</Text>
            <Picker
              selectedValue={city}
              onValueChange={(v) => setCity(v)}
              style={styles.picker}
            >
              {sehirler.map((s) => (
                <Picker.Item key={s.name} label={s.name} value={s.name} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>İlçe:</Text>
            <Picker
              selectedValue={district}
              onValueChange={(v) => setDistrict(v)}
              style={styles.picker}
            >
              {possibleDistricts.map((d) => (
                <Picker.Item key={d} label={d} value={d} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Sokak / Cadde / Ev No"
            placeholderTextColor="#eee"
            value={street}
            onChangeText={setStreet}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/customer-login")}>
            <Text style={styles.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  input: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    color: "#fff",
  },
  pickerContainer: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    marginVertical: 10,
  },
  pickerLabel: { color: "#fff", marginLeft: 15, marginTop: 5 },
  picker: { color: "#fff", width: "100%" },
  button: {
    backgroundColor: "#4e73df",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  linkText: { color: "#eee", marginTop: 10, textDecorationLine: "underline" },
});
