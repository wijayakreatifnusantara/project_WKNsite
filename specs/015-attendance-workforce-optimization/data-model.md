# Data Model: Attendance & Workforce Optimization

**Phase**: 1 — Design & Contracts  
**Feature**: `015-attendance-workforce-optimization`  
**Date**: 2026-05-09

---

## Entities

### 1. `employees` (MODIFIED — tambah kolom baru)

| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| `id` | TEXT PK | — | Employee ID |
| `name` | TEXT | — | Nama lengkap |
| `status` | TEXT | — | Active / Inactive / Resigned |
| `assigned_site_lat` | FLOAT8 | NULL | **NEW** Latitude site lapangan |
| `assigned_site_long` | FLOAT8 | NULL | **NEW** Longitude site lapangan |
| `is_field_team` | BOOLEAN | false | **NEW** Flag tim lapangan |
| *(kolom lain existing)* | — | — | Tidak berubah |

**SQL Migration**:
```sql
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS assigned_site_lat FLOAT8,
  ADD COLUMN IF NOT EXISTS assigned_site_long FLOAT8,
  ADD COLUMN IF NOT EXISTS is_field_team BOOLEAN DEFAULT false;
```

---

### 2. `system_configs` (NEW)

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| `key` | TEXT | PRIMARY KEY | Identifier unik konfigurasi |
| `value` | JSONB | NOT NULL | Nilai konfigurasi (fleksibel) |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp terakhir diperbarui |

**Seed Data — HQ Default**:
```json
{
  "key": "hq_location",
  "value": {
    "lat": -6.2088,
    "lon": 106.8456,
    "radius": 100,
    "name": "WKN HQ Jakarta"
  }
}
```

**SQL**:
```sql
CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_configs (key, value) VALUES
('hq_location', '{"lat": -6.2088, "lon": 106.8456, "radius": 100, "name": "WKN HQ Jakarta"}')
ON CONFLICT (key) DO NOTHING;
```

---

### 3. `attendance` (MODIFIED — tambah constraint)

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID/SERIAL PK | Auto-generated |
| `employee_id` | TEXT FK → employees.id | Referensi karyawan |
| `date` | DATE | Tanggal absen |
| `check_in_time` | TIMESTAMPTZ | Waktu check-in |
| `status` | TEXT | Present / Late / Leave / Absent |
| `late_minutes` | INTEGER | Menit keterlambatan (0 jika tepat waktu) |
| `latitude` | FLOAT8 | **NEW** Koordinat saat check-in (opsional, tidak persisten) |
| `longitude` | FLOAT8 | **NEW** Koordinat saat check-in (opsional, tidak persisten) |
| `notes` | TEXT | Catatan (e.g., jenis cuti) |

**SQL — Unique Constraint (idempotency)**:
```sql
ALTER TABLE attendance
  ADD CONSTRAINT IF NOT EXISTS attendance_employee_date_unique 
  UNIQUE (employee_id, date);
```

---

## State Transitions

### Check-in Flow

```
[User buka ESS]
      │
      ▼
[Minta izin Geolocation Browser]
      │
      ├─ DENIED ──► Tampilkan error "Aktifkan GPS"
      │
      ▼
[Dapatkan lat/lon user]
      │
      ▼
[Cek is_field_team]
      │
      ├─ TRUE ──► Validasi vs assigned_site_lat/long karyawan
      └─ FALSE ─► Validasi vs system_configs["hq_location"]
      │
      ▼
[Hitung haversine_distance]
      │
      ├─ ≤ radius ──► status = "Present" atau "Late" (cek jam)
      └─ > radius ──► Tolak check-in, tampilkan jarak aktual
      │
      ▼
[INSERT attendance — ON CONFLICT DO NOTHING]
```

### Leave Sync Flow

```
POST /leave/approve
      │
      ▼
[Update leave.status = 'Approved']
      │
      ▼
[Loop setiap tanggal dari start_date ke end_date]
      │
      ▼
[INSERT attendance (employee_id, date, status='Leave', notes=leave_type)]
      │         ON CONFLICT (employee_id, date) DO NOTHING
      ▼
[Return: jumlah hari yang disinkronkan]
```

---

## Validation Rules

| Rule | Detail |
|------|--------|
| Geofencing radius | Default 100m, dapat diubah Admin via UI |
| Late threshold | Check-in setelah jam 08:30 WIB dianggap "Late" |
| Double check-in | Diblokir oleh UNIQUE constraint; kembalikan data existing |
| Field team tanpa site | Jika `assigned_site_lat` NULL, fallback ke HQ location |
| Radius minimum | Minimal 50m (validasi backend), maksimal 5000m |

---

## Relasi

```
employees (1) ────────── (N) attendance
     │
     └── is_field_team = true
              │
              └── assigned_site_lat / assigned_site_long

system_configs
     └── key = "hq_location" → {lat, lon, radius, name}
```
