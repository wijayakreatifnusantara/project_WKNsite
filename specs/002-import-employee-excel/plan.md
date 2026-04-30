# Implementation Plan: Import Karyawan via Excel

**Branch**: `002-import-employee-excel` | **Date**: 2026-04-28 | **Spec**: [spec.md](file:///e:/project_website_database_gaji/specs/002-import-employee-excel/spec.md)
**Input**: Feature specification from `/specs/002-import-employee-excel/spec.md`

## Summary

Implementasi fitur impor data karyawan dari file Excel (.xlsx) menggunakan library `xlsx` di sisi frontend untuk parsing dan Google Apps Script di sisi backend untuk penyimpanan ke Google Sheets. Fitur ini akan mencakup pengunduhan template, validasi data di client-side (format & duplikasi NIK), serta pengiriman data secara batch ke server.

## Technical Context

**Language/Version**: Javascript ESM (Frontend), Google Apps Script (Backend)
**Primary Dependencies**: SheetJS (xlsx.full.min.js)
**Storage**: Google Sheets
**Testing**: Manual Browser Verification
**Target Platform**: Web Browsers
**Project Type**: Serverless Web Application
**Performance Goals**: < 2 menit untuk 50 baris data
**Constraints**: Tanpa frontend frameworks, Harus responsif mobile
**Scale/Scope**: Fitur admin untuk registrasi karyawan massal

## Pengecekan Konstitusi

*GERBANG: Harus lulus sebelum Riset Fase 0. Periksa kembali setelah Desain Fase 1.*

- **I. Tata Kelola Keamanan Utama**: Fitur ini menangani data gaji pokok. Hanya role 'Super Admin', 'Admin', dan 'HRD' yang diizinkan mengakses fitur ini. Log aktivitas akan dicatat saat impor berhasil.
- **II. Frontend Berbasis Komponen**: Menggunakan modal baru `ImportEmployeeModal` yang mengikuti pola komponen yang ada di `main.js`.
- **III. Pengembangan Berbasis Spesifikasi**: Ya, `spec.md` sudah tersedia dan mencakup kriteria penerimaan.
- **IV. Integritas & Konsistensi Data**: Validasi NIK dilakukan dua kali: di frontend (terhadap cache lokal) dan di backend (saat penulisan ke Google Sheets).
- **V. Responsivitas Mobile-First**: Tabel preview impor akan menggunakan kontainer scrollable agar tetap usable di layar kecil.

## Project Structure

### Documentation (this feature)

```text
specs/002-import-employee-excel/
├── plan.md              # Rencana ini
├── spec.md              # Spesifikasi fitur
├── research.md          # Riset tentang limitasi Google Apps Script batch update
└── data-model.md        # Definisi kolom Excel vs Google Sheets
```

### Source Code (repository root)

```text
js/
├── main.js              # Penambahan logika navigasi dan modal impor
└── services/            # (Jika dipisahkan) API call untuk bulk import

index.html               # Penambahan nav item atau tombol pemicu
```

**Structure Decision**: Mengikuti struktur yang sudah ada di proyek dengan memodifikasi `main.js` untuk menambahkan komponen UI dan logika pemrosesan file.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| none | n/a | n/a |
