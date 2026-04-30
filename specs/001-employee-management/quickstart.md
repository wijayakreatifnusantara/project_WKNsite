# Quickstart: Manajemen Karyawan

Panduan cepat untuk menyiapkan lingkungan pengembangan fitur Manajemen Karyawan.

## 1. Persiapan Database
Jalankan skrip inisialisasi database (akan dibuat di `src/utils/init_db.py`):
```bash
uv run src/utils/init_db.py
```

## 2. Struktur Data
Pastikan tabel `employees` tersedia di `wkn_database.db`.

## 3. Menjalankan Backend
Gunakan perintah berikut untuk menjalankan server pengembangan:
```bash
uv run main.py
```

## 4. Verifikasi Frontend
Buka `index.html` di browser (disarankan menggunakan Live Server atau akses langsung melalui file jika tidak ada routing backend yang kompleks).
- Klik menu "Employee Data" di sidebar.
- Pastikan tabel kosong muncul dan tombol "Add Employee" tersedia.
