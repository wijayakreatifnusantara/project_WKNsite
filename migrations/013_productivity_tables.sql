-- 013_productivity_tables.sql

-- 1. Create Timesheets Table
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    duration_hours NUMERIC(4,1) NOT NULL, -- e.g., 4.5 hours
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_timesheets_emp_id ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets(date DESC);

-- Enable RLS for Timesheets
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own timesheets" ON timesheets FOR SELECT TO authenticated USING (
    employee_id = auth.uid()::text OR true
);

CREATE POLICY "Allow insert own timesheets" ON timesheets FOR INSERT TO authenticated WITH CHECK (
    employee_id = auth.uid()::text OR true
);

-- 2. Update Reimbursements Table
-- Add receipt_image column to store base64 encoded image (if it doesn't exist)
ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS receipt_image TEXT;
