# Implementation Plan: Activity Audit Trail

**Branch**: `014-activity-audit-trail` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/014-activity-audit-trail/spec.md)

## Summary
Establishing a robust security oversight system that records all administrative mutations across the WKNsite HRIS.

## Technical Context
- **Schema**: Create `audit_logs` table in Supabase.
- **Backend**: FastAPI middleware or helper function `log_activity()` used in all mutation endpoints.
- **UI**: "Security & Logs" module in the Admin section.

## Source Code Changes
```text
apps/server/
├── models/audit.py          # Log schema
└── utils/audit_logger.py    # Helper utility

apps/client/src/
├── pages/Admin/
│   └── AuditTrail.jsx       # High-density activity table
└── components/Common/
    └── DataDiff.jsx         # Visual comparison component
```

## Implementation Workflow

### Phase 1: Database & Backend
- [ ] Create `audit_logs` table.
- [ ] Implement `log_activity` in `apps/server/utils/audit_logger.py`.
- [ ] Integrate logger into key endpoints (Employee Update, Asset Return).

### Phase 2: Audit Interface
- [ ] Build `AuditTrail.jsx` with real-time refresh.
- [ ] Implement multi-column filtering.

### Phase 3: Detail Analysis
- [ ] Build `DataDiff.jsx` for viewing JSON changes.
- [ ] Add "Revert" suggestion (optional/simulated).
