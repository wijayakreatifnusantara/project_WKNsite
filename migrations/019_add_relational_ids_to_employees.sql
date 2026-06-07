-- Migration 019: Add Relational IDs to Employees Table

-- 1. Add department_id and position_id to public.employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL;

-- 2. Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON public.employees(position_id);

-- Note: We retain division_name, job_position, and job_level columns for backward compatibility 
-- with the Flutter Mobile App, which relies on these text fields.
