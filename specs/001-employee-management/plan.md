# Implementation Plan: Manajemen Karyawan (Employee Management)

**Branch**: `001-employee-management` | **Date**: 2026-04-26 | **Spec**: [spec.md](file:///e:/project_website_database_gaji/specs/001-employee-management/spec.md)
**Input**: Feature specification from `/specs/001-employee-management/spec.md`

## Summary
Implementasi sistem manajemen karyawan (CRUD) menggunakan Python untuk backend dan Vanilla JS/CSS untuk frontend. Data akan disimpan dalam database SQLite dengan dukungan kebijakan Soft Delete.

## Technical Context

**Language/Version**: Javascript ESM (Frontend), Google Apps Script (Backend)
**Primary Dependencies**: Google Apps Script API
**Storage**: Google Sheets (Cloud Storage)
**Testing**: Manual Browser Verification
**Target Platform**: Web Browsers (Online)
**Project Type**: Serverless Web Application
**Performance Goals**: < 300ms search latency, < 45s for record creation
**Constraints**: Tanpa frontend frameworks (Vanilla JS only), Harus responsif mobile.
**Scale/Scope**: Manajemen data karyawan dasar (CRUD + Search).

## Pengecekan Konstitusi

*GERBANG: Harus lulus sebelum Riset Fase 0. Periksa kembali setelah Desain Fase 1.*

- **I. Tata Kelola Keamanan Utama**: Fitur ini menangani data gaji. Kontrol akses akan diimplementasikan melalui pemeriksaan sesi pada backend.
- **II. Frontend Berbasis Komponen**: UI menggunakan sistem modal dan tabel yang reusable (akan didefinisikan di `js/components/`).
- **III. Pengembangan Berbasis Spesifikasi**: Ya, `spec.md` telah disahkan.
- **IV. Integritas & Konsistensi Data**: Menggunakan SQLite dengan constraint `UNIQUE` pada NIK dan kolom `is_active` untuk Soft Delete.
- **V. Responsivitas Mobile-First**: Layout menggunakan Flexbox dan Grid untuk memastikan tabel tetap terbaca di ponsel.

## Project Structure

### Documentation (this feature)

```text
specs/001-employee-management/
├── plan.md              # Rencana ini
├── research.md          # Keputusan teknis (Soft Delete & DB Schema)
├── data-model.md        # Skema tabel employees
├── quickstart.md        # Panduan setup database
└── contracts/           # Definisi API/Data flow (JSON format)
```

### Source Code (repository root)

```text
# Menggunakan Opsi 1: Single project
js/
├── main.js              # Entry point frontend
├── components/          # UI Components (Modal, Table)
└── services/            # API calls

src/                     # Python Backend
├── models/              # Database models
├── api/                 # Endpoint logic
└── utils/               # Database connection helper

tests/
├── integration/         # Backend CRUD tests
└── unit/                # Validation logic tests
```

**Structure Decision**: Menggunakan **Option 1 (Single Project)** namun dengan pemisahan direktori `js/` untuk frontend dan `src/` untuk Python backend agar tetap terorganisir.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| none | n/a | n/a |
