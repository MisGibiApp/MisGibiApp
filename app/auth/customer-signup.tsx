import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { sehirler } from "../../app/constants/sehirler";
import defaultAvatars from "../constants/defaultAvatars";

export default function CustomerSignup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // << telefon
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [possibleDistricts, setPossibleDistricts] = useState<string[]>([]);
  const [street, setStreet] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");

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

  // Şehir değişince ilçe seçeneklerini hazırla
  useEffect(() => {
    const selectedCity = sehirler.find((s) => s.name === city);
    if (selectedCity && selectedCity.districts.length > 0) {
      setPossibleDistricts(selectedCity.districts);
      setDistrict((prev) =>
        selectedCity.districts.includes(prev) ? prev : selectedCity.districts[0]
      );
    } else {
      setPossibleDistricts([]);
      setDistrict("");
    }
  }, [city]);

  // Konumdan adres doldurma (opsiyonel)
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const [placemark] = await Location.reverseGeocodeAsync(location.coords);
      if (placemark) {
        if (placemark.city) setCity(placemark.city);
        if (placemark.subregion) setDistrict(placemark.subregion);
        if (placemark.street) setStreet(placemark.street);
      }
    })();
  }, []);

  // Galeriden profil resmi seçimi (opsiyonel)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const handleSignup = async () => {
    // Temel doğrulamalar
    if (!name || !email || !password || !city || !district || !street) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    // Telefon doğrulama (Türkiye: 10 hane)
    if (!phone || phone.length !== 10) {
      Alert.alert("Hata", "Geçerli bir telefon numarası girin (10 hane).");
      return;
    }
    const formattedPhone = "+90" + phone;

    // Fotoğraf: seçili yoksa default avatarın URI'sini kaydet
    const finalProfileImage =
      profileImage || RNImage.resolveAssetSource(defaultAvatars[gender]).uri;

    // Kaydet
    await AsyncStorage.setItem("loggedIn", "true");
    await AsyncStorage.setItem("userRole", "customer");
    await AsyncStorage.setItem("customerName", name);
    await AsyncStorage.setItem("customerEmail", email);
    await AsyncStorage.setItem("customerCity", city);
    await AsyncStorage.setItem("customerDistrict", district);
    await AsyncStorage.setItem("customerStreet", street);
    await AsyncStorage.setItem("customerGender", gender);
    await AsyncStorage.setItem("customerProfileImage", finalProfileImage);
    await AsyncStorage.setItem("customerPhone", formattedPhone); // << telefon kaydı

    router.replace("/tabs");
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
        <TouchableOpacity
          onPress={() => router.back()} // istersen: () => router.replace("/auth/Welcome")
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        ></Animated.View>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Text style={styles.title}>Müşteri Olarak Kayıt Ol</Text>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", alignItems: "center" }}
        >
          {/* Profil Resmi */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Image
              source={
                profileImage ? { uri: profileImage } : defaultAvatars[gender]
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Cinsiyet */}
          <View className="genderContainer" style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "male" && styles.genderSelected,
              ]}
              onPress={() => setGender("male")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "male" && styles.genderTextSelected,
                ]}
              >
                Erkek
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "female" && styles.genderSelected,
              ]}
              onPress={() => setGender("female")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "female" && styles.genderTextSelected,
                ]}
              >
                Kadın
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form alanları */}
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

          {/* Telefon */}
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası (5XXXXXXXXX)"
            placeholderTextColor="#eee"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))} // sadece rakam
            maxLength={10} // Türkiye: 10 hane
          />

          {/* Şehir */}
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

          {/* İlçe */}
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
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  genderButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
    marginHorizontal: 5,
    backgroundColor: "transparent",
  },
  genderSelected: { backgroundColor: "#4e73df", borderColor: "#4e73df" },
  genderText: { color: "#fff", fontWeight: "600" },
  genderTextSelected: { color: "#fff" },

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
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backButtonText: { fontSize: 16, color: "#4e81dfff" },
});
