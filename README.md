# MisGibiApp

**MisGibiApp**, temizlik hizmetlerini kullanıcılarla buluşturan bir mobil uygulamadır.  
Uygulama sayesinde kullanıcılar çevredeki temizlikçileri listeleyebilir, fiyat ve puanlarını görebilir, teklif verebilir ve hızlıca hizmet alabilirler.  

## 🚀 Özellikler
- 👤 **Çift taraflı giriş sistemi:** Kullanıcı kaydı **Müşteri** veya **Temizlikçi** olarak yapılabilir.  
- 📍 **Yakındaki temizlikçileri listeleme:** Konuma göre filtreleme (Google Maps API entegrasyonu planlanıyor).  
- ⭐ **Puan ve yorum sistemi:** Kullanıcılar temizlikçileri puanlayabilir ve yorum bırakabilir.  
- 💸 **Fiyat & teklif:** Müşteriler temizlikçilerden fiyat teklifleri alabilir.  
- 🔐 **Güvenli giriş:** Kullanıcı kimlik doğrulama sistemi (JWT / Firebase Auth gibi çözümler planlanıyor).  
- 📱 **Cross-platform destek:** Expo sayesinde **hem iOS hem Android** cihazlarda çalışır.  

## 🛠 Kullanılan Teknolojiler
### Frontend
- [React Native](https://reactnative.dev/) (Expo ile)  
- React Navigation  
- Expo Location (yakındaki temizlikçileri bulmak için)  
- Axios / Fetch API  

### Backend (planlanan)
- [Flutter](https://flutter.dev/)  
- REST API (JSON tabanlı iletişim)  

## 📲 Kurulum (Expo ile)
Android’de Expo Go uygulaması ile QR kodu okutabilirsiniz.

iOS’ta da App Store’daki Expo Go ile aynı şekilde deneyebilirsiniz.

Projeyi yerel bilgisayarda çalıştırmak için:  

```bash
# Repoyu klonlayın
git clone https://github.com/Melikehacibekiroglu/MisGibiApp.git

# Proje klasörüne girin
cd MisGibiApp

# Bağımlılıkları yükleyin
npm install

# Expo geliştirme sunucusunu başlatın
npx expo start


