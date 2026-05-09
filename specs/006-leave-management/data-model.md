# Data Model: Leave Management System

**Feature**: Leave Management System | **Date**: 2026-05-06

## New Tables

### `leave_requests`
Stores leave applications and their statuses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `employee_id` | text (FK) | Reference to `employees.employee_id` |
| `leave_type` | text | "Annual", "Sick", "Emergency", "Unpaid" |
| `start_date` | date | First day of leave |
| `end_date` | date | Last day of leave |
| `days_count` | integer | Total working days taken |
| `reason` | text | Employee's justification |
| `attachment_url` | text | Link to medical note / document |
| `status` | text | "Pending", "Approved", "Rejected" |
| `approved_by` | text | Admin ID who approved |
| `applied_at` | timestamptz | Date of application |

## Table Modifications

### `employees`
- Add `annual_leave_balance` (Integer, default 12).
- Add `sick_leave_balance` (Integer, optional).

## Logic Rules
1. **Weekend Exclusion**: Calculation of `days_count` should exclude Saturday and Sunday.
2. **Quota Deduction**: Only "Approved" and "Annual" leave should deduct from `annual_leave_balance`.
3. **Over-quota**: If balance < requested days, status should default to "Unpaid" or block request.
