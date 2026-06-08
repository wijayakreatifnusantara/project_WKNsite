-- SQL MIGRATION: Enable RLS and create policies for tables containing personal information

-- 1. EMPLOYEES TABLE
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors
DROP POLICY IF EXISTS "Employees can view their own data" ON employees;
DROP POLICY IF EXISTS "Employees can update their own data" ON employees;

-- Policy: Employees can view their own record based on matching email in JWT
CREATE POLICY "Employees can view their own data"
ON employees FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

-- Policy: Employees can update their own record
CREATE POLICY "Employees can update their own data"
ON employees FOR UPDATE
TO authenticated
USING (email = (auth.jwt() ->> 'email'));


-- 2. PROFILES TABLE
-- Ensure RLS is enabled for profiles as well (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;';
        
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;';
        
        -- Asumsikan kolom username di profiles menyimpan email
        EXECUTE 'CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (username = (auth.jwt() ->> ''email''));';
        EXECUTE 'CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (username = (auth.jwt() ->> ''email''));';
    END IF;
END $$;
