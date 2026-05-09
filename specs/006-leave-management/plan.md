# Implementation Plan: Leave Management System

**Branch**: `006-leave-management` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/006-leave-management/spec.md)

## Summary
Building a professional leave management module that automates the request-approval cycle and tracks annual leave balances.

## Technical Context
- **Backend**: FastAPI with `supabase-py`.
- **Database**: `leave_requests` table with status workflow.
- **Frontend**: React with Neumorphic components.

## Project Structure

### Documentation
```text
specs/006-leave-management/
├── spec.md
├── data-model.md
├── plan.md
└── tasks.md
```

### Source Code Changes
```text
apps/server/
├── api/leave.py          # New API endpoints for leave requests
└── utils/leave_logic.py   # Business logic for quota & status

apps/client/src/
├── pages/Leave/
│   ├── LeaveManager.jsx   # Admin view for requests
│   ├── LeaveRequest.jsx   # Employee view for applying
│   └── hooks/             # API data fetching
```

## Implementation Workflow

### Phase 1: Database & API
- [ ] Create `leave_requests` table in Supabase.
- [ ] Add `leave_balance` column to `employees` table (or separate table).
- [ ] Implement `POST /api/leave/request` and `PATCH /api/leave/approve/{id}`.

### Phase 2: Frontend Workflow
- [ ] Build `LeaveRequestModal` with date picker and attachment upload.
- [ ] Build `LeaveManagementTable` for Admin approval.
- [ ] Implement balance indicator in the UI.

### Phase 3: Integration
- [ ] Sync approved leave to `attendance` table automatically.
- [ ] Update `payroll_calc.py` to handle "Unpaid Leave" deductions if balance is exceeded.
