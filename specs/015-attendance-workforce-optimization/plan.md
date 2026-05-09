# Implementation Plan: Attendance & Workforce Optimization

**Branch**: `015-attendance-workforce-optimization` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/015-attendance-workforce-optimization/spec.md`

---

## Summary

Mengintegrasikan mesin geofencing berbasis Haversine ke dalam sistem absensi WKNsite, memungkinkan karyawan HQ dan tim lapangan melakukan check-in mandiri (ESS) dengan validasi koordinat real-time. Admin dapat mengkonfigurasi titik koordinat kantor dan mengassign site untuk tim lapangan. Leave yang disetujui akan otomatis disinkronkan ke tabel attendance.

---

## Technical Context

**Language/Version**: Python 3.11+ (Backend FastAPI), React 18 + Vite (Frontend)  
**Primary Dependencies**: FastAPI, Supabase Python SDK, React, Browser Geolocation API  
**Storage**: Supabase (PostgreSQL) — tabel `employees`, `attendance`, ditambah tabel baru `system_configs`  
**Testing**: Manual browser testing + API inspection via FastAPI docs (/docs)  
**Target Platform**: Web browser (Desktop + Mobile-First)  
**Project Type**: Web application (fullstack: FastAPI backend + React/Vite frontend)  
**Performance Goals**: Check-in validation < 3 detik, akurasi jarak ≤ 5 meter  
**Constraints**: Geolocation hanya berjalan di HTTPS atau localhost; radius default 100m  
**Scale/Scope**: ~50–200 karyawan aktif, single-tenant sistem HR WKN

---

## Constitution Check

*GATE: Harus lulus sebelum Phase 0 research.*

| Prinsip | Status | Catatan |
|---------|--------|---------|
| I. Tata Kelola Keamanan Utama | ✅ LULUS | Endpoint check-in akan memvalidasi employee_id; koordinat tidak disimpan permanen |
| II. Frontend Berbasis Komponen | ✅ LULUS | CheckInCard dan LocationManager dibuat sebagai komponen terpisah yang reusable |
| III. Pengembangan Berbasis Spesifikasi | ✅ LULUS | spec.md → plan.md → tasks.md → implement |
| IV. Integritas & Konsistensi Data | ✅ LULUS | Attendance insert bersifat idempotent (cek duplikasi per employee per hari) |
| V. Responsivitas Mobile-First | ✅ LULUS | CheckInCard dirancang untuk mobile (tombol besar, feedback visual jelas) |

**Hasil Gate**: ✅ SEMUA LULUS — lanjut ke Phase 0

---

## Project Structure

### Documentation (this feature)

```text
specs/015-attendance-workforce-optimization/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── checkin-api.md
│   └── location-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
# Web Application Structure (existing + new)
apps/server/
├── api/
│   └── attendance.py          # EXPAND: tambah 3 endpoint baru
├── utils/
│   ├── supabase_client.py     # EXPAND: tambah metode system_configs
│   └── geofencing.py          # NEW: mesin Haversine + validasi radius
└── models/
    └── employee.py            # MUNGKIN UPDATE: tambah field site

apps/client/src/
├── pages/
│   ├── Attendance/
│   │   ├── AttendanceHub.jsx       # UPDATE: tambah tab Location Config
│   │   └── components/
│   │       └── LocationManager.jsx  # NEW: form admin konfigurasi lokasi
│   └── ESS/
│       └── components/
│           └── CheckInCard.jsx      # NEW: tombol absen + geofencing UI
└── hooks/
    └── useAttendance.js             # UPDATE/NEW: hook untuk check-in state
```

**Structure Decision**: Menggunakan struktur Web Application yang sudah ada (Option 2). Semua kode baru ditempatkan di dalam direktori `apps/server/` dan `apps/client/src/` yang sudah ada untuk menjaga konsistensi arsitektur proyek.

---

## Complexity Tracking

*Tidak ada pelanggaran konstitusi yang perlu dijustifikasi.*
