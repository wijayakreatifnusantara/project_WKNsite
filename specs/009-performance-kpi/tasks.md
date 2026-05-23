# Tasks: Performance (KPI) System

**Input**: Design documents from `/specs/009-performance-kpi/`
**Prerequisites**: plan.md, spec.md, data-model.md

## Phase 1: Setup & Infrastructure

- [x] T001 Create project structure for performance module in `apps/server/api/performance.py` and `apps/client/src/pages/Performance/`
- [x] T002 Create `kpi_metrics` and `performance_reviews` tables in Supabase per `data-model.md`
- [x] T003 Register `performance_router` in `apps/server/main.py`

---

## Phase 2: Backend KPI Logic

- [x] T004 [P] Implement `GET /api/performance/metrics` to fetch evaluation indicators
- [x] T005 [P] Implement `POST /api/performance/reviews` for submitting appraisals
- [x] T006 [P] Implement scoring logic in `apps/server/utils/performance_calc.py` to calculate weighted totals
- [x] T007 Create `usePerformance` custom hook for frontend in `apps/client/src/pages/Performance/hooks/usePerformance.js`

**Checkpoint**: Backend ready - KPI scoring engine is functional.

---

## Phase 3: User Story 1 - KPI Configuration (Priority: P1)

**Goal**: Standardize performance metrics.

- [x] T008 [US1] Build `MetricSettings.jsx` for Admin to manage KPI indicators and weights
- [x] T009 [US1] Implement weight validation (ensure total = 100%)
- [x] T010 [US1] Build indicator indicator cards for the settings view

**Checkpoint**: US1 functional - Indicators are ready for use.

---

## Phase 4: User Story 2 - Performance Review Workflow (Priority: P1)

**Goal**: Enable managers to score team members.

- [x] T011 [US2] Build `PerformanceHub.jsx` main dashboard for managers
- [x] T012 [US2] Build `ReviewFormModal.jsx` for inputting scores (1-5 range) and feedback
- [x] T013 [US2] Implement draft/submit states for reviews

**Checkpoint**: US2 functional - Managers can submit performance reviews.

---

## Phase 5: User Story 3 - Performance Analytics (Priority: P2)

**Goal**: Visual data representation.

- [x] T014 [US3] Build `PerformanceRadarChart.jsx` using Recharts to visualize score distribution
- [x] T015 [US3] Build "Top Performers" leaderboard card
- [x] T016 [US3] Implement historical trend chart (Line Chart) for scores over multiple periods

---

## Phase 6: Polish & UI Excellence

- [x] T017 Apply "Red Embossed" Neumorphic styling to all review and metric cards
- [x] T018 Add "Performance Badge" logic (A, B, C, D) based on total score
- [x] T019 Implement export to PDF for individual performance reports
- [x] T020 Add notification alerts for pending reviews
