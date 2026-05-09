# Implementation Plan: Attendance Analytics Hub

**Branch**: `005-attendance-analytics` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/005-attendance-analytics/spec.md)

## Summary
Building a dedicated analytics hub for tracking employee attendance, punctuality, and work hours. The system will integrate with the existing Supabase backend and provide a high-density, Neumorphic dashboard for HR monitoring and payroll integration.

## Technical Context
- **Frontend**: React/Vite, Recharts, Lucide Icons, Tabler Icons.
- **Backend**: FastAPI, Supabase (PostgreSQL).
- **Style**: Red Embossed Neumorphism (consistent with WKNsite Design System).

## Project Structure

### Documentation
```text
specs/005-attendance-analytics/
├── spec.md              # Requirement definition
├── research.md          # Shift rules & logic
├── data-model.md        # Table schema
├── plan.md              # This file
└── tasks.md             # To be generated
```

### Source Code Changes
```text
apps/server/
├── api/attendance.py     # New API endpoints for analytics
└── utils/attendance_calc.py # Python logic for late/OT calculation

apps/client/src/
├── pages/Attendance/
│   ├── AttendanceHub.jsx # Main analytics dashboard
│   ├── components/       # Visual cards and charts
│   └── hooks/            # API data fetching
└── lib/utils/            # Time formatting helpers
```

## Implementation Workflow

### Phase 1: Database & Backend API
- [ ] Create/Verify `attendance` table in Supabase.
- [ ] Implement `GET /api/attendance/summary` for today's KPIs.
- [ ] Implement `GET /api/attendance/trends` for historical charts.
- [ ] Implement `GET /api/attendance/employee/{id}` for individual reports.

### Phase 2: Frontend Dashboard (Bento Grid)
- [ ] Build the `AttendanceHub.jsx` page structure.
- [ ] Implement KPI cards (Present, Late, Absent).
- [ ] Integrate `recharts` for trend visualization.
- [ ] Implement the detailed attendance log table with filters.

### Phase 3: Payroll Integration & Polish
- [ ] Add "Late Deduction" calculation to the existing Payroll Engine.
- [ ] Apply Neumorphic styling and animations.
- [ ] Implement CSV/Excel export for attendance reports.
