# Data Model: Asset Tracking System

**Feature**: Asset Tracking System | **Date**: 2026-05-06

## New Tables

### `assets`
Stores individual asset records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `asset_tag` | text (Unique) | Internal tag or QR code ID |
| `name` | text | Asset name (e.g. MacBook Pro 14") |
| `category` | text | IT, Vehicle, Furniture, Tools |
| `serial_number` | text | Manufacturer serial number |
| `purchase_date` | date | Date of acquisition |
| `purchase_value` | numeric | Cost of the asset |
| `condition` | text | New, Good, Fair, Poor |
| `status` | text | Available, Assigned, Maintenance, Retired |
| `current_holder_id` | text (FK) | Reference to `employees.employee_id` |

### `asset_assignments`
Stores history of assignments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `asset_id` | uuid (FK) | Reference to `assets.id` |
| `employee_id` | text (FK) | Reference to `employees.employee_id` |
| `assigned_date` | timestamptz | Date of check-out |
| `return_date` | timestamptz | Date of check-in |
| `initial_condition` | text | Condition at checkout |
| `return_condition` | text | Condition at return |
| `notes` | text | Handover notes |

## Relationships
- `assets.current_holder_id` -> `employees.employee_id`
- `asset_assignments.asset_id` -> `assets.id`
- `asset_assignments.employee_id` -> `employees.employee_id`
