# Feature Specification: Document Center

**Feature Branch**: `007-document-center`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Membangun Document Center untuk mengelola file perusahaan, kontrak karyawan, dan dokumen kebijakan. Harus ada kategori, sistem upload/download, dan integrasi dengan database karyawan."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized Document Repository (Priority: P1)

As an Admin, I want to upload and categorize company documents (Policies, SOPs), so that they are easily accessible to the team.

**Why this priority**: Core storage functionality.

**Independent Test**: Admin can upload a PDF, assign it to "Policies" category, and see it in the document list.

---

### User Story 2 - Employee Personal Folders (Priority: P1)

As an HR Manager, I want to view documents specific to an employee (Contracts, KTP, CV), so that I can manage their personnel file efficiently.

**Why this priority**: Essential for HR record keeping.

**Independent Test**: Filtering by Employee Name/ID shows only documents linked to that specific person.

---

### User Story 3 - Secure Download & Management (Priority: P2)

As a User, I want to download documents I have access to and search for them by name, so that I don't waste time searching manually.

**Why this priority**: Usability and utility.

**Independent Test**: Searching "Contract" in the search bar filters the list to only show files containing that word.

## Functional Requirements

1. **Storage**: Use Supabase Storage (Bucket: `documents`).
2. **Categories**: Support for Contracts, Policies, Employee Docs, Finance, and Misc.
3. **Metadata**: Track upload date, file size, type, and uploader.
4. **Permissions**: Admin can manage all; Staff can only view "Public/Policy" docs.

## Technical Feasibility

- **Storage**: Supabase Buckets.
- **Database**: New table `document_metadata` to store file links and relations.
- **Frontend**: Neumorphic file grid/list view with preview capability.
