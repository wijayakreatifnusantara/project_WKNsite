-- SQL MIGRATION: Update RLS Policies for Overtime and Leave Requests to support anon (mobile app) role
-- Copy and execute this in your Supabase Dashboard -> SQL Editor.

-- -------------------------------------------------------------
-- 1. Update Overtime Requests Policies
-- -------------------------------------------------------------
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own or all if admin" ON overtime_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON overtime_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON overtime_requests;
DROP POLICY IF EXISTS "Allow select for all" ON overtime_requests;
DROP POLICY IF EXISTS "Allow insert for all" ON overtime_requests;
DROP POLICY IF EXISTS "Allow update for all" ON overtime_requests;

-- Create public-friendly policies (accessible by both anon and authenticated roles)
CREATE POLICY "Allow select for all" 
ON overtime_requests FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow insert for all" 
ON overtime_requests FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update for all" 
ON overtime_requests FOR UPDATE 
TO anon, authenticated 
USING (true);

-- -------------------------------------------------------------
-- 2. Update Leave Requests Policies
-- -------------------------------------------------------------
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own or all if admin" ON leave_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON leave_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON leave_requests;
DROP POLICY IF EXISTS "Allow select for all" ON leave_requests;
DROP POLICY IF EXISTS "Allow insert for all" ON leave_requests;
DROP POLICY IF EXISTS "Allow update for all" ON leave_requests;

-- Create public-friendly policies (accessible by both anon and authenticated roles)
CREATE POLICY "Allow select for all" 
ON leave_requests FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow insert for all" 
ON leave_requests FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update for all" 
ON leave_requests FOR UPDATE 
TO anon, authenticated 
USING (true);
