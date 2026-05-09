# Implementation Plan: Professional Payroll Engine

**Branch**: `004-payroll-engine` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/004-payroll-engine/spec.md)

## Summary
Implementing a professional-grade payroll system that automates salary calculations, tax (PPh 21 TER) compliance, and BPJS deductions. The feature includes a dynamic dashboard for HR administrators to run, review, and finalize monthly payrolls, culminating in digital payslip generation.

## Technical Context
- **Language/Version**: JavaScript (React/Vite), Python (FastAPI)
- **Primary Dependencies**: 
    - `@supabase/supabase-js`: Data persistence and real-time updates.
    - `@react-pdf/renderer`: For client-side payslip generation.
    - `dayjs`: Date manipulation for periods.
- **Database**: Supabase (PostgreSQL)
- **Design Style**: Red Embossed Neumorphism (consistent with `Login.jsx` and `Overview.jsx`).
- **Performance Goals**: Calculate 100+ payrolls in <2s; Generate PDF in <3s.

## Pengecekan Konstitusi

- **I. Tata Kelola Keamanan Utama**: Menggunakan RBAC yang ada (`MANAGE_PAYROLL` permission). Data gaji dienkripsi secara transit oleh Supabase.
- **II. Frontend Berbasis Komponen**: Menggunakan komponen UI dari `@/components/ui` (shadcn-like) dengan custom Neumorphic styling.
- **III. Pengembangan Berbasis Spesifikasi**: Mengikuti `spec.md` yang mendefinisikan PPh 21 TER dan integrasi BPJS.
- **IV. Integritas & Konsistensi Data**: Menambahkan tabel `payroll_history` untuk audit trail. Tidak mengubah skema `employees` yang sudah ada, hanya membacanya.
- **V. Responsivitas Mobile-First**: Dashboard dioptimalkan untuk desktop (Admin use case), namun layout tabel menggunakan overflow untuk layar kecil.

## Project Structure

### Documentation
```text
specs/004-payroll-engine/
├── spec.md              # Requirement definition
├── research.md          # PPh 21 TER & BPJS logic
├── data-model.md        # Database schema for payroll_history
├── plan.md              # This file
└── tasks.md             # Implementation tasks
```

### Source Code Changes
```text
apps/server/
├── api/payroll.py       # New API endpoints for calculation & history
└── utils/payroll_calc.py # Python logic for PPh 21 TER & BPJS

apps/client/src/
├── pages/Payroll/
│   ├── Payroll.jsx      # Main dashboard (Dynamic)
│   ├── components/      # UI sub-components
│   └── utils/           # Frontend calculation helpers
└── lib/pdf/             # Payslip PDF templates
```

## Implementation Workflow

### Phase 0: Research & Logic Verification
- [x] Research PPh 21 TER (2024) and BPJS rates.
- [ ] Create a test suite for the payroll calculator in Python to verify accuracy against DJP standards.

### Phase 1: Database & Backend API
- [ ] Create `payroll_history` table in Supabase.
- [ ] Implement `POST /api/payroll/calculate` endpoint to run simulations.
- [ ] Implement `POST /api/payroll/finalize` to save records to history.
- [ ] Implement `GET /api/payroll/history` to fetch past periods.

### Phase 2: Frontend Dashboard Integration
- [ ] Refactor `Payroll.jsx` to fetch real data from Supabase.
- [ ] Implement "Run Payroll" modal with period selection and progress bar.
- [ ] Build the "Summary Card" grid (Total Payroll, Tax, BPJS).
- [ ] Implement PDF Payslip generator using `@react-pdf/renderer`.

### Phase 3: Polish & Security
- [ ] Apply Neumorphic styling (Red Embossed) to all new UI elements.
- [ ] Finalize permission checks (RBAC) for all payroll routes.
