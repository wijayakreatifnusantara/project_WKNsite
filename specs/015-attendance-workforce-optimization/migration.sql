-- ============================================================
-- Migration: 015-attendance-workforce-optimization
-- Date: 2026-05-09
-- Description: Add geofencing support fields and system_configs table
-- ============================================================

-- T001: Tambah kolom geofencing ke tabel employees
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS assigned_site_lat FLOAT8,
  ADD COLUMN IF NOT EXISTS assigned_site_long FLOAT8,
  ADD COLUMN IF NOT EXISTS is_field_team BOOLEAN DEFAULT false;

-- T002: Buat tabel system_configs untuk konfigurasi HQ dan parameter sistem
CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- T003: Seed data default HQ location WKN
INSERT INTO system_configs (key, value) VALUES
('hq_location', '{"lat": -6.2088, "lon": 106.8456, "radius": 100, "name": "WKN HQ Jakarta"}')
ON CONFLICT (key) DO NOTHING;

-- T004: Tambah UNIQUE constraint untuk mencegah double check-in
-- (Jalankan ini jika constraint belum ada)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'attendance_employee_date_unique'
  ) THEN
    ALTER TABLE attendance
      ADD CONSTRAINT attendance_employee_date_unique UNIQUE (employee_id, date);
  END IF;
END $$;

-- Verifikasi migration
SELECT 
  'employees columns added' as check,
  COUNT(*) as col_count
FROM information_schema.columns 
WHERE table_name = 'employees' 
  AND column_name IN ('assigned_site_lat', 'assigned_site_long', 'is_field_team');

SELECT 
  'system_configs table' as check,
  COUNT(*) as row_count
FROM system_configs;
