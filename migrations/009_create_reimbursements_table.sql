-- SQL MIGRATION: Create Reimbursements Table and RLS Policies
-- Copy and execute this in your Supabase Dashboard -> SQL Editor.

CREATE TABLE IF NOT EXISTS reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Review')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS (accessible by both anon and authenticated roles)
CREATE POLICY "Allow select for all" 
ON reimbursements FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow insert for all" 
ON reimbursements FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update for all" 
ON reimbursements FOR UPDATE 
TO anon, authenticated 
USING (true);

-- Enable realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE reimbursements;
