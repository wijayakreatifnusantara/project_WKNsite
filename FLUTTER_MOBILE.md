# WKN Mobile — Flutter APK

## 1. Install Flutter (belum terdeteksi di PC ini)

1. Unduh: https://docs.flutter.dev/get-started/install/windows  
2. Extract ke mis. `C:\flutter`
3. Tambahkan ke PATH: `C:\flutter\bin`
4. Install **Android Studio** + Android SDK
5. Cek:

```powershell
flutter doctor
```

Perbaiki item merah (Android licenses: `flutter doctor --android-licenses`).

---

## 2. Buat project

```powershell
cd e:\project_WKNsite
flutter create wkn_mobile
cd wkn_mobile
```

---

## 3. Build APK

```powershell
flutter pub get
flutter build apk --release
```

File hasil:

`wkn_mobile\build\app\outputs\flutter-apk\app-release.apk`

---

## 4. Install di HP

Transfer APK → buka → izinkan install dari sumber tidak dikenal.

---

## Integrasi backend (nanti di kode Dart)

| Variabel | Contoh |
|----------|--------|
| API | `http://192.168.1.10:8000/api` |
| Supabase URL | `https://vlpaszzbebgrfppklqml.supabase.co` |

Login uji: `adianto@wijayakn.com` / `admin`
