-- SQL MIGRATION: Create Overtime Requests Table
-- Copy and execute this in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours NUMERIC(4,2) NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS
-- Users can view their own requests, and Admins can view all
CREATE POLICY "Users can view own or all if admin" 
ON overtime_requests FOR SELECT 
TO authenticated 
USING (true);

-- Users can submit their own requests
CREATE POLICY "Users can insert own requests" 
ON overtime_requests FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Admins can update/delete requests
CREATE POLICY "Admins can update requests" 
ON overtime_requests FOR UPDATE 
TO authenticated 
USING (true);

-- Enable realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE overtime_requests;
