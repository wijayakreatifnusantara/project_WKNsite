-- 017_career_portal_rls.sql

-- For the public career portal to work, we must allow 'anon' (anonymous/unauthenticated) users
-- to READ active job postings and INSERT into job applicants.

-- 1. Allow public to SELECT active job postings
CREATE POLICY "Allow public to read active job postings" 
ON job_postings 
FOR SELECT 
TO anon 
USING (status = 'Active');

-- 2. Allow public to INSERT job applicants
CREATE POLICY "Allow public to insert job applicants" 
ON job_applicants 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Ensure RLS is enabled just in case
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applicants ENABLE ROW LEVEL SECURITY;
