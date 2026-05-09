# Data Model: Document Center

**Feature**: Document Center | **Date**: 2026-05-06

## New Tables

### `documents`
Stores metadata and links to files stored in Supabase Storage.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `name` | text | Original filename |
| `description` | text | Brief summary of document |
| `category` | text | "Contract", "Policy", "Employee", "Finance", "Misc" |
| `file_url` | text | Public URL or Path in Storage |
| `file_size` | integer | Size in bytes |
| `file_type` | text | MIME type (e.g. application/pdf) |
| `employee_id` | text (FK) | Optional: Link to a specific employee |
| `uploaded_by` | text | User ID of the uploader |
| `is_private` | boolean | True if restricted to Admin |
| `created_at` | timestamptz | Date of upload |

## Relationships
- `documents.employee_id` -> `employees.employee_id` (Optional)
- `documents.uploaded_by` -> `auth.users.id`

## Storage Structure (Supabase)
**Bucket Name**: `documents`
- Folder: `contracts/`
- Folder: `policies/`
- Folder: `employee_docs/`
- Folder: `finance/`
