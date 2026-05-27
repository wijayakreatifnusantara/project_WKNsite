-- 015_timesheet_status.sql

-- Add status column to timesheets table to enable Admin Approval workflow
ALTER TABLE timesheets 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- Add index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
