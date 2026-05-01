# Dokumentasi Sistem Navigasi (Collapsible Sidebar)

WKNsite menggunakan sistem navigasi bertingkat yang dapat dilipat (collapsible) untuk menjaga antarmuka tetap bersih dan terorganisir.

## 🗂️ Pengelompokan Kategori

Menu navigasi dibagi menjadi empat kategori utama:

1.  **Dashboard (Main):** Ringkasan operasional harian.
2.  **Manajemen Karyawan:** Berfokus pada data personil, struktur organisasi, dan turnover.
3.  **Kehadiran & Waktu:** Mengelola log absensi, penjadwalan shift, dan lembur.
4.  **Payroll & Admin:** Pemrosesan gaji, manajemen cuti, dan konfigurasi sistem.

## 🛠️ Cara Kerja Teknis

### 1. Mekanisme Toggle
Kategori navigasi menggunakan fungsi `toggleNavGroup(headerElement)` di `main.js`. Fungsi ini menambahkan/menghapus class `.expanded` pada container grup.

### 2. Animasi & Transisi
- **Ketinggian Dinamis:** Sub-menu menggunakan transisi CSS pada properti `max-height` dan `opacity`.
- **Chevron Rotation:** Ikon panah (chevron) pada header kategori akan berputar 180 derajat saat grup dibuka.

### 3. State Management
Saat fungsi `navigate()` dipanggil:
1.  Halaman yang diminta akan dimuat.
2.  Sistem secara otomatis mencari grup induk (parent group) dari menu tersebut.
3.  Grup induk akan dipaksa dalam keadaan `expanded` sehingga indikator aktif selalu terlihat.

## 🎨 Penyesuaian Style

Jika Anda ingin mengubah tampilan grup, Anda dapat mengedit bagian `/* --- Sidebar Grouping & Collapsible --- */` di file `style.css`.

---
*Dibuat oleh Tim Pengembang WKNsite*
