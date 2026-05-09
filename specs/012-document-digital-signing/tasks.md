# Tasks: Digital Document Signing

**Input**: Design documents from `/specs/012-document-digital-signing/`
**Prerequisites**: spec.md, plan.md

## Phase 1: Signature Canvas Component

- [x] T001 Install `react-signature-canvas` in `apps/client`
- [x] T002 Build `SignaturePad.jsx` with clear/undo/save functionality
- [x] T003 Implement Neumorphic container for the drawing pad

---

## Phase 2: Document Hub Integration (Priority: P1)

- [x] T004 Add "Sign Document" button to document list actions in `DocumentHub.jsx`
- [x] T005 Build `DocumentSignerModal.jsx` for document preview
- [x] T006 Implement drag-and-drop signature placement on the document preview

---

## Phase 3: flattening & Saving Logic (Priority: P1)

- [x] T007 Implement HTML5 Canvas "bake" logic to merge signature with document image
- [x] T008 Handle file upload for the newly signed version (rename with `_signed` suffix)
- [x] T009 Update document metadata in Supabase to track signature status

---

## Phase 4: Audit & UX

- [x] T010 Add "Signed by [User]" tooltip to signed documents
- [x] T011 Implement "Signature Profile" (save user's signature for reuse)
- [x] T012 Add success animation upon document finalization
