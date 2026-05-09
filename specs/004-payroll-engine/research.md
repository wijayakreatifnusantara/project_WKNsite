# Research: Professional Payroll Engine

**Feature**: Professional Payroll Engine | **Date**: 2026-05-06

## Decision 1: Tax Calculation Method (PPh 21)
- **Decision**: Use **Tarif Efektif Rata-Rata (TER)** as per PP 58/2023.
- **Rationale**: This is the current legal standard in Indonesia (effective Jan 2024) for monthly payroll withholding.
- **Implementation**:
    - Mapping PTKP status to Categories (A, B, C).
    - Monthly PPh 21 = Gross Salary * TER Percentage.
    - December reconciliation using Pasal 17.

## Decision 2: BPJS Deduction Logic
- **Decision**: Standard statutory rates.
- **Rationale**: Ensures compliance with BPJS Kesehatan and Ketenagakerjaan regulations.
- **Rates**:
    - BPJS Kesehatan: 4% Company, 1% Employee (Max base 12jt).
    - JKK: 0.24% (Low risk default).
    - JKM: 0.3%.
    - JHT: 3.7% Company, 2% Employee.
    - JP: 2% Company, 1% Employee (Max base 10.042.300).

## Decision 3: PDF Generation Library
- **Decision**: Use **@react-pdf/renderer**.
- **Rationale**: Already listed in `package.json` of the client app. It allows creating PDFs using React components, which fits the current tech stack perfectly.
- **Alternative**: `jspdf` (more low-level, harder to style complex layouts).

## Decision 4: Data Storage Strategy
- **Decision**: Create a `payroll_history` table in Supabase.
- **Rationale**: We need to "freeze" the payroll data for each month. If an employee's salary changes next month, the past records must remain unchanged.
- **Columns**: `id`, `employee_id`, `period`, `gross_salary`, `net_salary`, `tax_deduction`, `bpjs_deduction`, `allowances_json`, `created_at`.
