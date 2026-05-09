# Check-in API Contract

**Feature**: `015-attendance-workforce-optimization`  
**Date**: 2026-05-09

---

## POST `/attendance/check-in`

**Deskripsi**: Endpoint ESS untuk karyawan melakukan check-in dengan validasi geofencing.

### Request Body
```json
{
  "employee_id": "WKN-001",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

### Response — Success (200)
```json
{
  "status": "success",
  "data": {
    "check_in_status": "Present",
    "distance_meters": 45.2,
    "check_in_time": "2026-05-09T08:15:30+07:00",
    "late_minutes": 0,
    "message": "Check-in berhasil. Anda berada 45m dari lokasi."
  }
}
```

### Response — Out of Range (200)
```json
{
  "status": "out_of_range",
  "data": {
    "distance_meters": 450.5,
    "allowed_radius": 100,
    "message": "Check-in ditolak. Anda berada 450m dari lokasi (batas 100m)."
  }
}
```

### Response — Already Checked In (200)
```json
{
  "status": "already_checked_in",
  "data": {
    "check_in_time": "2026-05-09T07:50:00+07:00",
    "message": "Anda sudah melakukan check-in hari ini."
  }
}
```

### Response — Error (422/500)
```json
{
  "status": "error",
  "detail": "Employee not found"
}
```

---

## GET `/attendance/settings`

**Deskripsi**: Ambil konfigurasi lokasi aktif (HQ atau semua site).

### Response (200)
```json
{
  "status": "success",
  "data": {
    "hq_location": {
      "lat": -6.2088,
      "lon": 106.8456,
      "radius": 100,
      "name": "WKN HQ Jakarta"
    }
  }
}
```

---

## PUT `/attendance/settings`

**Deskripsi**: Update konfigurasi lokasi (Admin only).

### Request Body
```json
{
  "key": "hq_location",
  "value": {
    "lat": -6.2100,
    "lon": 106.8470,
    "radius": 150,
    "name": "WKN HQ Jakarta (Updated)"
  }
}
```

### Response (200)
```json
{
  "status": "success",
  "message": "Konfigurasi lokasi berhasil diperbarui."
}
```
