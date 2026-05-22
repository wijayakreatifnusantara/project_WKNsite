-- SQL MIGRATION: Update foreign key constraints to support employee ID changes
-- Copy and execute this in your Supabase SQL Editor.

-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS attendance DROP CONSTRAINT IF EXISTS attendance_employee_id_fkey;
ALTER TABLE IF EXISTS leave_requests DROP CONSTRAINT IF EXISTS leave_requests_employee_id_fkey;
ALTER TABLE IF EXISTS payroll_history DROP CONSTRAINT IF EXISTS payroll_history_employee_id_fkey;
ALTER TABLE IF EXISTS performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_employee_id_fkey;
ALTER TABLE IF EXISTS asset_assignments DROP CONSTRAINT IF EXISTS asset_assignments_employee_id_fkey;
ALTER TABLE IF EXISTS assets DROP CONSTRAINT IF EXISTS assets_current_holder_id_fkey;
ALTER TABLE IF EXISTS documents DROP CONSTRAINT IF EXISTS documents_employee_id_fkey;

-- Recreate foreign key constraints with ON UPDATE CASCADE
ALTER TABLE attendance 
  ADD CONSTRAINT attendance_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE leave_requests 
  ADD CONSTRAINT leave_requests_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE payroll_history 
  ADD CONSTRAINT payroll_history_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE performance_reviews 
  ADD CONSTRAINT performance_reviews_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE asset_assignments 
  ADD CONSTRAINT asset_assignments_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE assets 
  ADD CONSTRAINT assets_current_holder_id_fkey 
  FOREIGN KEY (current_holder_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE documents 
  ADD CONSTRAINT documents_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) 
  ON UPDATE CASCADE ON DELETE SET NULL;
