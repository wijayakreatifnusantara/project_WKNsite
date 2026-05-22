-- SQL MIGRATION: Update Employees Table for Advanced Onboarding
-- Copy and execute this in your Supabase SQL Editor

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS ktp_address TEXT,
ADD COLUMN IF NOT EXISTS domicile_address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_1_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_1_rel TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_1_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_2_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_2_rel TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_2_phone TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
ADD COLUMN IF NOT EXISTS bank_branch TEXT,
ADD COLUMN IF NOT EXISTS payroll_method TEXT DEFAULT 'Bank Transfer',
ADD COLUMN IF NOT EXISTS npwp TEXT,
ADD COLUMN IF NOT EXISTS npwp_16_digit TEXT,
ADD COLUMN IF NOT EXISTS ptkp_status TEXT DEFAULT 'TK/0',
ADD COLUMN IF NOT EXISTS tax_method TEXT DEFAULT 'Gross',
ADD COLUMN IF NOT EXISTS kpp_name TEXT,
ADD COLUMN IF NOT EXISTS faskes_tk1 TEXT,
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Permanent',
ADD COLUMN IF NOT EXISTS probation_end_date DATE,
ADD COLUMN IF NOT EXISTS working_location TEXT DEFAULT 'Head Office',
ADD COLUMN IF NOT EXISTS overtime_eligible BOOLEAN DEFAULT TRUE;

-- Optional: If 'whatsapp' column exists and you want to migrate it to 'phone'
-- UPDATE employees SET phone = whatsapp WHERE phone IS NULL;
