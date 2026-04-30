<!--
Laporan Dampak Sinkronisasi (Sync Impact Report)
- Perubahan Versi: 1.0.0 -> 1.1.0
- Daftar Prinsip yang Diubah (Terjemahan):
  - I. Security-First Governance -> I. Tata Kelola Keamanan Utama
  - II. Component-Driven Frontend -> II. Frontend Berbasis Komponen
  - III. Spec-Driven Development -> III. Pengembangan Berbasis Spesifikasi (WAJIB)
  - IV. Data Integrity & Consistency -> IV. Integritas & Konsistensi Data
  - V. Mobile-First Responsiveness -> V. Responsivitas Mobile-First
- Bagian yang Ditambahkan: Terjemahan bahasa Indonesia
- Bagian yang Dihapus: none
- Templat yang memerlukan pembaruan:
  - .specify/templates/plan-template.md (✅ diperbarui)
  - .specify/templates/spec-template.md (✅ diperbarui)
- Follow-up TODOs: none
-->
# Konstitusi WKNsite

## Prinsip Utama

### I. Tata Kelola Keamanan Utama
Melindungi data gaji dan data pribadi karyawan adalah prioritas tertinggi. Setiap keputusan arsitektur harus memastikan kontrol akses yang kuat, enkripsi data saat disimpan/dikirim (jika memungkinkan), dan pencatatan audit (audit logging) untuk operasi yang sensitif.

### II. Frontend Berbasis Komponen
Antarmuka dashboard harus dibangun menggunakan komponen yang modular dan dapat digunakan kembali. Hal ini menjamin estetika "kelas perusahaan" yang konsisten dan mengurangi beban pemeliharaan seiring skala platform yang berkembang. Hindari penataan gaya ad-hoc; gunakan token sistem desain yang telah ditetapkan.

### III. Pengembangan Berbasis Spesifikasi (WAJIB)
Tidak ada implementasi tanpa spesifikasi. Setiap fitur, refactor, atau perbaikan bug HARUS mengikuti urutan: Spesifikasi (Kebutuhan) -> Rencana Implementasi (Desain) -> Tugas yang Dapat Dieksekusi (Eksekusi) -> Verifikasi.

### IV. Integritas & Konsistensi Data
Backend (Python/uv) dan frontend (JS) harus menjaga aturan validasi yang ketat. Database adalah satu-satunya sumber kebenaran (single source of truth). Setiap operasi yang mengubah status gaji atau karyawan harus bersifat atomik dan diverifikasi konsistensinya.

### V. Responsivitas Mobile-First
Manajemen perusahaan harus dapat mengawasi dan menyetujui tugas dari perangkat apa pun. Semua tampilan dashboard harus diuji kegunaannya pada resolusi ponsel, tablet, dan desktop menggunakan teknik CSS modern.

## Tumpukan Teknologi & Standar

### Frontend
- **HTML5/Vanilla CSS**: Prioritaskan kecepatan dan fleksibilitas. Hindari framework berat kecuali diminta secara eksplisit.
- **Vanilla Javascript**: JS Modular (ESM) untuk menjaga logika frontend tetap bersih dan mudah dipelihara.
- **Estetika Premium**: Gunakan tipografi modern (Inter/Outfit), animasi halus, dan palet warna profesional.

### Backend
- **Python (uv)**: Gunakan `uv` untuk manajemen paket yang cepat dan Python 3.14+ untuk fitur bahasa modern.
- **SQLite**: (Asumsi default) Database yang ringan, andal, dan dapat dikelola versinya.

## Alur Kerja Pengembangan & Gerbang Kualitas

### Red-Green-Refactor
Untuk logika inti dan pemrosesan data, tulis pengujian (test) sebelum implementasi jika memungkinkan.

### Verifikasi Kode
Semua perubahan UI harus diverifikasi melalui pengujian browser atau inspeksi visual. Semua perubahan backend harus lulus pemeriksaan sintaks dan logika dasar.

## Tata Kelola
Konstitusi ini menggantikan semua praktik pengembangan lainnya dalam proyek ini. Amandemen memerlukan kenaikan versi dan dokumentasi eksplisit dalam Laporan Dampak Sinkronisasi.

**Versi**: 1.1.0 | **Disahkan**: 2026-04-26 | **Terakhir Diamandemen**: 2026-04-26
