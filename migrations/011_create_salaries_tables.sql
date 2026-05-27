-- SQL MIGRATION: Phase 8 - Employee Salaries & Corrections
-- FINAL FIX: Drop tables first (cascade removes policies), then recreate.

-- Step 1: Nuke everything clean
DROP TABLE IF EXISTS employee_salaries CASCADE;
DROP TABLE IF EXISTS salary_corrections CASCADE;
DROP TABLE IF EXISTS payslip_templates CASCADE;

-- Step 2: Create tables
CREATE TABLE employee_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    grade TEXT,
    basic_salary NUMERIC DEFAULT 0,
    position_allowance NUMERIC DEFAULT 0,
    skill_allowance NUMERIC DEFAULT 0,
    communication_allowance NUMERIC DEFAULT 0,
    work_order_allowance NUMERIC DEFAULT 0,
    meals_allowance NUMERIC DEFAULT 0,
    transport_allowance NUMERIC DEFAULT 0,
    overtime_allowance NUMERIC DEFAULT 0,
    bpjs_tk_jkk NUMERIC DEFAULT 0,
    bpjs_tk_jkm NUMERIC DEFAULT 0,
    bpjs_tk_jht NUMERIC DEFAULT 0,
    bpjs_tk_pensiun NUMERIC DEFAULT 0,
    bpjs_kesehatan NUMERIC DEFAULT 0,
    tax_allowance NUMERIC DEFAULT 0,
    thr NUMERIC DEFAULT 0,
    bonus NUMERIC DEFAULT 0,
    incentive NUMERIC DEFAULT 0,
    misc_earnings NUMERIC DEFAULT 0,
    pph21 NUMERIC DEFAULT 0,
    deduction_jht NUMERIC DEFAULT 0,
    deduction_pensiun NUMERIC DEFAULT 0,
    deduction_kesehatan NUMERIC DEFAULT 0,
    loan NUMERIC DEFAULT 0,
    misc_deductions NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_employee_salaries_emp_id ON employee_salaries(employee_id);

CREATE TABLE salary_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    correction_message TEXT NOT NULL,
    requested_changes JSONB,
    status TEXT DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payslip_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT DEFAULT 'WKNsite',
    header_logo_url TEXT,
    primary_color TEXT DEFAULT '#F97316',
    show_company_address BOOLEAN DEFAULT true,
    company_address TEXT,
    watermark_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO payslip_templates (company_name, primary_color, is_active)
VALUES ('PT. Wijaya Kreatif Nusantara', '#F97316', true);

-- Step 3: RLS
ALTER TABLE employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for all" ON employee_salaries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert for all" ON employee_salaries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for all" ON employee_salaries FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow delete for all" ON employee_salaries FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow select for all" ON salary_corrections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert for all" ON salary_corrections FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for all" ON salary_corrections FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow select for all" ON payslip_templates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert for all" ON payslip_templates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for all" ON payslip_templates FOR UPDATE TO anon, authenticated USING (true);
