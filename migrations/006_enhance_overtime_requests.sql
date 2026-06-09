-- SQL MIGRATION: Enhance Overtime Requests
-- Copy and execute this in your Supabase SQL Editor.

-- Add new columns for Enterprise-grade Overtime Management
ALTER TABLE overtime_requests 
ADD COLUMN IF NOT EXISTS compensation_type TEXT DEFAULT 'Paid' CHECK (compensation_type IN ('Paid', 'Time-off')),
ADD COLUMN IF NOT EXISTS multiplier NUMERIC(4,2) DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS total_pay NUMERIC(12,2) DEFAULT 0;

-- Optional: Add manager and HR approval tracking for multi-tier (Phase 2)
ALTER TABLE overtime_requests 
ADD COLUMN IF NOT EXISTS manager_approved_by TEXT REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hr_approved_by TEXT REFERENCES employees(id) ON DELETE SET NULL;
