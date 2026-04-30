# Tasks: Manajemen Karyawan

**Input**: Design documents from `/specs/001-employee-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Infrastruktur Bersama)

**Tujuan**: Inisialisasi proyek dan struktur dasar.

- [x] T001 Inisialisasi database SQLite menggunakan `src/utils/init_db.py`
- [x] T002 [P] Buat struktur direktori `src/models/`, `src/api/`, `js/components/`, `js/services/`

---

## Phase 2: Foundational (Prasyarat Pemblokir)

**Tujuan**: Infrastruktur inti yang HARUS selesai sebelum User Story dikerjakan.

- [x] T003 Implementasi helper koneksi database di `src/utils/db.py`
- [x] T004 Konfigurasi entry point backend di `main.py` untuk mendukung API

---

## Phase 3: User Story 1 - Menambah Karyawan Baru (Priority: P1) 🎯 MVP

**Goal**: Admin dapat menginput data karyawan baru ke sistem.

**Independent Test**: Jalankan `index.html`, buka modal tambah, isi data, klik simpan, dan cek di database bahwa baris baru telah ditambahkan.

### Implementation for User Story 1

- [x] T005 [P] [US1] Buat model Employee di `src/models/employee.py` sesuai `data-model.md`
- [x] T006 [US1] Implementasi endpoint `POST /api/employees` di `src/api/employees.py`
- [x] T007 [P] [US1] Buat komponen modal tambah karyawan di `js/components/EmployeeModal.js`
- [x] T008 [US1] Hubungkan tombol "Add Employee" di dashboard ke `EmployeeModal.js` dan panggil service di `js/main.js`

**Checkpoint**: Penambahan karyawan baru berfungsi dan tersimpan di database.

---

## Phase 4: User Story 2 - Melihat & Mencari Daftar Karyawan (Priority: P1) 🎯 MVP

**Goal**: Admin dapat melihat dan menyaring daftar karyawan.

**Independent Test**: Buka tab Employee Data, pastikan daftar muncul. Ketik nama di search bar dan pastikan tabel terfilter secara real-time.

### Implementation for User Story 2

- [x] T009 [US1] Implementasi endpoint `GET /api/employees` (termasuk filter pencarian) di `src/api/employees.py`
- [x] T010 [P] [US1] Buat komponen tabel karyawan di `js/components/EmployeeTable.js`
- [x] T011 [US1] Implementasi logika render tabel dan filter pencarian di `js/main.js`

**Checkpoint**: Daftar karyawan ditampilkan dan fitur pencarian berfungsi.

---

## Phase 5: User Story 3 - Memperbarui Data Karyawan (Priority: P2)

**Goal**: Admin dapat mengubah informasi karyawan yang sudah ada.

**Independent Test**: Klik tombol edit pada salah satu baris karyawan, ubah posisi, simpan, dan pastikan data di tabel berubah.

### Implementation for User Story 3

- [x] T012 [US3] Implementasi endpoint `PUT /api/employees/{id}` di `src/api/employees.py`
- [x] T013 [US3] Perbarui `EmployeeModal.js` agar mendukung mode "Edit" (populasi data otomatis)
- [x] T014 [US3] Tambahkan handler aksi edit pada tabel di `js/main.js`

**Checkpoint**: Perubahan data karyawan tersimpan dan ter-update di UI.

---

## Phase 6: User Story 4 - Menghapus Data Karyawan (Priority: P3)

**Goal**: Admin dapat menonaktifkan data karyawan (Soft Delete).

**Independent Test**: Klik tombol hapus, konfirmasi, pastikan karyawan hilang dari daftar namun tetap ada di database dengan `is_active=0`.

### Implementation for User Story 4

- [x] T015 [US4] Implementasi endpoint `DELETE /api/employees/{id}` (Soft Delete) di `src/api/employees.py`
- [x] T016 [US4] Tambahkan dialog konfirmasi dan handler aksi hapus di `js/main.js`

**Checkpoint**: Penghapusan karyawan (Soft Delete) berhasil.

---

## Phase N: Polish & Cross-Cutting Concerns

**Tujuan**: Perbaikan dan penyelesaian akhir.

- [x] T017 [P] Pastikan tabel karyawan responsif pada layar mobile (CSS media queries)
- [x] T018 Tambahkan validasi frontend untuk semua form input
- [x] T019 Bersihkan kode dan tambahkan dokumentasi fungsi dasar

---

## Strategi Implementasi

### MVP First (User Story 1 & 2)
1. Selesaikan Phase 1 & 2 (Setup & Foundational).
2. Selesaikan Phase 3 (Tambah Karyawan).
3. Selesaikan Phase 4 (Lihat/Cari Karyawan).
4. **VALIDASI**: Admin bisa menambah dan melihat karyawan.

### Pengiriman Inkremental
- Tambahkan Fitur Edit (Phase 5).
- Tambahkan Fitur Hapus (Phase 6).
- Selesaikan Polishing (Phase N).
