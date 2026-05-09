# Implementation Plan: Employee Self-Service (ESS) Mobile View

**Branch**: `013-ess-mobile-view` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/013-ess-mobile-view/spec.md)

## Summary
Overhauling the WKNsite experience for mobile devices by introducing a dedicated ESS (Employee Self-Service) portal with a mobile-native feel.

## Technical Context
- **Layout Switcher**: Implement a custom hook `useIsMobile` to conditionally render `MobileLayout` in `App.jsx`.
- **Bottom Nav**: Fixed position bottom bar with Neumorphic haptic feedback.
- **Micro-Frontends**: Reuse existing logic from `Payroll`, `Attendance`, and `Leave` but with mobile-optimized view components.

## Source Code Changes
```text
apps/client/src/
├── components/Layout/
│   └── MobileLayout.jsx     # Bottom-nav shell
├── pages/ESS/
│   ├── MobileHome.jsx       # Quick actions & status
│   ├── MobileAttendance.jsx # Simplified time clock
│   └── MobilePayslip.jsx    # Compact salary view
└── hooks/useIsMobile.js     # Viewport detection
```

## Implementation Workflow

### Phase 1: Responsive Foundation
- [ ] Create `useIsMobile.js` hook.
- [ ] Implement `MobileLayout.jsx` with bottom navigation.

### Phase 2: Core ESS Modules
- [ ] Build `MobileHome.jsx` (Dashboard).
- [ ] Build `MobileAttendance.jsx` (Quick Clock-in).

### Phase 3: Financials & Leave
- [ ] Build `MobilePayslip.jsx`.
- [ ] Implement mobile-friendly Leave request form.
