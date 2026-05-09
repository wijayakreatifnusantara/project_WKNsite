# Data Model: Performance (KPI) System

**Feature**: Performance (KPI) System | **Date**: 2026-05-06

## New Tables

### `kpi_metrics`
Defines the categories and weights for evaluation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `name` | text | Metric name (e.g. Attendance, Technical Skill) |
| `description` | text | Explanation of the metric |
| `weight` | numeric | Contribution percentage (0.0 - 1.0) |
| `is_active` | boolean | Toggle for active metrics |

### `performance_reviews`
Stores individual appraisal records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `employee_id` | text (FK) | Reference to `employees.employee_id` |
| `reviewer_id` | text | User ID of the manager/reviewer |
| `period` | text | Review period (e.g. 2026-Q1, 2026-M05) |
| `scores` | jsonb | Map of {kpi_id: score} |
| `total_score` | numeric | Final weighted score (out of 5.0) |
| `feedback` | text | Manager's qualitative comments |
| `status` | text | Draft, Submitted, Finalized |
| `created_at` | timestamptz | Date of review |

## Relationships
- `performance_reviews.employee_id` -> `employees.employee_id`
- `performance_reviews.reviewer_id` -> `auth.users.id`
