# Tasks: Professional Payroll Engine

**Input**: Design documents from `/specs/004-payroll-engine/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure for payroll module in `apps/server/api/payroll.py` and `apps/client/src/pages/Payroll/`
- [x] T002 Verify existence of `@react-pdf/renderer` in `apps/client/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Create `payroll_history` table in Supabase per `data-model.md`
- [x] T004 [P] Implement PPh 21 TER calculation utility in `apps/server/utils/payroll_calc.py`
- [x] T005 [P] Implement BPJS deduction utility in `apps/server/utils/payroll_calc.py`
- [x] T006 Setup API router for payroll in `apps/server/api/payroll.py` and register it in `apps/server/main.py`

**Checkpoint**: Foundation ready - payroll logic and storage are initialized.

---

## Phase 3: User Story 1 - Automatic Payroll Calculation (Priority: P1) 🎯 MVP

**Goal**: Calculate Net Salary (THP) for all active employees.

**Independent Test**: Trigger "Calculate" on the Payroll page and see the list of employees with correct Net Salary.

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `GET /api/payroll/calculate` simulation endpoint in `apps/server/api/payroll.py`
- [x] T008 [US1] Create `usePayroll` custom hook for fetching and calculating payroll in `apps/client/src/pages/Payroll/hooks/usePayroll.js`
- [x] T009 [US1] Refactor `Payroll.jsx` to display real employee data from the calculation endpoint in `apps/client/src/pages/Payroll/Payroll.jsx`
- [x] T010 [US1] Implement "Run Payroll" simulation modal in `apps/client/src/pages/Payroll/components/RunPayrollModal.jsx`

**Checkpoint**: User Story 1 functional - Admin can see what the payroll will look like.

---

## Phase 4: User Story 2 - Payroll Dashboard & History (Priority: P2)

**Goal**: Save payroll records and view history.

**Independent Test**: Finalize a payroll run and view it in the history dashboard.

### Implementation for User Story 2

- [x] T011 [P] [US2] Implement `POST /api/payroll/finalize` endpoint to save records to `payroll_history` in `apps/server/api/payroll.py`
- [x] T012 [P] [US2] Implement `GET /api/payroll/history` endpoint to fetch past records in `apps/server/api/payroll.py`
- [x] T013 [US2] Update `Payroll.jsx` to support period filtering and historical view in `apps/client/src/pages/Payroll/Payroll.jsx`
- [x] T014 [US2] Implement "Stats Cards" with dynamic data (Total Payroll, Tax, BPJS) in `apps/client/src/pages/Payroll/components/PayrollStats.jsx`

**Checkpoint**: User Story 2 functional - Payroll records are persisted and auditable.

---

## Phase 5: User Story 3 - Digital Payslip Generation (Priority: P3)

**Goal**: Generate PDF payslips for employees.

**Independent Test**: Click "Download" and receive a correctly formatted PDF payslip.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create Payslip PDF template component in `apps/client/src/pages/Payroll/components/PayslipTemplate.jsx` using `@react-pdf/renderer`
- [x] T016 [US3] Integrate PDF download button in the payroll table rows in `apps/client/src/pages/Payroll/Payroll.jsx`
- [x] T017 [P] [US3] Implement bulk payslip download/export in `apps/client/src/pages/Payroll/Payroll.jsx`

**Checkpoint**: User Story 3 functional - Employees can get their payslips.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T018 Apply "Red Embossed" Neumorphic styling to all new modals and buttons in `apps/client/src/pages/Payroll/`
- [ ] T019 Add loading states and empty state illustrations to the payroll dashboard
- [ ] T020 Finalize RBAC permissions for payroll endpoints in `apps/server/api/auth.py`

---

## Dependencies & Execution Order

- **Phase 1 & 2**: MUST be completed first.
- **US1 (Phase 3)**: Is the MVP.
- **US2 & US3**: Depend on US1 but can be worked on in parallel once the base calculation is done.

## Parallel Example: Foundational

```bash
# Calculate logic and API structure can be built in parallel
Task T004: Implement PPh 21 TER calculation utility
Task T006: Setup API router for payroll
```
