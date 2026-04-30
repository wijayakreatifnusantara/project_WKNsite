# Feature Specification: Import Karyawan via Excel

**Feature Branch**: `002-import-employee-excel`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "Fitur Impor Karyawan via Excel. Admin dapat mengunduh template Excel, mengisi data karyawan (Nama, NIK, Email, Posisi, Departemen, Gaji Pokok, Tanggal Masuk), dan mengunggahnya kembali untuk menambahkan banyak karyawan sekaligus. Sistem harus memvalidasi format dan keunikan NIK sebelum menyimpan ke database Google Sheets."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mengunduh Template Excel (Priority: P1)

Admin ingin mengunduh template Excel yang sudah terformat agar data yang diinput sesuai dengan struktur yang diharapkan oleh sistem.

**Why this priority**: Template adalah dasar untuk memastikan data yang diunggah valid dan konsisten.

**Independent Test**: Admin mengklik tombol "Unduh Template", mendapatkan file .xlsx, dan membukanya untuk melihat header kolom yang benar.

**Acceptance Scenarios**:

1. **Given** Admin berada di halaman Data Karyawan atau Impor Karyawan, **When** Admin mengklik "Unduh Template", **Then** Sistem mengunduh file Excel dengan header: NIK, Nama Lengkap, Email, Jabatan, Departemen, Gaji Pokok, Tanggal Masuk.

---

### User Story 2 - Mengunggah Data Karyawan Massal (Priority: P1)

Admin ingin mengunggah file Excel yang berisi banyak data karyawan sekaligus untuk mempercepat proses registrasi staf baru.

**Why this priority**: Ini adalah inti dari fitur impor massal.

**Independent Test**: Admin memilih file Excel yang valid, mengunggahnya, dan melihat data tersebut muncul di tabel tinjauan sebelum disimpan.

**Acceptance Scenarios**:

1. **Given** Admin telah mengisi template dengan 5 data karyawan baru, **When** Admin mengunggah file tersebut, **Then** Sistem menampilkan preview data yang akan diimpor.
2. **Given** Admin mengunggah file dengan format yang salah, **When** File diproses, **Then** Sistem menampilkan pesan kesalahan yang jelas.

---

### User Story 3 - Validasi Data & Penanganan Duplikasi (Priority: P1)

Sistem harus memvalidasi data sebelum disimpan untuk mencegah kesalahan input dan NIK ganda di database.

**Why this priority**: Menjaga integritas data database adalah kritikal.

**Independent Test**: Admin mencoba mengimpor data dengan NIK yang sudah ada di sistem dan memverifikasi bahwa sistem menolak baris tersebut.

**Acceptance Scenarios**:

1. **Given** Salah satu baris di Excel memiliki NIK yang sudah terdaftar, **When** Admin memproses impor, **Then** Sistem menandai baris tersebut sebagai error dan tidak menyimpannya.
2. **Given** Format email tidak valid di salah satu baris, **When** Admin memproses impor, **Then** Sistem memberikan peringatan validasi pada baris tersebut.

---

### Edge Cases

- **File Kosong**: Bagaimana jika admin mengunggah file tanpa data baris? (Sistem harus memberikan peringatan "File kosong").
- **Karakter Spesial**: Bagaimana sistem menangani nama atau email dengan karakter spesial?
- **Gaji Non-Numerik**: Bagaimana jika kolom Gaji Pokok diisi teks? (Sistem harus memvalidasi sebagai angka).
- **Format Tanggal**: Bagaimana jika format tanggal di Excel tidak standar (misal: 28/04/2026 vs 2026-04-28)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menyediakan tombol untuk mengunduh template Excel (.xlsx).
- **FR-002**: Sistem HARUS menyediakan area drag-and-drop atau pemilih file untuk mengunggah file Excel.
- **FR-003**: Sistem HARUS membaca file Excel di sisi klien (menggunakan library xlsx).
- **FR-004**: Sistem HARUS menampilkan tabel preview data yang berhasil dibaca dari file.
- **FR-005**: Sistem HARUS memvalidasi setiap baris data: NIK (unik & tidak kosong), Email (format valid), Nama (tidak kosong), Gaji Pokok (numerik).
- **FR-006**: Sistem HARUS melakukan pengecekan NIK terhadap data yang sudah ada di server sebelum finalisasi.
- **FR-007**: Sistem HARUS mengirimkan data yang valid ke backend Google Apps Script dalam satu batch request (jika memungkinkan) atau sekuensial.
- **FR-008**: Sistem HARUS memberikan laporan ringkasan setelah proses selesai (misal: "3 Berhasil, 2 Gagal").

### Key Entities

- **ImportSession**: Mewakili sesi impor yang sedang berlangsung (Daftar baris data, status validasi per baris).
- **Employee**: Entitas target yang akan dibuat/diperbarui.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin dapat mengimpor 50 karyawan dalam satu kali unggah dalam waktu total kurang dari 2 menit (termasuk validasi).
- **SC-002**: Tingkat kegagalan sistem akibat format file yang salah harus mendekati 0% (dengan validasi frontend yang kuat).
- **SC-003**: 100% data yang berhasil diimpor harus muncul dengan benar di tabel Data Karyawan.

## Assumptions

- Admin menggunakan browser modern yang mendukung File API.
- Koneksi internet stabil diperlukan untuk pengecekan NIK dan penyimpanan data ke Google Sheets.
- Template Excel tidak boleh diubah struktur headernya (nama kolom harus tetap).

## Penyelarasan Konstitusi

- **Keamanan**: Data gaji dienkripsi/dilindungi selama transit. Hanya admin yang memiliki akses ke fitur impor ini.
- **Modularitas**: UI Impor menggunakan komponen modal dan tabel yang konsisten dengan desain yang sudah ada.
- **Data**: Memastikan tidak ada NIK ganda yang masuk ke Google Sheets.
- **UX**: Memberikan umpan balik visual (loading spinner, progress bar) selama proses membaca dan mengunggah data.
