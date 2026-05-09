# Tasks: Asset Tracking System

**Input**: Design documents from `/specs/008-asset-tracking/`
**Prerequisites**: plan.md, spec.md, data-model.md

## Phase 1: Setup & Infrastructure

- [x] T001 Create project structure for asset module in `apps/server/api/assets.py` and `apps/client/src/pages/Assets/`
- [x] T002 Create `assets` and `asset_assignments` tables in Supabase per `data-model.md`
- [x] T003 Register `asset_router` in `apps/server/main.py`

---

## Phase 2: Backend Asset Logic

- [x] T004 [P] Implement `GET /api/assets` with filtering by status and category
- [x] T005 [P] Implement `POST /api/assets` for adding new assets to inventory
- [x] T006 [P] Implement `PATCH /api/assets/{id}` for updating asset details or status
- [x] T007 Create `useAssets` custom hook for frontend in `apps/client/src/pages/Assets/hooks/useAssets.js`

**Checkpoint**: Backend ready - basic asset management is functional.

---

## Phase 3: User Story 1 - Asset Inventory Management (Priority: P1)

**Goal**: Build the main inventory dashboard.

- [x] T008 [US1] Build `AssetInventory.jsx` with Neumorphic grid layout
- [x] T009 [US1] Create `AssetCard.jsx` displaying key info (Tag, Name, Status)
- [x] T010 [US1] Build `AssetFormModal.jsx` for creating/editing assets

**Checkpoint**: US1 functional - Admin can manage the asset list.

---

## Phase 4: User Story 2 - Asset Assignment (Priority: P1)

**Goal**: Implement the check-out workflow.

- [x] T011 [P] [US2] Implement `POST /api/assets/assign` to create assignment and update asset status
- [x] T012 [US2] Build `AssignAssetModal.jsx` with employee lookup integration
- [x] T013 [US2] Implement status-based action buttons (Assign, Return) on asset cards

**Checkpoint**: US2 functional - Assets can be assigned to employees.

---

## Phase 5: User Story 3 - Return & History (Priority: P2)

**Goal**: Handle check-in and tracking.

- [x] T014 [P] [US3] Implement `POST /api/assets/return` to finalize assignment and reset asset status
- [x] T015 [US3] Build `AssetHistoryView.jsx` to display assignment logs for a specific asset
- [x] T016 [US3] Integrate asset assignment list into the Employee Profile view

---

## Phase 6: Polish & UI Excellence

- [ ] T017 Apply "Red Embossed" Neumorphic styling to all asset management components
- [ ] T018 Implement "Asset Condition" color coding in the grid view
- [ ] T019 Add asset summary stats (Total Value, Total Assigned) to the top of the hub
- [ ] T020 Implement export to CSV for asset inventory
