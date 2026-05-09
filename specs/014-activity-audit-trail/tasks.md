# Tasks: Activity Audit Trail

**Input**: Design documents from `/specs/014-activity-audit-trail/`
**Prerequisites**: spec.md, plan.md

## Phase 1: Logging Infrastructure (P1)

- [ ] T001 Create `audit_logs` table in Supabase via SQL
- [ ] T002 Implement `apps/server/utils/audit_logger.py` with `log_action` function
- [ ] T003 Integrate `log_action` into `Employees` and `Assets` mutation routes

---

## Phase 2: Audit Dashboard UI (P1)

- [ ] T004 Create `apps/client/src/pages/Admin/AuditTrail.jsx`
- [ ] T005 Build a high-density Neumorphic table for log display
- [ ] T006 Implement color-coding for Action Types (CREATE, UPDATE, DELETE)

---

## Phase 3: Filtering & Deep Dive (P2)

- [ ] T007 Add filters for Module (Workforce, Payroll, Assets, etc.)
- [ ] T008 Build `ActivityDetailModal.jsx` to show before/after JSON data
- [ ] T009 Implement "Export Logs" to CSV functionality

---

## Phase 4: Polish & Integration

- [ ] T010 Register `/admin/audit` route in `App.jsx`
- [ ] T011 Add "Security Logs" item to `DashboardLayout` sidebar
- [ ] T012 Test concurrent logging and pagination performance
