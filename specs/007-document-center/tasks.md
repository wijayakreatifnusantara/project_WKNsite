# Tasks: Document Center

**Input**: Design documents from `/specs/007-document-center/`
**Prerequisites**: plan.md, spec.md, data-model.md

## Phase 1: Setup & Infrastructure

- [x] T001 Create project structure for document module in `apps/server/api/documents.py` and `apps/client/src/pages/Documents/`
- [x] T002 Create `documents` table in Supabase per `data-model.md`
- [x] T003 Initialize Supabase Storage Bucket named `documents` (Public/Private as needed)
- [x] T004 Register `document_router` in `apps/server/main.py`

---

## Phase 2: Backend File Management

- [x] T005 [P] Implement `POST /api/documents/upload` to handle file upload and metadata storage
- [x] T006 [P] Implement `GET /api/documents` with filtering by category and employee
- [x] T007 [P] Implement `DELETE /api/documents/{id}` to remove file and metadata
- [x] T008 Create `useDocuments` custom hook for frontend in `apps/client/src/pages/Documents/hooks/useDocuments.js`

**Checkpoint**: Backend ready - file operations are functional.

---

## Phase 3: User Story 1 - Centralized Document Repository (Priority: P1)

**Goal**: Build the main explorer and upload interface.

- [x] T009 [US1] Build `DocumentHub.jsx` main layout with category sidebar
- [x] T010 [US1] Create `FileCard.jsx` with Neumorphic styling and file type icons
- [x] T011 [US1] Implement `UploadModal.jsx` with category selection and progress bar

**Checkpoint**: US1 functional - Admin can manage company files.

---

## Phase 4: User Story 2 - Employee Personal Folders (Priority: P1)

**Goal**: View documents linked to specific staff members.

- [x] T012 [US2] Update `DocumentHub.jsx` to include an "Employee" filter/dropdown
- [x] T013 [US2] Build "Employee Personal Folder" view in `apps/client/src/pages/Documents/components/EmployeeFolder.jsx`
- [x] T014 [US2] Link Document Center to the main Workforce Registry (Add "View Documents" button to employee rows)

**Checkpoint**: US2 functional - HR can access staff records easily.

---

## Phase 5: User Story 3 - Search & Security (Priority: P2)

**Goal**: Enhanced management and privacy.

- [x] T015 [US3] Implement global text search in `DocumentHub.jsx`
- [x] T016 [US3] Add "Private" toggle to upload form and enforce Role-Based Access Control (RBAC)
- [x] T017 [US3] Implement file preview (PDF/Images) in a Neumorphic lightbox

---

## Phase 6: Polish & UI Excellence

- [ ] T018 Apply "Red Embossed" Neumorphic styling to all document grid views
- [ ] T019 Add "Storage Usage" indicator to the dashboard
- [ ] T020 Implement bulk actions (Delete/Move) for files
