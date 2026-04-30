# Tasks: Browser Push Notifications

**Feature**: Browser Push Notifications
**Status**: Ready
**Goal**: Implement client-side notifications to alert users about dashboard events even when the tab is inactive.

## Phase 1: Setup

- [ ] T001 Create `js/notifications.js` with basic module structure
- [ ] T002 [P] Register `js/notifications.js` as a script in `index.html`

## Phase 2: Foundational

- [ ] T003 Implement permission state detection (granted/denied/default) in `js/notifications.js`
- [ ] T004 Implement `localStorage` persistence for notification settings (`wkn_notifications_enabled`) in `js/notifications.js`

## Phase 3: User Story 1 - Requesting Permission (P1)

**Story Goal**: Users can enable notifications via a button and see the browser permission prompt.
**Independent Test**: Click "Aktifkan Notifikasi" and verify the browser prompt appears.

- [ ] T005 [P] [US1] Add "Aktifkan Notifikasi" button/toggle to the dashboard UI in `index.html`
- [ ] T006 [P] [US1] Add styling for notification control elements in `style.css`
- [ ] T007 [US1] Implement `requestPermission()` method in `js/notifications.js` and link it to the UI button
- [ ] T008 [US1] Update UI state/labels based on current browser permission status in `js/notifications.js`

## Phase 4: User Story 2 - Receiving Alerts in Background (P1)

**Story Goal**: Notifications appear on the desktop even when the tab is not focused.
**Independent Test**: Use "Tes Notifikasi" while tab is backgrounded and verify desktop popup.

- [ ] T010 [P] [US2] Add "Tes Notifikasi" button to settings UI in `index.html`
- [ ] T011 [US2] Implement core `show(title, body, tag)` method in `js/notifications.js` with duplicate prevention using tags
- [ ] T012 [US2] Link "Tes Notifikasi" button to test function in `js/notifications.js`
- [ ] T013 [US2] Integrate `NotificationManager.show()` into the existing alert processing logic in `js/main.js`

## Phase 5: User Story 3 - Notification Interaction (P2)

**Story Goal**: Clicking a notification brings the app tab to focus.
**Independent Test**: Click a test notification and verify the browser window/tab is focused.

- [ ] T014 [US3] Implement `onclick` event handler in `js/notifications.js` to call `window.focus()`
- [ ] T015 [US3] Ensure the notification is closed automatically after being clicked in `js/notifications.js`

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T016 Add application icon/logo to all notifications in `js/notifications.js`
- [ ] T017 Final cross-browser verification (Chrome, Edge)
- [ ] T018 Ensure graceful fallback if `Notification` API is not supported by the browser

## Implementation Strategy

1. **Phase 1-3 (MVP)**: Focus on the permission request flow and basic notification delivery.
2. **Phase 4**: Integrate with real dashboard events (contracts).
3. **Phase 5**: Improve UX with tab focusing.

## Dependencies

US1 (Permission) -> US2 (Alerts) -> US3 (Focus)
