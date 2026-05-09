-- SQL Script for Payroll History Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payroll_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    period TEXT NOT NULL, -- Format: YYYY-MM
    base_salary NUMERIC DEFAULT 0,
    allowances_total NUMERIC DEFAULT 0,
    gross_salary NUMERIC DEFAULT 0,
    tax_deduction NUMERIC DEFAULT 0,
    bpjs_health_deduction NUMERIC DEFAULT 0,
    bpjs_employment_deduction NUMERIC DEFAULT 0,
    net_salary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Paid',
    meta_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint to prevent duplicate payroll for same employee in same month
    UNIQUE(employee_id, period)
);

-- Index for faster lookup
CREATE INDEX idx_payroll_period ON payroll_history(period);
CREATE INDEX idx_payroll_employee ON payroll_history(employee_id);
