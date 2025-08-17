// app/offer.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Cleaner = {
  id: string;
  name: string;
  profileImage?: string; // URI (örn. ImagePicker veya resolveAssetSource ile)
  basePrice?: number; // TL cinsinden taban fiyat/saatlik ücret
  city?: string;
  district?: string;
  regions?: string[];
};

export default function OfferScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    cleanerId?: string;
    cleanerName?: string;
  }>();
  const cleanerId = (params.cleanerId || "").toString();
  const cleanerNameParam = params.cleanerName || "Bilinmeyen Temizlikçi";

  const [cleaner, setCleaner] = React.useState<Cleaner | null>(null);
  const [priceInput, setPriceInput] = React.useState(""); // TL
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // PROFİLİ YÜKLE
  React.useEffect(() => {
    (async () => {
      try {
        let found: Cleaner | null = null;

        // 1) cleaner:{id}
        if (cleanerId) {
          const raw = await AsyncStorage.getItem(`cleaner:${cleanerId}`);
          if (raw) {
            found = JSON.parse(raw);
          }
        }

        // 2) cleaners listesinde ara (opsiyonel fallback)
        if (!found) {
          const listStr = await AsyncStorage.getItem("cleaners");
          if (listStr) {
            const arr: Cleaner[] = JSON.parse(listStr);
            found =
              arr.find((c) => String(c.id) === cleanerId) ||
              arr.find((c) => c.name === cleanerNameParam) ||
              null;
          }
        }

        // 3) hiçbiri yoksa en azından isim/id doldur
        if (!found) {
          found = { id: cleanerId, name: cleanerNameParam };
        }

        setCleaner(found);

        // Fiyat alanını doldur (basePrice varsa)
        if (found?.basePrice && !priceInput) {
          setPriceInput(String(found.basePrice));
        }
      } catch {
        setCleaner({ id: cleanerId, name: cleanerNameParam });
      }
    })();
  }, [cleanerId, cleanerNameParam]);

  const MIN_PRICE = 100;
  const numericPrice = Number((priceInput || "").replace(/[^0-9]/g, "")) || 0;

  const handleSubmit = async () => {
    if (!cleanerId) {
      Alert.alert("Hata", "Temizlikçi bilgisi bulunamadı.");
      return;
    }
    if (!numericPrice || numericPrice < MIN_PRICE) {
      Alert.alert("Hatalı Fiyat", `Lütfen en az ${MIN_PRICE} ₺ girin.`);
      return;
    }

    try {
      setSubmitting(true);
      const offer = {
        cleanerId,
        cleanerName: cleaner?.name || cleanerNameParam,
        price: numericPrice,
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("offers");
      const list = existing ? JSON.parse(existing) : [];
      list.push(offer);
      await AsyncStorage.setItem("offers", JSON.stringify(list));

      Alert.alert(
        "Teklif Gönderildi",
        `${offer.cleanerName} için ${new Intl.NumberFormat("tr-TR").format(
          numericPrice
        )} ₺ teklifiniz iletildi.`,
        [{ text: "Tamam", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Hata", "Teklif gönderilirken bir sorun oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%", paddingHorizontal: 20, gap: 14 }}
      >
        {/* PROFİL KARTI */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {renderAvatar(cleaner)}
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>
                {(cleaner?.name || cleanerNameParam) +
                  (cleanerId ? ` (${cleanerId})` : "")}
              </Text>
              {!!(cleaner?.city || cleaner?.district) && (
                <Text style={styles.metaText}>
                  {cleaner?.city}
                  {cleaner?.city && cleaner?.district ? " / " : ""}
                  {cleaner?.district}
                </Text>
              )}
              {!!cleaner?.regions?.length && (
                <Text style={styles.metaText}>
                  Bölgeler: {cleaner.regions.slice(0, 4).join(", ")}
                  {cleaner.regions.length > 4 ? "…" : ""}
                </Text>
              )}
              {!!cleaner?.basePrice && (
                <Text style={[styles.metaText, { fontWeight: "700" }]}>
                  Taban fiyat:{" "}
                  {new Intl.NumberFormat("tr-TR").format(cleaner.basePrice)} ₺
                </Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.title}>Teklif gönder</Text>

        <Text style={styles.label}>Teklif fiyatı (TL)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 1500"
          keyboardType="numeric"
          value={priceInput}
          onChangeText={(t) => setPriceInput(t.replace(/[^0-9]/g, ""))}
          maxLength={7}
        />
        <Text style={styles.hint}>
          {numericPrice
            ? `Girilen: ${new Intl.NumberFormat("tr-TR").format(
                numericPrice
              )} ₺`
            : "Sadece rakam girin"}
        </Text>

        <Text style={styles.label}>Not (opsiyonel)</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          placeholder="Örn: Malzeme benden, randevu cuma 10:00"
          multiline
          value={note}
          onChangeText={setNote}
        />

        <View style={{ gap: 10, marginTop: 10 }}>
          <Button
            title={submitting ? "Gönderiliyor..." : "GÖNDER"}
            onPress={handleSubmit}
            disabled={submitting}
          />
          <Button title="GERİ DÖN" onPress={() => router.back()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ——— yardımcılar ———
function renderAvatar(cleaner: Cleaner | null) {
  if (cleaner?.profileImage) {
    return (
      <Image
        source={{ uri: cleaner.profileImage }}
        style={styles.avatar}
        resizeMode="cover"
      />
    );
  }
  const initial = (cleaner?.name || "?").trim().charAt(0).toUpperCase();
  return (
    <View style={styles.initialBadge}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 20 }}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center" },
  card: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#ddd" },
  initialBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4e73df",
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: { fontSize: 16, fontWeight: "700", color: "#111" },
  metaText: { fontSize: 12, color: "#555", marginTop: 2 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  label: { fontSize: 14, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  hint: { fontSize: 12, color: "#666", marginBottom: 8 },
});
