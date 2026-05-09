# Feature Specification: Asset QR Integration

**Feature Branch**: `011-asset-qr-integration`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User recommendation: "Asset QR Integration (Assets) - Generate QR codes for assets and implement scanning for quick check-in/out."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - QR Code Generation (Priority: P1)

As an Admin, I want each asset to have a unique QR code generated automatically, so that I can print labels for physical tracking.

**Why this priority**: Essential for the hardware-link.

**Independent Test**: Asset card shows a "View QR" button which displays a high-resolution QR code containing the asset's unique ID.

---

### User Story 2 - Mobile QR Scanning (Priority: P1)

As a Field Officer/Admin, I want to scan a physical QR code using my device camera to instantly open the asset's detail page, so that I can perform quick check-ins or audits.

**Why this priority**: Core operational efficiency.

**Independent Test**: Clicking "Scan QR" on the dashboard opens the camera; scanning a valid asset QR redirects to that asset's info page.

## Functional Requirements

1. **QR Encoding**: Encode `asset_tag` or `id` into the QR code.
2. **Scanner Library**: Use `html5-qrcode` or `react-qr-reader` for browser-based scanning.
3. **Printable Labels**: Provide a "Print Label" view with the QR code and basic info (Name, Tag).

## Technical Feasibility

- **Frontend**: `qrcode.react` for generation, `html5-qrcode` for scanning.
- **Integration**: Add scanning button to `AssetInventory.jsx`.
- **Validation**: Ensure scanned data matches a record in the `assets` table.
