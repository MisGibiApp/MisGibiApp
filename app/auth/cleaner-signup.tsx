import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image, // resolveAssetSource için alias
  KeyboardAvoidingView,
  Platform, // JSX'te kullanacağız
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { sehirler } from "../../app/constants/sehirler";
import defaultAvatars from "../constants/defaultAvatars"; // { male: require(...), female: require(...) }

export default function CleanerSignup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [possibleRegions, setPossibleRegions] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
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

  useEffect(() => {
    const selectedCity = sehirler.find((s) => s.name === city);
    if (selectedCity && selectedCity.districts.length > 0) {
      setPossibleRegions(selectedCity.districts);
      setDistrict(selectedCity.districts[0]);
      setRegions([]);
    } else {
      setPossibleRegions([]);
      setDistrict("");
      setRegions([]);
    }
  }, [city]);

  // (Opsiyonel) Galeri izni
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("İzin gerekli", "Galeriye erişim izni vermelisiniz.");
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const toggleRegion = (region: string) => {
    if (regions.includes(region))
      setRegions(regions.filter((r) => r !== region));
    else setRegions([...regions, region]);
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !district || regions.length === 0) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    // Kullanıcı seçmediyse default avatarın URI’sini al
    const finalProfileImage =
      profileImage || RNImage.resolveAssetSource(defaultAvatars[gender]).uri;

    await AsyncStorage.setItem("loggedIn", "true");
    await AsyncStorage.setItem("userRole", "cleaner");
    await AsyncStorage.setItem("cleanerName", name);
    await AsyncStorage.setItem("cleanerCity", city);
    await AsyncStorage.setItem("cleanerDistrict", district);
    await AsyncStorage.setItem("cleanerRegions", JSON.stringify(regions));
    await AsyncStorage.setItem("cleanerProfileImage", finalProfileImage);
    await AsyncStorage.setItem("cleanerGender", gender);

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
          onPress={() => router.replace("/auth/Welcome")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Text style={styles.title}>Temizlikçi Olarak Kayıt Ol</Text>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", alignItems: "center" }}
        >
          {/* Profil Resmi */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Image
              // ÖNEMLİ: default avatar require, seçilmiş foto uri
              source={
                profileImage ? { uri: profileImage } : defaultAvatars[gender]
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Cinsiyet Seçimi */}
          <View style={styles.genderContainer}>
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

          {/* Bölgeler */}
          <Text style={styles.sectionTitle}>
            Çalışmak İstediğiniz Bölgeler:
          </Text>
          <View style={styles.regionsContainer}>
            {possibleRegions.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.regionButton,
                  regions.includes(r) && styles.regionButtonSelected,
                ]}
                onPress={() => toggleRegion(r)}
              >
                <Text style={{ color: regions.includes(r) ? "#fff" : "#000" }}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/cleaner-login")}>
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
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backButtonText: { fontSize: 16, color: "#4e81dfff" },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
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
  sectionTitle: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  regionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  regionButton: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  regionButtonSelected: { backgroundColor: "#4e73df", borderColor: "#4e73df" },
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
