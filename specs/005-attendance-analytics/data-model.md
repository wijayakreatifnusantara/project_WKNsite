# Data Model: Attendance Analytics Hub

**Feature**: Attendance Analytics Hub | **Date**: 2026-05-06

## Existing/New Tables

### `attendance`
Stores individual clock-in/out events or daily summaries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `employee_id` | text (FK) | Reference to `employees.employee_id` |
| `date` | date | The work date (YYYY-MM-DD) |
| `clock_in` | timestamptz | Recorded time of entry |
| `clock_out` | timestamptz | Recorded time of exit |
| `status` | text | "Present", "Late", "Absent", "Leave" |
| `late_minutes` | integer | Calculated minutes after shift start |
| `overtime_minutes` | integer | Calculated minutes after shift end |
| `location_lat` | float | Latitude of check-in (Optional) |
| `location_lng` | float | Longitude of check-in (Optional) |
| `photo_url` | text | URL to check-in photo (Optional) |

## Aggregations (Views/Calculations)

### `attendance_summary_monthly`
Used for the analytics hub charts.

| Field | Description |
|-------|-------------|
| `period` | YYYY-MM |
| `total_present` | Count of unique employees with "Present" or "Late" |
| `avg_late_minutes` | Average delay per employee |
| `discipline_score` | Calculated metric based on punctuality |

## Relationships
- `attendance.employee_id` -> `employees.employee_id` (Many-to-One)
