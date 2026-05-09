# Tasks: AI Burnout Predictor

**Input**: Design documents from `/specs/010-burnout-predictor/`
**Prerequisites**: spec.md, plan.md

## Phase 1: Analytical Backend

- [x] T001 Create `apps/server/utils/burnout_engine.py` for risk scoring logic
- [x] T002 Implement `GET /api/performance/burnout-risk/{employee_id}` fetching attendance and performance trends
- [x] T003 Register burnout routes in `apps/server/main.py`

---

## Phase 2: Frontend Data Hook

- [x] T004 Update `usePerformance.js` to include `fetchBurnoutRisk` method
- [x] T005 Test API connectivity for risk data

---

## Phase 3: Wellness UI Components

- [x] T006 Build `RiskGauge.jsx` using a Neumorphic circular progress bar
- [x] T017 Build `BurnoutFactors.jsx` to list contributing metrics (Late count, Score drop)
- [x] T008 Integrate wellness section into the `PerformanceHub.jsx` detail view

---

## Phase 4: Proactive Recommendations

- [x] T009 Implement "AI Insights" card (e.g. "Employee shows high late pattern, recommend wellness check")
- [x] T010 Add "Take Action" buttons (e.g. "Grant Leave", "Schedule 1-on-1")
