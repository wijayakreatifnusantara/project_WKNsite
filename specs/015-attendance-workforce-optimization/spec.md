# Feature Specification: Attendance & Workforce Optimization

**Feature Name**: `attendance-workforce-optimization`
**Created**: 2026-05-09
**Status**: Draft
**Target Version**: Spec Kit 0.8.7

## Context & Problem
Sistem absensi saat ini masih bergantung pada input manual atau bulk upload dari Admin. Hal ini berisiko terhadap akurasi data dan beban kerja administratif. Tim lapangan juga membutuhkan fleksibilitas untuk melakukan absen di lokasi tugas tanpa melanggar batasan geofencing kantor pusat.

## User Scenarios & Testing

### User Story 1 - HQ Check-in with Geofencing (Priority: P1)
As an Office Employee, I want to check-in from my phone when I arrive at the office, so that my attendance is recorded accurately without manual admin intervention.
- **Test**: System detects user coordinates. If within 100m of HQ, check-in is successful. If outside, check-in is rejected.

### User Story 2 - Field Team Check-in (Priority: P1)
As a Field Team Member, I want to check-in at my assigned project site, so that my work hours are tracked even when I'm not at HQ.
- **Test**: User with "Field" status can check-in if within 100m of their *Assigned Site* coordinates.

### User Story 3 - Location Management (Priority: P2)
As an Admin, I want to be able to change the HQ coordinates or assign specific site coordinates to field teams, so that the geofencing remains flexible.
- **Test**: Admin updates coordinates in the settings dashboard. New coordinates are immediately used for validation.

## Functional Requirements

1. **ESS Geofencing Engine**:
   - Implementation of Haversine formula to calculate distance between user and target coordinates.
   - Default radius: 100 meters.
2. **Master Data Enhancement**:
   - Add `assigned_site_lat` and `assigned_site_long` to the `employees` table.
   - Add a global `settings` table in Supabase for HQ coordinates.
3. **Leave-Attendance Sync**:
   - Trigger/Hook to auto-populate `attendance` status as "Leave" when a leave request is approved.
4. **Late Notification Logic**:
   - Background check to flag employees with >3 late arrivals in a 30-day window.

## Success Criteria
1. Accuracy of distance calculation within 5 meters.
2. Check-in process takes < 3 seconds to validate and save.
3. Admin can change HQ coordinates via UI without code updates.
