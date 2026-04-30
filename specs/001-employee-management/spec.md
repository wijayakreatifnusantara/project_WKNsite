# Spesifikasi Fitur: Manajemen Karyawan (Employee Management)

**Feature Branch**: `001-employee-management`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Membuat sistem manajemen data karyawan (Employee Data) yang memungkinkan admin untuk melihat, menambah, mengedit, dan menghapus data karyawan (CRUD)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menambah Karyawan Baru (Priority: P1)

Admin ingin menambahkan karyawan baru ke dalam sistem agar informasi mereka tercatat secara resmi untuk keperluan absensi dan penggajian.

**Why this priority**: Ini adalah fungsi dasar yang diperlukan sebelum fitur lain (absensi/payroll) bisa digunakan.

**Independent Test**: Admin mengisi formulir karyawan baru, menekan tombol simpan, dan melihat karyawan tersebut muncul di daftar.

**Acceptance Scenarios**:

1. **Given** Admin berada di halaman Data Karyawan, **When** Admin mengisi semua field wajib dan mengklik "Simpan", **Then** Sistem menyimpan data dan menampilkan pesan sukses.
2. **Given** Admin memasukkan NIK yang sudah ada, **When** Admin mengklik "Simpan", **Then** Sistem menampilkan pesan kesalahan dan tidak menyimpan data.

---

### User Story 2 - Melihat & Mencari Daftar Karyawan (Priority: P1)

Admin ingin melihat daftar seluruh karyawan yang aktif dan mencari karyawan tertentu berdasarkan nama untuk memantau data secara efisien.

**Why this priority**: Penting untuk navigasi dan pengelolaan data dalam jumlah banyak.

**Independent Test**: Admin mengetikkan nama di kotak pencarian dan tabel hanya menampilkan baris yang sesuai.

**Acceptance Scenarios**:

1. **Given** Terdapat 10 karyawan di sistem, **When** Admin membuka halaman Data Karyawan, **Then** Ke-10 karyawan ditampilkan dalam tabel.
2. **Given** Admin mengetik "Budi", **When** terdapat karyawan bernama "Budi Santoso", **Then** Hanya baris "Budi Santoso" yang tetap terlihat di tabel.

---

### User Story 3 - Memperbarui Data Karyawan (Priority: P2)

Admin ingin mengubah informasi karyawan (seperti jabatan atau gaji) untuk menjaga keakuratan data saat terjadi perubahan status kepegawaian.

**Why this priority**: Data karyawan bersifat dinamis dan perlu diperbarui secara berkala.

**Independent Test**: Admin mengubah gaji pokok seorang karyawan, menyimpan, dan memverifikasi perubahan tersebut di daftar.

**Acceptance Scenarios**:

1. **Given** Admin membuka modal edit karyawan, **When** Admin mengubah "Posisi" dan klik "Update", **Then** Perubahan tersimpan dan langsung terlihat di tabel.

---

### User Story 4 - Menghapus Data Karyawan (Priority: P3)

Admin ingin menghapus data karyawan yang sudah tidak bekerja lagi agar daftar karyawan tetap bersih dan relevan.

**Why this priority**: Menghindari data sampah dan menjaga integritas database.

**Independent Test**: Admin mengklik tombol hapus pada salah satu karyawan dan memverifikasi karyawan tersebut hilang dari daftar.

**Acceptance Scenarios**:

1. **Given** Admin mengklik "Hapus", **When** Admin memberikan konfirmasi, **Then** Sistem menghapus data dari database dan memperbarui tampilan tabel.

### Edge Cases

- Sistem menggunakan kebijakan **Soft Delete**: Data karyawan tidak dihapus permanen dari database, melainkan ditandai sebagai "tidak aktif" agar riwayat gaji dan absensi tetap terjaga untuk audit.
- Bagaimana sistem menangani input gaji dengan karakter non-numerik?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menyediakan formulir input data (Nama, Email, NIK, Posisi, Departemen, Gaji Pokok).
- **FR-002**: Sistem HARUS memvalidasi format email yang benar.
- **FR-003**: Sistem HARUS memastikan NIK bersifat unik di dalam database.
- **FR-004**: Sistem HARUS menampilkan data karyawan dalam tabel yang mendukung scrolling pada perangkat mobile.
- **FR-005**: Sistem HARUS menyediakan pencarian real-time (tanpa refresh halaman).
- **FR-006**: Sistem HARUS menerapkan kebijakan Soft Delete untuk menjaga integritas data historis di Google Sheets.
- **FR-007**: Sistem HARUS menggunakan Google Apps Script sebagai jembatan data (API).

### Key Entities

- **Employee**: Mewakili data karyawan (ID, NIK, Nama, Email, Posisi, Departemen, GajiPokok, TanggalMasuk).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin dapat menyelesaikan input satu karyawan baru dalam waktu kurang dari 45 detik.
- **SC-002**: Hasil pencarian muncul dalam waktu kurang dari 300ms setelah pengetikan berhenti.
- **SC-003**: Tingkat akurasi penyimpanan data adalah 100% (tidak ada data hilang saat refresh).
- **SC-004**: Halaman tetap usable pada lebar layar 375px (iPhone SE).

## Assumptions

- Admin sudah terautentikasi sebelum masuk ke fitur ini.
- NIK adalah pengenal unik manual yang diinput oleh admin (bukan auto-increment).
- Data dihapus secara permanen (hard delete), bukan soft delete.

## Penyelarasan Konstitusi

- **Keamanan**: Data gaji adalah PII sensitif. Akses ke CRUD Employee dibatasi hanya untuk role Admin.
- **Modularitas**: Modal tambah/edit harus menggunakan komponen UI yang reusable.
- **Data**: Skema database `employees` harus diinisialisasi dengan tipe data yang tepat.
- **UX**: Tabel dan tombol aksi harus dioptimalkan untuk sentuhan (touch-friendly) di perangkat mobile.
