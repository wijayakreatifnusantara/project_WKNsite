# Feature Specification: Leave Management System

**Feature Branch**: `006-leave-management`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Membangun sistem pengelolaan cuti (Leave Management) yang mencakup pengajuan cuti oleh karyawan, persetujuan oleh admin, dan pelacakan saldo cuti tahunan. Sistem ini harus terintegrasi dengan dashboard kehadiran dan payroll."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leave Request & Approval Workflow (Priority: P1)

As an Admin, I want to manage leave requests (Approve/Reject) submitted by employees, so that I can maintain proper staffing levels.

**Why this priority**: Core workflow for the leave module.

**Independent Test**: Admin can see a list of "Pending" leave requests and click "Approve" or "Reject". The status updates instantly.

---

### User Story 2 - Leave Balance Tracking (Priority: P1)

As an Employee/Admin, I want to see the remaining balance of annual leave for each employee, so that leave is taken within the allowed quota.

**Why this priority**: Prevents over-utilization of leave.

**Independent Test**: Admin can view an employee's profile or a summary table and see "Annual Leave Balance" (e.g., 12 days).

---

### User Story 3 - Integration with Attendance & Calendar (Priority: P2)

As an HR Manager, I want approved leave to automatically mark the employee as "Leave" in the attendance hub and show up on a shared calendar.

**Why this priority**: Centralizes visibility.

**Independent Test**: An approved leave for "Today" shows the employee's status as "Leave" in the Attendance Hub without manual check-in.

## Functional Requirements

1. **Leave Types**: Support for Annual, Sick (with attachment), and Emergency Leave.
2. **Quota Management**: Automated or manual reset of annual leave quota (default 12 days/year).
3. **Attachments**: Ability to upload medical certificates for sick leave.
4. **Notifications**: Alert Admin when a new request is submitted.

## Technical Feasibility

- **Database**: New table `leave_requests`.
- **UI**: Neumorphic Modal for request submission and a Tabbed view for Manage/History.
- **Backend**: Python logic to calculate working days (excluding weekends) for leave duration.
