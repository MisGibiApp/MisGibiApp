import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../lib/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err: any) {
        console.error("Fetch user error:", err?.response?.data || err.message);
      }
    };

    fetchUser();
  }, []);

  const formatPhoneNumber = (text: string) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, "");

    // Türkiye telefon formatı: 5XX XXX XX XX
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6
      )}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      8
    )} ${cleaned.slice(8, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const savePhone = async () => {
    try {
      // Telefon numarasını temizle ve kontrol et
      const cleanedPhone = phoneNumber.replace(/\D/g, "");

      if (cleanedPhone.length !== 10 || !cleanedPhone.startsWith("5")) {
        Alert.alert(
          "Hata",
          "Geçerli bir telefon numarası girin (5XX XXX XX XX)"
        );
        return;
      }

      const fullPhone = `+90 ${phoneNumber}`;
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await api.post(
        `/profile/${user.role}`,
        { phone: fullPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser({ ...user, phone: fullPhone });
      setShowPhoneModal(false);
      setPhoneNumber("");
      Alert.alert("Başarılı ✅", "Telefon numaranız kaydedildi");
    } catch (err) {
      Alert.alert("Hata", "Telefon kaydedilemedi");
    }
  };

  const TabButton = ({ id, label, isActive, onPress }: any) => (
    <TouchableOpacity
      onPress={() => onPress(id)}
      style={[
        styles.tabButton,
        isActive ? styles.activeTabButton : styles.inactiveTabButton,
      ]}
    >
      <Text
        style={[
          styles.tabButtonText,
          isActive ? styles.activeTabText : styles.inactiveTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ emoji, value, label, backgroundColor }: any) => (
    <View style={[styles.modernStatCard, { backgroundColor }]}>
      <View style={styles.statIconContainer}>
        <Text style={styles.statEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.modernStatValue}>{value}</Text>
      <Text style={styles.modernStatLabel}>{label}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilim</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header Card */}
      <View style={styles.modernProfileCard}>
        <LinearGradient
          colors={[
            "rgba(99, 102, 241, 0.1)",
            "rgba(139, 92, 246, 0.1)",
            "transparent",
          ]}
          style={styles.gradientBackground}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.modernAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modernAvatarText}>
                {user.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraButton}>
              <Text style={styles.cameraButtonText}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.modernName}>{user.name}</Text>

            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>📧 {user.email}</Text>

              {user.phone ? (
                <Text style={styles.contactItem}>📞 {user.phone}</Text>
              ) : (
                <TouchableOpacity
                  style={styles.addPhoneButton}
                  onPress={() => setShowPhoneModal(true)}
                >
                  <Text style={styles.addPhoneText}>📞 Telefon Ekle</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.contactItem}>
                📍 {user.district}, {user.city}
              </Text>
            </View>

            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.modernEditBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modernEditText}>✏️ Profili Düzenle</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          emoji="📅"
          value={user.totalReservations || 0}
          label="Toplam Rezervasyon"
          backgroundColor="#EBF4FF"
        />
        <StatCard
          emoji="⭐"
          value={user.averageRating?.toFixed(1) || "0.0"}
          label="Ortalama Puanım"
          backgroundColor="#FFFBEB"
        />
        <StatCard
          emoji="❤️"
          value={user.favoriteCleaners || 0}
          label="Favori Temizlikçi"
          backgroundColor="#FEF2F2"
        />
        <StatCard
          emoji="🎖️"
          value={
            user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("tr-TR", {
                  month: "short",
                  year: "numeric",
                })
              : "-"
          }
          label="Üyelik Tarihi"
          backgroundColor="#F0FDF4"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          id="profile"
          label="👤 Profil Bilgileri"
          isActive={activeTab === "profile"}
          onPress={setActiveTab}
        />
        <TabButton
          id="bookings"
          label="🕒 Rezervasyonlarım"
          isActive={activeTab === "bookings"}
          onPress={setActiveTab}
        />
        <TabButton
          id="favorites"
          label="❤️ Favorilerim"
          isActive={activeTab === "favorites"}
          onPress={setActiveTab}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "profile" && (
          <View style={styles.tabContentCard}>
            <Text style={styles.tabContentTitle}>Profil Bilgileri</Text>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Ad Soyad</Text>
              <TextInput style={styles.modernInput} value={user.name} />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>E-posta</Text>
              <TextInput style={styles.modernInput} value={user.email} />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Telefon</Text>
              <TextInput
                style={styles.modernInput}
                value={user.phone || "Telefon ekleyin"}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Konum</Text>
              <TextInput
                style={styles.modernInput}
                value={`${user.district}, ${user.city}`}
              />
            </View>
          </View>
        )}

        {activeTab === "bookings" && (
          <View style={styles.tabContentCard}>
            <Text style={styles.tabContentTitle}>Son Rezervasyonlarım</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📋</Text>
              <Text style={styles.emptyStateText}>
                Henüz rezervasyon bulunmuyor
              </Text>
            </View>
          </View>
        )}

        {activeTab === "favorites" && (
          <View style={styles.tabContentCard}>
            <Text style={styles.tabContentTitle}>Favori Temizlikçilerim</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>❤️</Text>
              <Text style={styles.emptyStateText}>
                Henüz favori temizlikçiniz bulunmuyor
              </Text>
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>
                  Temizlikçileri Keşfet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Phone Modal */}
      <Modal
        visible={showPhoneModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalCard}>
            <TouchableOpacity
              style={styles.modernCloseBtn}
              onPress={() => setShowPhoneModal(false)}
            >
              <Text style={styles.modernCloseText}>❌</Text>
            </TouchableOpacity>

            <Text style={styles.modernModalTitle}>Telefon Numarası Ekle</Text>

            <View style={styles.simplePhoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flagEmoji}>🇹🇷</Text>
                <Text style={styles.countryCode}>+90</Text>
              </View>

              <TextInput
                style={styles.simplePhoneInput}
                placeholder="533 123 45 67"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                maxLength={13} // "533 123 45 67" = 13 karakter
              />
            </View>

            <TouchableOpacity style={styles.modernSaveBtn} onPress={savePhone}>
              <Text style={styles.modernSaveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    fontSize: 16,
    color: "#666",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },

  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },

  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  headerButtonText: {
    fontSize: 16,
  },

  // Modern Profile Card
  modernProfileCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },

  gradientBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    transform: [{ translateX: 30 }, { translateY: -30 }],
  },

  profileContent: {
    flexDirection: "row",
    padding: 24,
    alignItems: "center",
  },

  avatarContainer: {
    position: "relative",
    marginRight: 20,
  },

  modernAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  modernAvatarText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },

  cameraButtonText: {
    fontSize: 12,
  },

  userInfo: {
    flex: 1,
  },

  modernName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },

  contactInfo: {
    marginBottom: 16,
  },

  contactItem: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 6,
  },

  addPhoneButton: {
    alignSelf: "flex-start",
    marginBottom: 6,
  },

  addPhoneText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },

  modernEditBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },

  modernEditText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },

  modernStatCard: {
    width: (width - 56) / 2, // 2 columns with margins
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statEmoji: {
    fontSize: 20,
  },

  modernStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },

  modernStatLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },

  // Tabs
  tabContainer: {
    backgroundColor: "#F8FAFC",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 8,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  activeTabButton: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  inactiveTabButton: {
    backgroundColor: "#FFF",
  },

  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#FFF",
  },

  inactiveTabText: {
    color: "#64748B",
  },

  // Tab Content
  tabContent: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
  },

  tabContentCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  tabContentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },

  formField: {
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  modernInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
  },

  exploreButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },

  exploreButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },

  // Modal Styles
  modernModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modernModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },

  modernCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  modernCloseText: {
    fontSize: 14,
  },

  modernModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 8,
  },

  // Simple Phone Input Styles
  simplePhoneContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: "#F3F4F6",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    minWidth: 80,
  },

  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },

  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  simplePhoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#F9FAFB",
  },

  modernSaveBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  modernSaveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
