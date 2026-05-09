# Feature Specification: Asset Tracking System

**Feature Branch**: `008-asset-tracking`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Membangun sistem Asset Tracking untuk melacak inventaris perusahaan (Laptop, Kendaraan, Alat Kantor) yang dipinjamkan ke karyawan. Harus ada sistem peminjaman, pengembalian, dan pelacakan status aset."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Asset Inventory Management (Priority: P1)

As an Admin, I want to maintain a list of company assets with details like serial number and condition, so that I can track our capital resources.

**Why this priority**: Core database functionality.

**Independent Test**: Admin can add a "MacBook Pro" with Serial "SN123" and see it in the "Available" inventory list.

---

### User Story 2 - Asset Assignment (Check-out) (Priority: P1)

As an HR Manager, I want to assign an available asset to a specific employee, so that I know exactly who is responsible for which equipment.

**Why this priority**: Primary workflow for asset tracking.

**Independent Test**: Admin selects an asset, chooses an employee (e.g., WKN-001), and clicks "Assign". The asset status changes to "Assigned" and shows the employee name.

---

### User Story 3 - Asset Return & Condition Tracking (Priority: P2)

As an Admin, I want to record when an asset is returned and update its condition, so that I can manage maintenance and replacements.

**Why this priority**: Lifecycle management.

**Independent Test**: Admin clicks "Check-in" on an assigned asset. The status reverts to "Available" and the history logs the return date and condition.

## Functional Requirements

1. **Asset Categorization**: Support for IT Equipment, Vehicles, Furniture, and Tools.
2. **Status Workflow**: Available -> Assigned -> Maintenance -> Retired.
3. **QR/Barcode Ready**: Include fields for QR codes or Barcodes for future scanning integration.
4. **Assignment History**: Keep a log of all past assignments for each asset.

## Technical Feasibility

- **Database**: New tables `assets` and `asset_assignments`.
- **UI**: Bento Grid for asset stats and a list view for inventory.
- **Frontend**: Neumorphic cards for individual assets with status indicators.
