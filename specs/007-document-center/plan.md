# Implementation Plan: Document Center

**Branch**: `007-document-center` | **Date**: 2026-05-06 | **Spec**: [spec.md](file:///e:/project_WKNsite/specs/007-document-center/spec.md)

## Summary
Building a professional document management system with Supabase Storage integration, featuring categorization and employee linking.

## Technical Context
- **Storage**: Supabase Storage (Bucket: `documents`).
- **Database**: `documents` table for metadata.
- **UI**: Neumorphic File Explorer interface.

## Project Structure

### Documentation
```text
specs/007-document-center/
├── spec.md
├── data-model.md
├── plan.md
└── tasks.md
```

### Source Code Changes
```text
apps/server/
├── api/documents.py      # New API endpoints for file management
└── utils/storage_helper.py # Supabase storage interactions

apps/client/src/
├── pages/Documents/
│   ├── DocumentHub.jsx    # Main file explorer
│   ├── components/        # File cards, upload forms
│   └── hooks/             # Storage hooks
```

## Implementation Workflow

### Phase 1: Storage & Database Setup
- [ ] Initialize Supabase Bucket `documents`.
- [ ] Create `documents` metadata table.
- [ ] Implement basic CRUD API in FastAPI.

### Phase 2: File Explorer UI
- [ ] Build the `DocumentHub.jsx` layout (Sidebar for categories, Main grid for files).
- [ ] Implement `FileUploadModal` with drag-and-drop support.
- [ ] Create `FileCard` component with Neumorphic design.

### Phase 3: Linking & Search
- [ ] Integrate employee search to link documents to specific staff.
- [ ] Implement global search and filtering by category.
- [ ] Add role-based access control for private documents.
