-- 014_employee_devices.sql

-- Add device tracking columns to the employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS last_device_brand TEXT,
ADD COLUMN IF NOT EXISTS last_device_model TEXT,
ADD COLUMN IF NOT EXISTS last_device_os TEXT;
