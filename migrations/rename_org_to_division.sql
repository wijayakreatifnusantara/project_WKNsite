-- Migration to rename 'organizations' to 'divisions'

-- 1. Rename the organizations table
ALTER TABLE public.organizations RENAME TO divisions;

-- 2. Rename organization_id column in departments table
ALTER TABLE public.departments RENAME COLUMN organization_id TO division_id;

-- 3. Rename organization_id and organization_name columns in employees table
ALTER TABLE public.employees RENAME COLUMN organization_id TO division_id;
ALTER TABLE public.employees RENAME COLUMN organization_name TO division_name;

-- Note: Because Supabase relies on PostgreSQL, renaming a column/table will automatically 
-- update its dependent foreign keys under the hood, but the column names themselves 
-- need to be explicitly renamed as above.

-- 4. Update Policies for divisions table (since the table was renamed, policies should still apply, 
-- but if they have names containing "organization", you may want to rename them for clarity).
-- (Optional, omitting for brevity as they still work)
