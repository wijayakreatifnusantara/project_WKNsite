-- Migration 001: positions table (idempotent)
-- Run in Supabase SQL Editor or: npx supabase db execute -f migrations/001_create_positions_table.sql

CREATE TABLE IF NOT EXISTS positions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    level         TEXT,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_positions_department_id ON positions(department_id);

-- Prevent duplicate active position names within the same department
CREATE UNIQUE INDEX IF NOT EXISTS idx_positions_dept_name_active
    ON positions (department_id, lower(trim(name)))
    WHERE is_active = TRUE;

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated" ON positions;
CREATE POLICY "Allow all for authenticated" ON positions
    FOR ALL USING (TRUE);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_positions_updated_at ON positions;
CREATE TRIGGER trg_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION set_positions_updated_at();
