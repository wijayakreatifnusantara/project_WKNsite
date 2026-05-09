# Research: Attendance & Workforce Optimization

**Phase**: 0 — Outline & Research  
**Feature**: `015-attendance-workforce-optimization`  
**Date**: 2026-05-09

---

## 1. Haversine Formula untuk Geofencing

**Decision**: Implementasi Haversine formula dalam Python murni (tanpa library eksternal)

**Rationale**:
- Haversine adalah formula standar industri untuk menghitung jarak great-circle antara dua titik koordinat (lat/lon) di permukaan bumi
- Akurasi ≤ 5 meter memenuhi syarat untuk radius 100m (error Haversine < 0.3% untuk jarak pendek)
- Tidak memerlukan dependency eksternal — hanya `math` standard library Python

**Formula**:
```python
import math

def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Returns distance in meters between two GPS coordinates"""
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

**Alternatives Considered**: GeoPy library — ditolak karena menambah dependency berat yang tidak perlu.

---

## 2. Browser Geolocation API

**Decision**: Gunakan `navigator.geolocation.getCurrentPosition()` di React frontend

**Rationale**:
- Native browser API, tidak perlu library tambahan
- Tersedia di semua modern browser (Chrome, Firefox, Safari, Edge)
- Hanya berjalan di HTTPS atau localhost (sesuai constraint proyek)

**Best Practices**:
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    // accuracy dalam meter — tampilkan ke user jika > 50m
  },
  (error) => {
    // Handle: PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT
  },
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
);
```

**Alternatives Considered**: IPGeolocation API — ditolak karena akurasi hanya ~1km, tidak memenuhi syarat 100m radius.

---

## 3. Supabase — Tabel `system_configs`

**Decision**: Buat tabel `system_configs` dengan kolom `key` (text PK), `value` (jsonb), `updated_at` (timestamp)

**Rationale**:
- Pola key-value store fleksibel untuk konfigurasi sistem yang dapat berubah
- JSONB memungkinkan menyimpan nested config (lat, lon, radius) dalam satu row
- Admin dapat mengubah HQ coordinates tanpa deploy ulang

**Schema SQL**:
```sql
CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data: koordinat HQ default WKN
INSERT INTO system_configs (key, value) VALUES
('hq_location', '{"lat": -6.2088, "lon": 106.8456, "radius": 100, "name": "WKN HQ Jakarta"}')
ON CONFLICT (key) DO NOTHING;
```

**Alternatives Considered**: Simpan di tabel `employees` sebagai kolom — ditolak karena HQ config adalah data sistem, bukan data karyawan.

---

## 4. Leave-Attendance Sync Pattern

**Decision**: Implementasi di backend Python (FastAPI), bukan Supabase Trigger

**Rationale**:
- Lebih mudah di-debug dan di-maintain dalam Python
- Tidak memerlukan akses Supabase dashboard untuk modifikasi logika
- Konsisten dengan pola existing backend

**Flow**:
```
POST /leave/approve (existing)
  → update leave.status = 'Approved'
  → loop dates (start_date to end_date)
  → INSERT attendance (employee_id, date, status='Leave', note=leave_type)
  → ON CONFLICT (employee_id, date) DO NOTHING
```

**Alternatives Considered**: Supabase Database Trigger (pg_trigger) — ditolak karena memerlukan akses Supabase SQL editor dan lebih sulit di-maintain.

---

## 5. Kolom Baru di Tabel `employees`

**Decision**: Tambah 3 kolom baru ke tabel `employees`

| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| `assigned_site_lat` | FLOAT8 | NULL | Latitude site lapangan yang di-assign |
| `assigned_site_long` | FLOAT8 | NULL | Longitude site lapangan yang di-assign |
| `is_field_team` | BOOLEAN | false | Flag apakah karyawan adalah tim lapangan |

**SQL Migration**:
```sql
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS assigned_site_lat FLOAT8,
  ADD COLUMN IF NOT EXISTS assigned_site_long FLOAT8,
  ADD COLUMN IF NOT EXISTS is_field_team BOOLEAN DEFAULT false;
```

---

## 6. Idempotency Check-in

**Decision**: Tambah unique constraint pada tabel `attendance` untuk mencegah double check-in

**SQL**:
```sql
ALTER TABLE attendance
  ADD CONSTRAINT attendance_employee_date_unique UNIQUE (employee_id, date);
```

**Rationale**: Jika employee mencoba check-in dua kali dalam satu hari, INSERT akan gagal gracefully dengan ON CONFLICT — bukan error 500.

---

## Semua NEEDS CLARIFICATION: RESOLVED ✅

| Item | Status | Resolusi |
|------|--------|----------|
| Formula jarak | ✅ | Haversine Python murni |
| Geolocation browser | ✅ | Navigator API + enableHighAccuracy |
| Penyimpanan config | ✅ | Tabel `system_configs` JSONB |
| Leave sync | ✅ | Backend Python, bukan DB trigger |
| Schema migration | ✅ | ALTER TABLE + ADD COLUMN IF NOT EXISTS |
