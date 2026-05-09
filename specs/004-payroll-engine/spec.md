# Feature Specification: Professional Payroll Engine

**Feature Branch**: `004-payroll-engine`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Membangun sistem Payroll Engine profesional yang terintegrasi dengan database Supabase. Fitur utama mencakup: 1. Kalkulasi otomatis Gaji Bersih (THP) berdasarkan Gaji Pokok dan Tunjangan. 2. Integrasi data pajak (NPWP/PTKP) dan BPJS. 3. Dashboard rekapitulasi penggajian bulanan di halaman /payroll. 4. Generate slip gaji digital untuk karyawan."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Payroll Calculation (Priority: P1)

As an HR Administrator, I want the system to automatically calculate the Net Salary (Take Home Pay) for all active employees based on their stored salary data and tax/BPJS rules, so that I don't have to calculate them manually.

**Why this priority**: This is the core functionality that provides the most immediate value by reducing manual error and effort.

**Independent Test**: Admin can trigger a "Calculate" action for a specific month and see a list of employees with their calculated Gross and Net salaries.

**Acceptance Scenarios**:

1. **Given** employees have `base_salary` and `allowances` in the database, **When** Admin views the Payroll page, **Then** the system shows the calculated Net Salary for each employee.
2. **Given** an employee has a specific `ptkp_status`, **When** the system calculates payroll, **Then** the income tax (PPh 21) is deducted correctly according to Indonesian tax regulations.

---

### User Story 2 - Payroll Dashboard & History (Priority: P2)

As a Finance Manager, I want to see a summarized dashboard of total payroll expenses for each month and access historical records, so that I can monitor budget allocation and audit past payments.

**Why this priority**: Essential for reporting and financial oversight, but requires the calculation engine (Story 1) to be functional first.

**Independent Test**: Admin can navigate between different months in the Payroll page and see consistent totals and individual records for each period.

**Acceptance Scenarios**:

1. **Given** payroll has been calculated for several months, **When** Admin selects "April 2026", **Then** the dashboard displays the total disbursement and employee list specifically for that month.

---

### User Story 3 - Digital Payslip Generation (Priority: P3)

As an Employee, I want to receive a digital payslip that clearly shows my earnings, deductions (Tax, BPJS), and net pay, so that I have a formal record of my compensation.

**Why this priority**: Improves employee experience and transparency, but is a downstream output of the payroll process.

**Independent Test**: Admin can click "Download Payslip" for an employee and receive a well-formatted PDF document containing all payroll details.

**Acceptance Scenarios**:

1. **Given** a successful payroll run, **When** Admin clicks "Generate PDF", **Then** the system produces a PDF containing Employee Name, ID, Salary Breakdown, Tax Deductions, and Net Pay.

### Edge Cases

- **Missing Data**: What happens when an employee has no `base_salary` defined? (System should flag as error/warning and not include in totals).
- **Mid-month Hires/Resigns**: How does the system handle prorated salaries? (System will assume full month unless specified in Phase 2).
- **Tax Status Change**: How to handle changes in `ptkp_status` mid-cycle? (Calculations should use the status active at the time of payroll run).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch `base_salary` and all allowance fields from the `employees` table.
- **FR-002**: System MUST calculate PPh 21 tax based on `ptkp_status` and annual income projections.
- **FR-003**: System MUST calculate BPJS Ketenagakerjaan and Kesehatan deductions (Company vs Employee share).
- **FR-004**: System MUST store payroll results in a historical table (`payroll_history`) to prevent data loss when employee base data changes.
- **FR-005**: System MUST provide an interface to filter and view payroll by month/year.
- **FR-006**: System MUST generate PDF payslips using a professional template.

### Key Entities *(include if feature involves data)*

- **Payroll Record**: Represents the calculation result for one employee in one period. Key attributes: `employee_id`, `period` (YYYY-MM), `gross_salary`, `tax_deduction`, `bpjs_deduction`, `net_salary`.
- **Tax Configuration**: Represents the percentage and thresholds for PPh 21 and BPJS (can be hardcoded initially or stored in settings).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Payroll calculation for 100+ employees completed in under 5 seconds.
- **SC-002**: Tax and BPJS calculations match manual Indonesian regulations with 100% accuracy.
- **SC-003**: Payslip generation (PDF) takes less than 3 seconds per record.
- **SC-004**: Admin can reconcile monthly totals with a single click.

## Assumptions

- **Tax Rules**: Indonesian tax rules (PPh 21 TER or traditional) will be used as the standard.
- **Currency**: All calculations are in IDR.
- **Data Source**: Supabase `employees` table is the source of truth for salary components.
- **Proration**: Prorated salary for new/resigned employees is out of scope for v1.

## Penyelarasan Konstitusi

- **Keamanan**: Data gaji adalah PII tingkat tinggi. Akses ke halaman Payroll harus dibatasi oleh RBAC (Role-Based Access Control) yang sudah ada.
- **Modularitas**: Kalkulasi logic harus dipisahkan dalam modul service (backend/frontend) agar bisa digunakan kembali untuk simulasi.
- **Data**: Memerlukan tabel baru `payroll_history` di Supabase untuk menyimpan snapshot bulanan.
- **UX**: Dashboard harus mengikuti estetika *Red Embossed Neumorphism* yang konsisten dengan halaman Login dan Overview.
