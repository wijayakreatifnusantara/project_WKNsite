# Implementation Plan: Performance (KPI) System

**Branch**: `009-performance-kpi` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/009-performance-kpi/spec.md)

## Summary
Implementing a professional performance appraisal system integrated with the HRIS, featuring weighted KPI scoring and visual analytics.

## Technical Context
- **Backend**: FastAPI for KPI management and review processing.
- **Database**: `kpi_metrics` and `performance_reviews` tables in Supabase.
- **UI**: Neumorphic Performance Dashboard with Radar/Spider charts.

## Project Structure

### Documentation
```text
specs/009-performance-kpi/
├── spec.md
├── data-model.md
├── plan.md
└── tasks.md
```

### Source Code Changes
```text
apps/server/
├── api/performance.py      # KPI & Review endpoints
└── utils/performance_calc.py # Scoring logic

apps/client/src/
├── pages/Performance/
│   ├── PerformanceHub.jsx   # Main dashboard
│   ├── components/          # Radar charts, scorecards
│   └── hooks/               # Performance API hooks
```

## Implementation Workflow

### Phase 1: Foundations
- [ ] Create `kpi_metrics` and `performance_reviews` tables.
- [ ] Implement KPI configuration API.

### Phase 2: Review Workflow
- [ ] Build `ReviewFormModal.jsx` for inputting scores.
- [ ] Implement backend scoring logic with weights.
- [ ] Create `usePerformance` custom hook.

### Phase 3: Analytics & Visualization
- [ ] Integrate `RadarChart` from `recharts` for individual performance views.
- [ ] Build "Leaderboard" component for top performers.
- [ ] Implement historical score tracking (Line Chart).
