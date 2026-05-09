# Data Model: Professional Payroll Engine

**Feature**: Professional Payroll Engine | **Date**: 2026-05-06

## New Tables

### `payroll_history`
Stores the snapshot of monthly payroll runs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `employee_id` | text (FK) | Reference to `employees.employee_id` |
| `period` | text | Period in `YYYY-MM` format (e.g., "2026-04") |
| `base_salary` | numeric | The base salary at the time of run |
| `allowances_total` | numeric | Sum of all allowances |
| `gross_salary` | numeric | Total earnings before deductions |
| `tax_deduction` | numeric | PPh 21 amount |
| `bpjs_health_deduction` | numeric | Employee share of BPJS Kesehatan |
| `bpjs_employment_deduction` | numeric | Employee share of JHT + JP |
| `net_salary` | numeric | Final Take Home Pay |
| `status` | text | "Draft", "Paid", "Cancelled" |
| `meta_data` | jsonb | Full breakdown (allowances, tax category, etc.) |
| `created_at` | timestamptz | System record timestamp |

## Relationships
- `payroll_history.employee_id` -> `employees.employee_id` (Many-to-One)

## Validation Rules
- `period` must be unique per `employee_id` (cannot run payroll twice for the same person in the same month).
- `gross_salary` must be >= 0.
- `status` must be one of the predefined values.
