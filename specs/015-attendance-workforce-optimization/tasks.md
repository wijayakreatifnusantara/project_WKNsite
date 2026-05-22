# Tasks: Attendance & Workforce Optimization

**Input**: Design documents dari `/specs/015-attendance-workforce-optimization/`
**Branch**: `015-attendance-workforce-optimization`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Organization**: Tugas dikelompokkan per user story untuk memungkinkan implementasi & pengujian independen.

## Format: `[ID] [P?] [Story] Deskripsi`

- **[P]**: Dapat dijalankan paralel (file berbeda, tidak saling bergantung)
- **[Story]**: User story terkait ([US1], [US2], [US3])
- Setiap tugas mencantumkan file path yang tepat

---

## Phase 1: Setup (Infrastruktur Awal)

**Tujuan**: Persiapan database dan struktur file baru sebelum implementasi fitur

- [x] T001 Jalankan SQL migration: tambah kolom `assigned_site_lat`, `assigned_site_long`, `is_field_team` ke tabel `employees` di Supabase (via SQL Editor)
- [x] T002 Jalankan SQL migration: buat tabel `system_configs` dengan kolom `key`, `value` (JSONB), `updated_at` di Supabase
- [x] T003 Insert seed data default HQ location ke tabel `system_configs` (key: `hq_location`, value: `{"lat": -6.2088, "lon": 106.8456, "radius": 100, "name": "WKN HQ Jakarta"}`)
- [x] T004 Jalankan SQL migration: tambah UNIQUE constraint `attendance_employee_date_unique` pada kolom `(employee_id, date)` di tabel `attendance`

**Checkpoint**: Database siap — lanjut ke Phase 2

---

## Phase 2: Foundational (Backend Core — Memblokir Semua User Story)

**Tujuan**: Infrastruktur backend yang HARUS selesai sebelum user story apapun dapat diimplementasikan

**⚠️ CRITICAL**: Tidak ada pekerjaan user story yang dapat dimulai hingga phase ini selesai

- [X] T005 Buat file baru `apps/server/utils/geofencing.py` dengan fungsi `haversine_distance(lat1, lon1, lat2, lon2) -> float`
- [X] T006 Tambahkan fungsi `is_within_radius(user_lat, user_lon, target_lat, target_lon, radius=100) -> bool` ke `apps/server/utils/geofencing.py`
- [X] T007 [P] Tambahkan method `get_system_config(key: str) -> dict` ke class `WKNSupabaseClient` di `apps/server/utils/supabase_client.py`
- [X] T008 [P] Tambahkan method `set_system_config(key: str, value: dict) -> bool` ke class `WKNSupabaseClient` di `apps/server/utils/supabase_client.py`
- [X] T009 Tambahkan method `get_employee_by_id(employee_id: str) -> dict` ke `apps/server/utils/supabase_client.py`

**Checkpoint**: Mesin geofencing dan konfigurasi DB siap — mulai user story

---

## Phase 3: User Story 1 — HQ Check-in dengan Geofencing (Priority: P1) 🎯 MVP

**Goal**: Karyawan HQ dapat check-in mandiri via browser dengan validasi geofencing 100m dari koordinat HQ

**Independent Test**: Buka halaman ESS → klik "Absen Sekarang" → browser minta izin GPS → tampilkan status Present/Late/Out of Range berdasarkan jarak dari HQ

### Implementasi User Story 1

- [X] T010 [US1] Tambahkan endpoint `POST /attendance/check-in` ke `apps/server/api/attendance.py`
- [X] T011 [US1] Buat komponen React `apps/client/src/pages/ESS/components/CheckInCard.jsx`
- [X] T012 [US1] Integrasi `CheckInCard` ke halaman ESS yang sudah ada di `apps/client/src/pages/ESS/MobileHome.jsx`
- [X] T013 [US1] Tambahkan endpoint `GET /attendance/settings` ke `apps/server/api/attendance.py`

**Checkpoint**: US1 selesai — karyawan HQ dapat check-in mandiri ✅

---

## Phase 4: User Story 2 — Field Team Check-in (Priority: P1)

**Goal**: Tim lapangan dapat check-in di koordinat site yang di-assign Admin, bukan HQ

**Independent Test**: Ubah `is_field_team = true` dan isi `assigned_site_lat/long` untuk employee test → check-in dari lokasi site → berhasil; check-in dari HQ → out of range

### Implementasi User Story 2

- [X] T014 [US2] Update endpoint `POST /attendance/check-in` — logika field team vs HQ sudah diimplementasikan
- [X] T015 [US2] Update komponen `CheckInCard.jsx` — badge Field Team + label dinamis lokasi target

**Checkpoint**: US2 selesai — field team dapat check-in di site mereka ✅

---

## Phase 5: User Story 3 — Location Management by Admin (Priority: P2)

**Goal**: Admin dapat mengubah koordinat HQ dan mengassign site koordinat untuk field team via UI dashboard

