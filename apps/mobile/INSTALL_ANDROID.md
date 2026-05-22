# Install WKN Mobile ke Android (APK via EAS)

## 1. Persiapan (sekali)

### Install tools

```bash
npm install -g eas-cli
```

### Login Expo

```bash
eas login
```

Buat akun gratis di https://expo.dev jika belum punya.

### Install dependency project

```bash
cd apps/mobile
npm install
```

---

## 2. Set URL API (wajib sebelum build)

APK membaca URL saat **build**, bukan saat runtime dari `.env` lokal.

**Edit `apps/mobile/eas.json`** — tambahkan `EXPO_PUBLIC_API_URL` di profile `preview`:

```json
"preview": {
  "distribution": "internal",
  "android": { "buildType": "apk" },
  "env": {
    "EXPO_PUBLIC_API_URL": "http://192.168.1.XX:8000/api",
    "EXPO_PUBLIC_SUPABASE_URL": "https://vlpaszzbebgrfppklqml.supabase.co",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy"
  }
}
```

| Skenario | URL contoh |
|----------|------------|
| Testing di kantor (HP & PC satu WiFi) | `http://192.168.1.10:8000/api` (ganti IP PC Anda) |
| Production | `https://domain-server-anda.com/api` |

Cek IP PC: `ipconfig` → IPv4 Address.

Backend harus jalan dan firewall mengizinkan port **8000**.

---

## 3. Link project Expo (sekali)

```bash
cd apps/mobile
eas init
```

Pilih **Create a new project** atau link ke project yang ada.

---

## 4. Build APK

```bash
cd apps/mobile
eas build --platform android --profile preview
```

- Build berjalan di cloud Expo (~10–20 menit).
- Selesai → buka link di terminal atau https://expo.dev → project **wkn-mobile** → **Builds**.
- Unduh file **.apk**.

---

## 5. Install di HP Android

1. Transfer APK ke HP (WhatsApp, Drive, atau kabel USB).
2. Buka file APK.
3. Izinkan **Install unknown apps** untuk app yang dipakai buka file.
4. Tap **Install** → buka **WKN Mobile**.

---

## 6. Login

- Email: `adianto@wijayakn.com`
- Password: `admin`

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal / tidak connect | Pastikan `EXPO_PUBLIC_API_URL` benar; rebuild APK setelah ubah URL |
| Build gagal | Jalankan `npx expo-doctor` di `apps/mobile` |
| HP tidak reach API LAN | HP harus satu WiFi dengan server; atau pakai URL public (ngrok/VPS) |

## Build ulang setelah ubah kode

```bash
eas build --platform android --profile preview
```
