# Tasks: Employee Self-Service (ESS) Mobile View

**Input**: Design documents from `/specs/013-ess-mobile-view/`
**Prerequisites**: spec.md, plan.md

## Phase 1: Infrastructure & Layout (P1)

- [ ] T001 Create `apps/client/src/hooks/useIsMobile.js` for viewport detection
- [ ] T002 Build `MobileLayout.jsx` with Neumorphic bottom navigation bar
- [ ] T003 Update `App.jsx` to switch layout based on device type

---

## Phase 2: Mobile Dashboard (P1)

- [ ] T004 Build `MobileHome.jsx` featuring "Good Morning" greeting and Quick Actions
- [ ] T005 Implement "Time Clock" card with real-time status (In/Out)
- [ ] T006 Add "Upcoming Holidays" or "Leave Balance" mini-widgets

---

## Phase 3: Mobile Attendance & Payroll (P2)

- [ ] T007 Build `MobileAttendance.jsx` with historical logs
- [ ] T008 Build `MobilePayslip.jsx` featuring compact salary cards and "Download PDF" action
- [ ] T009 Implement "Mobile Leave Form" with date picker optimization

---

## Phase 4: Polish & Performance

- [ ] T010 Implement pull-to-refresh on mobile views
- [ ] T011 Add haptic vibration feedback on button presses (if supported)
- [ ] T012 Optimize image loading for mobile data saving
