# Tasks: Asset QR Integration

**Input**: Design documents from `/specs/011-asset-qr-integration/`
**Prerequisites**: spec.md, plan.md

## Phase 1: Infrastructure & Dependencies

- [x] T001 Install `qrcode.react` and `html5-qrcode` in `apps/client`
- [x] T002 Create `QRGenerator.jsx` component for rendering asset codes

---

## Phase 2: QR Generation UI (Priority: P1)

- [x] T003 Add `IconQrcode` button to `AssetCard` for quick access
- [x] T004 Build `AssetQRModal.jsx` to display and download QR labels
- [x] T005 Implement printable CSS for asset labels

---

## Phase 3: QR Scanner Implementation (Priority: P1)

- [x] T006 Build `QRScannerModal.jsx` using `html5-qrcode`
- [x] T007 Implement permission handling for camera access
- [x] T008 Add global "Scan Asset" button to `AssetInventory` header
- [x] T009 Implement auto-search/filter logic after a successful scan

---

## Phase 4: Polish & Testing

- [x] T010 Add "Scan Sound" and haptic feedback (if mobile)
- [x] T011 Test QR readability with various camera resolutions
- [x] T012 Ensure QR codes include a direct deep-link URL (optional)
