-- Run these commands in your Supabase SQL Editor to optimize performance
-- Go to: https://supabase.com/dashboard/project/vlpaszzbebgrfppklqml/sql

-- 1. Index for employee name (used in search)
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees (name);

-- 2. Index for employee email (used in search)
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (email);

-- 3. Index for status (used in filtering)
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees (status);

-- 4. Index for organization (used in filtering)
CREATE INDEX IF NOT EXISTS idx_employees_org ON employees (organization_name);

-- 5. Index for join date (common sorting)
CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees (join_date);
