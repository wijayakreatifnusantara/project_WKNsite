-- Add shift_id column to employees table to support "Assign Shift" feature
ALTER TABLE employees
ADD COLUMN shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL;

-- Create an index to speed up lookups if filtering by shift
CREATE INDEX idx_employees_shift_id ON employees(shift_id);
