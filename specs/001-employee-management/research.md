# Research: Manajemen Karyawan

## Keputusan Teknis 1: Implementasi Soft Delete
- **Keputusan**: Menambahkan kolom `is_active` (BOOLEAN) dan `deleted_at` (DATETIME).
- **Rasional**: Memenuhi persyaratan Konstitusi untuk menjaga integritas data historis.
- **Alternatif**: Pindah ke tabel arsip. Ditolak karena menambah kompleksitas query untuk pelaporan gabungan.

## Keputusan Teknis 2: Skema Database (SQLite)
- **Keputusan**: Tabel `employees` akan memiliki kolom:
  - `id` (INTEGER PRIMARY KEY)
  - `nik` (TEXT UNIQUE NOT NULL)
  - `nama` (TEXT NOT NULL)
  - `email` (TEXT)
  - `posisi` (TEXT)
  - `departemen` (TEXT)
  - `gaji_pokok` (REAL)
  - `tanggal_masuk` (TEXT/DATE)
  - `is_active` (INTEGER DEFAULT 1)
  - `deleted_at` (TEXT NULL)
- **Rasional**: SQLite tidak memiliki tipe DATE khusus, maka menggunakan format ISO strings (TEXT).

## Keputusan Teknis 3: Pola Komponen Frontend (Vanilla JS)
- **Keputusan**: Menggunakan modul JS (ESM) dengan fungsi yang merender template string ke dalam DOM.
- **Rasional**: Menjaga kode tetap modular tanpa overhead framework seperti React. Memudahkan reuse modal untuk Tambah vs Edit.
- **Alternatif**: Web Components. Ditolak karena dukungan browser legacy mungkin terbatas (meskipun jarang saat ini, fungsi template lebih sederhana).
