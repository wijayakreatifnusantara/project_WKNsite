# Feature Specification: Activity Audit Trail

**Feature Branch**: `014-activity-audit-trail`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User recommendation: "Activity Audit Trail - Security logging for administrative actions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Audit Log (Priority: P1)

As a Super Admin, I want to view a chronological list of all system activities (logins, data updates, deletions), so that I can maintain accountability and security.

**Why this priority**: Compliance and security fundamental.

**Independent Test**: Dashboard shows an "Audit Trail" page listing actions with User Name, Action Type (e.g., UPDATE), Target Module (e.g., EMPLOYEES), and Timestamp.

---

### User Story 2 - Deep Dive Investigation (Priority: P2)

As a Security Officer, I want to see the specific data that was changed during an "UPDATE" action, so that I can verify the legitimacy of the change.

**Why this priority**: Forensic analysis capability.

**Independent Test**: Clicking an audit record opens a side-panel showing the "Previous State" vs "New State" in a JSON or high-density diff format.

## Functional Requirements

1. **Backend Middleware/Trigger**: Capture database changes in Supabase or via FastAPI middleware.
2. **Audit Table**: `audit_logs` table with `user_id`, `action`, `module`, `entity_id`, `old_data`, `new_data`.
3. **Filtering**: Search by user, filter by module (Payroll, Assets, Performance).

## Technical Feasibility

- **Database**: Dedicated `audit_logs` table.
- **Frontend**: High-density table with Neumorphic color-coding for action types (Create=Green, Update=Amber, Delete=Red).
- **Automation**: Use Supabase Functions or Python Decorators to log sensitive operations.
