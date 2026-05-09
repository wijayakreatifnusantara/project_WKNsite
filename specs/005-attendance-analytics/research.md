# Research: Attendance Analytics Hub

**Feature**: Attendance Analytics Hub | **Date**: 2026-05-06

## Shift Rules & Calculations

### 1. Late Threshold
- **Standard Start**: 08:00 AM (local time).
- **Grace Period**: 5 minutes (Late if `clock_in` > 08:05 AM).
- **Calculation**: `late_minutes = max(0, clock_in - 08:00)`.

### 2. Overtime Rules
- **Standard End**: 05:00 PM (local time).
- **Threshold**: Only counts after 60 minutes of extra work (Min 06:00 PM to start counting).
- **Integration**: Must be flagged as `overtime_eligible` in `employees` table.

## Frontend Visualization
- **Library**: `recharts` (already used in `AnalyticsGrid.jsx`).
- **Charts**:
    - **AreaChart**: Daily attendance trends.
    - **PieChart**: Today's status breakdown (Present vs Late vs Absent).
    - **BarChart**: Late minutes by Department.

## Backend Strategy
- Use **Supabase RPC** or **PostgreSQL Views** for complex aggregations (averages, trends) to avoid heavy client-side processing.
- Cache monthly summaries if employee count exceeds 500.

## Integration Points
- **Payroll**: Export `total_late_minutes` and `absence_days` to the payroll calculation logic.
