# Feature Specification: Attendance Analytics Hub

**Feature Branch**: `005-attendance-analytics`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Membangun modul Attendance Analytics untuk melacak kehadiran karyawan, keterlambatan, dan jam kerja lembur. Modul ini akan memberikan visualisasi tren kehadiran bulanan dan integrasi data absensi ke sistem payroll."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Attendance Dashboard (Priority: P1)

As an HR Manager, I want to see a real-time summary of today's attendance (who is in, late, or absent), so that I can monitor workforce availability at a glance.

**Why this priority**: Essential for daily operations and immediate visibility.

**Independent Test**: Admin can open the /attendance page and see cards showing "Present Today", "Late Today", and "Absent Today".

---

### User Story 2 - Monthly Attendance Trends & Analytics (Priority: P2)

As a Management Executive, I want to see monthly trends of attendance and late percentages by department, so that I can identify patterns and improve discipline.

**Why this priority**: High-level reporting for decision-making.

**Independent Test**: Admin can select a month and see a chart (Line or Bar) showing attendance trends over time.

---

### User Story 3 - Attendance-to-Payroll Integration (Priority: P2)

As a Payroll Admin, I want the system to calculate total late minutes and absence days for each employee, so that these can be used as inputs for salary deductions.

**Why this priority**: Automates the link between behavior and compensation.

**Independent Test**: Admin can see a table of employees with "Total Late Minutes" and "Total Work Hours" for a selected period.

## Functional Requirements

1. **Dashboard Visuals**:
    - Neumorphic Bento Grid layout for KPIs.
    - Interactive charts using Recharts.
    - Filter by Department and Period (Monthly).
2. **Data Processing**:
    - Calculate "Late" based on a configurable shift start time (e.g., 08:00 AM).
    - Aggregate attendance logs from Supabase `attendance` table.
3. **Exporting**:
    - Export attendance reports to Excel/CSV for manual audit.

## Success Criteria

1. Dashboard loads in < 2 seconds.
2. Calculation of late minutes is accurate based on shift rules.
3. Neumorphic UI design is consistent with the rest of the application (Red Embossed).
