# Tasks: Import Karyawan via Excel

**Input**: Design documents from `/specs/002-import-employee-excel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create feature directory structure `specs/002-import-employee-excel/checklists` (Done)
- [ ] T002 Ensure `lib/xlsx.full.min.js` is correctly linked in `index.html` (Done)

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Implement `bulkImport` action in Google Apps Script (Backend) to handle array of employee data.
- [ ] T004 Add navigation item "Impor Karyawan" in `js/main.js` and `index.html`.
- [ ] T005 Define `ImportEmployeeModal` template in `js/main.js`.

## Phase 3: User Story 1 - Mengunduh Template Excel (Priority: P1) 🎯 MVP

**Goal**: Admin can download a pre-formatted Excel template.

- [ ] T006 [P] [US1] Create a function to generate and download Excel template in `js/main.js`.
- [ ] T007 [US1] Add "Unduh Template" button to the Import Modal UI.

## Phase 4: User Story 2 - Mengunggah Data Karyawan Massal (Priority: P1)

**Goal**: Admin can upload and preview Excel data.

- [ ] T008 [US1] Implement file upload logic using `XLSX` library in `js/main.js`.
- [ ] T009 [US1] Create `renderImportPreview` function to show data in a table within the modal.
- [ ] T010 [US1] Add "Proses Impor" button and logic to send data to backend.

## Phase 5: User Story 3 - Validasi Data & Penanganan Duplikasi (Priority: P1)

**Goal**: System validates data and prevents duplicate NIK.

- [ ] T011 [US3] Implement client-side validation (NIK unique in preview, valid email, required fields).
- [ ] T012 [US3] Add server-side NIK check before final saving in Google Apps Script.
- [ ] T013 [US3] Display error status for each row in the preview table.

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T014 Add success/error toast notifications for the import process.
- [ ] T015 Ensure mobile responsiveness for the import preview table.
- [ ] T016 Add log entry in system audit for successful imports.