**Independent Test**: Login sebagai Admin → Attendance Hub → tab "Location Config" → ubah HQ radius menjadi 150m → simpan → coba check-in kembali → radius baru berlaku

### Implementasi User Story 3

- [X] T016 [P] [US3] Tambahkan endpoint `PUT /attendance/settings` ke `apps/server/api/attendance.py`
- [X] T017 [P] [US3] Tambahkan endpoint `PUT /attendance/employees/{id}/site` ke `apps/server/api/attendance.py`
- [X] T018 [US3] Buat komponen `apps/client/src/pages/Attendance/components/LocationManager.jsx`
- [X] T019 [US3] Update `apps/client/src/pages/Attendance/AttendanceHub.jsx` — tambah tab "📍 Location"

**Checkpoint**: US3 selesai — Admin dapat kelola lokasi via UI ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Tujuan**: Penyempurnaan yang mempengaruhi semua user story

- [X] T020 [P] Update memory progress file di `.specify/memory/attendance-optimization-progress.md` — tandai semua fase sebagai selesai
- [X] T021 Tambahkan endpoint `GET /attendance/late-alerts` di `apps/server/api/attendance.py`
- [X] T022 [P] Implementasi Leave-Attendance Sync via `supabase_client.sync_leave_to_attendance()` di `apps/server/api/leave.py`
- [X] T023 [P] Review design token consistency
- [X] T024 Verifikasi mobile-first viewport test

---

## Dependencies & Urutan Eksekusi

### Dependency Antar Phase

- **Phase 1 (Setup)**: Mulai langsung — tidak ada dependency
- **Phase 2 (Foundational)**: Bergantung pada Phase 1 selesai — **memblokir semua Phase 3+**
- **Phase 3 (US1)**: Bergantung pada Phase 2 selesai
- **Phase 4 (US2)**: Bergantung pada Phase 2 + Phase 3 selesai (memperluasnya)
- **Phase 5 (US3)**: Bergantung pada Phase 2 selesai — dapat paralel dengan Phase 3 & 4
- **Phase 6 (Polish)**: Bergantung pada Phase 3, 4, 5 selesai

### Dependency Antar User Story

- **US1 (HQ Check-in)**: Dapat mulai setelah Phase 2 — tidak ada dependency user story lain
- **US2 (Field Team)**: Dapat mulai setelah Phase 2 — EXTEND US1, tidak break independence
- **US3 (Admin Location)**: Dapat mulai setelah Phase 2 — independen dari US1 & US2

### Di Dalam Setiap Phase

- Geofencing utilities (T005, T006) → sebelum endpoint check-in (T010)
- Database methods (T007, T008, T009) → sebelum endpoint apapun
- Backend endpoint → sebelum frontend component

### Peluang Paralel

- T007 dan T008 dapat dikerjakan bersamaan (file yang sama, tidak konflik)
- T016 dan T017 dapat dikerjakan bersamaan (endpoint berbeda)
- T020 dan T021 dapat dikerjakan bersamaan
- T022 dan T023 dapat dikerjakan bersamaan

---

## Parallel Example: Phase 3 (US1)

```
Mulai T010 (Backend check-in endpoint)
  BERSAMAAN DENGAN
T013 (Backend settings endpoint)
  ↓ setelah keduanya selesai
T011 (Frontend CheckInCard)
  ↓
T012 (Integrate ke ESS page)
```

---

## Implementation Strategy

### MVP First (User Story 1 Saja)

1. Selesaikan Phase 1: Database Migration (T001–T004)
2. Selesaikan Phase 2: Backend Core (T005–T009)
3. Selesaikan Phase 3: US1 (T010–T013)
4. **STOP & VALIDASI**: Test check-in HQ secara end-to-end
5. Deploy/demo jika siap

### Incremental Delivery

1. Phase 1 + 2 → Foundation siap
2. Phase 3 → MVP: HQ Check-in ✅
3. Phase 4 → Field Team ✅
4. Phase 5 → Admin Location Manager ✅
5. Phase 6 → Polish & Leave Sync ✅

---

## Notes

- **[P]** = file berbeda, tidak ada dependency yang belum selesai
- **[Story]** = label traceability ke user story di spec.md
- Commit setelah setiap task atau grup logis selesai
- Stop di setiap checkpoint untuk memvalidasi story secara independen
- Koordinat default HQ (`-6.2088, 106.8456`) adalah placeholder — Admin dapat mengubah via LocationManager setelah US3 selesai
- Pastikan browser test dilakukan di localhost (Geolocation API tidak berfungsi di HTTP non-localhost)

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 24 |
| Phase 1 (Setup) | 4 tasks |
| Phase 2 (Foundational) | 5 tasks |
| Phase 3 (US1 - P1) | 4 tasks |
| Phase 4 (US2 - P1) | 2 tasks |
| Phase 5 (US3 - P2) | 4 tasks |
| Phase 6 (Polish) | 5 tasks |
| Parallelizable Tasks | 10 tasks |
| MVP Scope | Phase 1 + 2 + 3 (13 tasks) |
