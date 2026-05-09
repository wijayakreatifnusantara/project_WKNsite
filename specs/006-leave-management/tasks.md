# Tasks: Leave Management System

**Input**: Design documents from `/specs/006-leave-management/`
**Prerequisites**: plan.md, spec.md, data-model.md

## Phase 1: Setup & Data Infrastructure

- [x] T001 Create project structure for leave module in `apps/server/api/leave.py` and `apps/client/src/pages/Leave/`
- [x] T002 Create `leave_requests` table in Supabase per `data-model.md`
- [x] T003 Add `annual_leave_balance` column to `employees` table in Supabase
- [x] T004 Register `leave_router` in `apps/server/main.py`

---

## Phase 2: Foundational Logic

- [x] T005 [P] Implement leave duration calculation (excluding weekends) in `apps/server/utils/leave_logic.py`
- [x] T006 [P] Create `useLeave` custom hook for frontend in `apps/client/src/pages/Leave/hooks/useLeave.js`
- [x] T007 Implement `GET /api/leave/balances` to fetch quota for employees

**Checkpoint**: Foundation ready - storage and basic logic are initialized.

---

## Phase 3: User Story 1 - Leave Request & Approval Workflow (Priority: P1)

**Goal**: Enable submission and management of leave.

- [x] T008 [P] [US1] Implement `POST /api/leave/request` to submit new leave applications
- [x] T009 [P] [US1] Implement `PATCH /api/leave/approve/{id}` to update request status
- [x] T010 [US1] Build `LeaveRequestModal.jsx` with date range picker and reason input
- [x] T011 [US1] Build `LeaveManagementHub.jsx` with a table of pending/approved requests

**Checkpoint**: US1 functional - Admin can approve/reject leave requests.

---

## Phase 4: User Story 2 - Leave Balance Tracking (Priority: P1)

**Goal**: Track and display remaining leave quota.

- [x] T012 [US2] Update `PATCH /api/leave/approve/{id}` to deduct balance from `employees` table upon approval
- [x] T013 [US2] Implement balance indicator card in `LeaveManagementHub.jsx`
- [x] T014 [US2] Add validation to prevent applying for leave exceeding balance (unless unpaid)

**Checkpoint**: US2 functional - Balances are accurately tracked and enforced.

---

## Phase 5: User Story 3 - Integration with Attendance & Payroll (Priority: P2)

**Goal**: Automate downstream effects of leave.

- [x] T015 [US3] Implement auto-insert into `attendance` table with status "Leave" when a request is approved for "Today"
- [x] T016 [US3] Update `apps/server/utils/payroll_calc.py` to identify "Unpaid Leave" and apply pro-rata deductions
- [x] T017 [US3] Create a simple "Leave Calendar" view in `apps/client/src/pages/Leave/components/LeaveCalendar.jsx`

**Checkpoint**: US3 functional - Leave is integrated into HR lifecycle.

---

## Phase 6: Polish & UI Excellence

- [ ] T018 Apply Neumorphic "Red Embossed" styling to all leave forms and tables
- [ ] T019 Implement file upload for medical certificates in `LeaveRequestModal.jsx`
- [ ] T020 Add "Leave Approval" notifications to the Overview dashboard alerts
