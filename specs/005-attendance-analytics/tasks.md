# Tasks: Attendance Analytics Hub

**Input**: Design documents from `/specs/005-attendance-analytics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure for attendance module in `apps/server/api/attendance.py` and `apps/client/src/pages/Attendance/`
- [x] T002 Register `attendance_router` in `apps/server/main.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Create `attendance` table in Supabase per `data-model.md`
- [x] T004 [P] Implement late/overtime calculation utility in `apps/server/utils/attendance_calc.py`
- [x] T005 [P] Create `useAttendance` custom hook for fetching data in `apps/client/src/pages/Attendance/hooks/useAttendance.js`

**Checkpoint**: Foundation ready - attendance logic and storage are initialized.

---

## Phase 3: User Story 1 - Real-time Attendance Dashboard (Priority: P1) 🎯 MVP

**Goal**: Show today's attendance summary cards.

**Independent Test**: Navigate to /attendance and see cards for Present, Late, and Absent with real data.

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement `GET /api/attendance/summary/today` endpoint in `apps/server/api/attendance.py`
- [x] T007 [US1] Build the `AttendanceHub.jsx` main layout in `apps/client/src/pages/Attendance/AttendanceHub.jsx`
- [x] T008 [US1] Create Neumorphic KPI cards (Present, Late, Absent) in `apps/client/src/pages/Attendance/components/AttendanceKPI.jsx`
- [x] T009 [US1] Add "Live Status" feed to show recent check-ins in `apps/client/src/pages/Attendance/components/LiveFeed.jsx`

**Checkpoint**: User Story 1 functional - HR can monitor today's attendance.

---

## Phase 4: User Story 2 - Monthly Attendance Trends & Analytics (Priority: P2)

**Goal**: Visualize historical attendance patterns.

**Independent Test**: Select a month and see the Line chart showing attendance percentages over time.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement `GET /api/attendance/analytics/trends` endpoint for historical data in `apps/server/api/attendance.py`
- [x] T011 [US2] Integrate `AreaChart` from `recharts` for daily trends in `apps/client/src/pages/Attendance/components/TrendsChart.jsx`
- [x] T012 [US2] Create "Late Minutes by Department" Bar chart in `apps/client/src/pages/Attendance/components/DeptLateChart.jsx`
- [x] T013 [US2] Add period (month/year) filter to the Attendance Hub

**Checkpoint**: User Story 2 functional - Management can analyze historical trends.

---

## Phase 5: User Story 3 - Attendance-to-Payroll Integration (Priority: P2)

**Goal**: Feed late minutes and absences into the Payroll Engine.

**Independent Test**: Finalize a payroll run and see deductions based on the employee's late records.

### Implementation for User Story 3

- [x] T014 [P] [US3] Implement `GET /api/attendance/report/payroll` to aggregate data per employee in `apps/server/api/attendance.py`
- [x] T015 [US3] Update `apps/server/utils/payroll_calc.py` to include `late_deduction` based on minutes
- [x] T016 [US3] Update Payroll UI to show "Attendance Deductions" in the breakdown list

**Checkpoint**: User Story 3 functional - Payroll is now accurate based on attendance.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 Apply "Red Embossed" Neumorphic styling to all attendance charts and tables
- [ ] T018 Implement CSV/Excel export for the detailed attendance log
- [ ] T019 Add "Late Warning" notifications in the System Alerts card of the Overview page

---

## Dependencies & Execution Order

- **Phase 1 & 2**: MUST be completed first.
- **US1 & US2**: Can be worked on in parallel.
- **US3**: Depends on US1/US2 being data-ready and the existing Payroll module.

## Parallel Example: Foundational

```bash
# Backend and Frontend hooks can be built together
Task T004: Implement calculation utility
Task T005: Create useAttendance hook
```
