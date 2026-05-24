# WKN Mobile - Expo App

Aplikasi mobile WKN (Wijaya Kreatif Nusantara) untuk absensi dan fitur ESS (Employee Self Service).

## 🚀 Cara Menjalankan di Expo Go

### Prasyarat
1. Install **Expo Go** di smartphone Anda:
   - [Android - Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Pastikan komputer dan smartphone terhubung ke **jaringan WiFi yang sama**

### Langkah-langkah

#### 1. Install Dependencies
```bash
cd apps/mobile
npm install
```

#### 2. Buat File `.env`
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Kemudian edit `.env` sesuai kebutuhan:
```env
# Ganti dengan IP lokal komputer Anda (bukan localhost)
# Cara cek IP: ipconfig (Windows) atau ifconfig (Mac/Linux)
EXPO_PUBLIC_API_URL=http://192.168.1.XX:8000/api

# Supabase credentials (sudah terisi default)
EXPO_PUBLIC_SUPABASE_URL=https://vlpaszzbebgrfppklqml.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy
```

> **PENTING**: 
> - `EXPO_PUBLIC_API_URL` harus menggunakan IP lokal komputer, **BUKAN** `localhost` atau `127.0.0.1`
> - Untuk mengetahui IP lokal Anda:
>   - **Windows**: Buka Command Prompt, ketik `ipconfig`, cari "IPv4 Address"
>   - **Mac/Linux**: Buka Terminal, ketik `ifconfig`, cari "inet" di bawah interface yang aktif

#### 3. Jalankan Development Server
```bash
npm start
# atau
npx expo start
```

#### 4. Scan QR Code
Setelah server berjalan, akan muncul QR code di terminal. Scan QR code tersebut menggunakan:
- **Android**: Buka Expo Go → Scan QR Code
- **iOS**: Buka kamera → Scan QR Code (akan otomatis membuka Expo Go)

### 🆘 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Network response timed out" | Pastikan IP di `.env` benar dan server API berjalan |
| "Unable to connect" | Pastikan firewall tidak memblokir port 8000 dan 8081 |
| QR code tidak bisa discan | Pastikan HP dan komputer di WiFi yang sama |
| App crash saat dibuka | Jalankan `npm install` ulang dan restart Expo Dev Server |
| Kamera tidak berfungsi | Berikan izin kamera di pengaturan HP |

### 📱 Fitur yang Tersedia di Expo Go

✅ **Berfungsi Penuh:**
- Absensi dengan kamera & watermark
- Geofencing (validasi lokasi)
- Login & autentikasi
- Pengajuan cuti (leave request)
- Pengajuan lembur (overtime request)
- Slip gaji (payslip)
- Direktori karyawan
- Tanda tangan digital

⚠️ **Keterbatasan Expo Go:**
- Beberapa fitur native mungkin terbatas
- Untuk build APK production, gunakan EAS Build

### 🔧 Development Commands

```bash
# Start development server
npm start

# Run on Android emulator (tidak berlaku untuk Expo Go)
npm run android

# Run on iOS simulator (tidak berlaku untuk Expo Go)  
npm run ios

# Lint check
npm run lint

# Build APK (perlu EAS login)
npm run build:apk
```

### 📝 Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `EXPO_PUBLIC_API_URL` | URL API backend (harus bisa diakses dari HP) | `http://192.168.1.10:8000/api` |
| `EXPO_PUBLIC_SUPABASE_URL` | URL Supabase project | `https://xxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `sb_publishable_xxx...` |

### 🌐 Production Build dengan EAS (Expo Cloud Build)

Untuk build APK/IPA production yang bisa didownload via cloud, gunakan **EAS Build**:

#### Langkah 1: Login ke EAS
```bash
npm run eas:login
# atau
eas login
```

#### Langkah 2: Inisialisasi Project (jika belum)
```bash
eas init
# Pilih "No" jika sudah ada projectId di app.json
```

#### Langkah 3: Build APK untuk Preview/Internal Testing
```bash
# Build APK yang bisa langsung didownload
eas build --platform android --profile preview

# Atau gunakan npm script
npm run build:apk
```

Setelah build selesai, Anda akan mendapatkan **URL download** untuk APK.

#### Langkah 4: Build untuk Production (Google Play Store)
```bash
# Build Android App Bundle (AAB) untuk Google Play
eas build --platform android --profile production

# Submit ke Google Play Store
eas submit --platform android --latest
```

#### Langkah 5: Download Hasil Build
Setelah build selesai:
1. Buka [Expo Dashboard](https://expo.dev)
2. Login dengan akun Expo Anda
3. Pilih project **WKN Mobile**
4. Lihat daftar build dan download APK/AAB

Atau gunakan link yang diberikan di terminal setelah build selesai.

### 📱 Distribusi ke Tim

#### Opsi 1: Direct Download (APK)
- Share file APK langsung ke tim
- User perlu enable "Install from Unknown Sources"

#### Opsi 2: Expo Go (Development)
- Cocok untuk testing dan development
- Scan QR code dari `expo start`

#### Opsi 3: Google Play Store (Production)
- Upload AAB ke Google Play Console
- Tim download dari Play Store (private/internal testing)

### 🔧 Konfigurasi EAS

File `eas.json` sudah dikonfigurasi dengan:
- **preview**: Build APK untuk testing internal
- **production**: Build AAB untuk Google Play Store

Environment variables diatur per profile:
- **preview**: Menggunakan IP lokal (`http://192.168.0.3:8000/api`)
- **production**: Menggunakan URL production (`https://api.wijayakn.com/api`)

## 📄 License

Internal use - Wijaya Kreatif Nusantara