-- SQL Schema untuk Master Shift dan Master Libur Nasional

-- 1. Table: shifts
CREATE TABLE public.shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    time_in TIME NOT NULL,
    time_out TIME NOT NULL,
    grace_period INTEGER DEFAULT 15, -- dalam menit
    break_start TIME,
    break_end TIME,
    is_cross_day BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: national_holidays
CREATE TABLE public.national_holidays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(50) DEFAULT 'Libur Nasional', -- enum: Libur Nasional, Cuti Bersama, Libur Perusahaan
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_holidays ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users
CREATE POLICY "Allow read shifts for authenticated users" 
ON public.shifts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read holidays for authenticated users" 
ON public.national_holidays FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all for admin/HR role ONLY
CREATE POLICY "Allow all shifts for admin and hr" 
ON public.shifts FOR ALL USING (auth.jwt() ->> 'user_role' IN ('admin', 'hr', 'owner'));

CREATE POLICY "Allow all holidays for admin and hr" 
ON public.national_holidays FOR ALL USING (auth.jwt() ->> 'user_role' IN ('admin', 'hr', 'owner'));

-- Seed Data: Shifts
INSERT INTO public.shifts (code, name, time_in, time_out, grace_period, is_cross_day) VALUES
('OFC', 'Normal Office Hours', '08:00:00', '17:00:00', 15, false),
('M-01', 'Morning Shift', '06:00:00', '14:00:00', 15, false),
('E-01', 'Evening Shift', '14:00:00', '22:00:00', 15, false),
('N-01', 'Night Shift', '22:00:00', '06:00:00', 15, true);

-- Seed Data: Holidays (Contoh 2024/2025)
INSERT INTO public.national_holidays (name, start_date, end_date, type) VALUES
('Tahun Baru Masehi', '2025-01-01', '2025-01-01', 'Libur Nasional'),
('Hari Raya Idul Fitri', '2025-03-31', '2025-04-01', 'Libur Nasional');

-- ==========================================
-- AUDIT TRAIL SYSTEM
-- ==========================================

-- 3. Table: audit_logs
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(10) NOT NULL, -- CREATE, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id UUID, -- Optional: Who made the change (if available from auth.uid())
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can view audit logs
CREATE POLICY "Allow read audit_logs for admins" 
ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated'); -- Note: in production, check specific role

-- Allow authenticated users to insert DOWNLOAD action logs
CREATE POLICY "Allow insert download logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (action = 'DOWNLOAD');

-- Trigger Function for Audit Trail
CREATE OR REPLACE FUNCTION public.handle_audit()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid(); -- Get user ID from Supabase auth session
    
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', row_to_json(OLD)::jsonb, current_user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, current_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id::text, 'CREATE', row_to_json(NEW)::jsonb, current_user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Triggers to existing tables
CREATE TRIGGER audit_shifts_changes
AFTER INSERT OR UPDATE OR DELETE ON public.shifts
FOR EACH ROW EXECUTE FUNCTION public.handle_audit();

CREATE TRIGGER audit_holidays_changes
AFTER INSERT OR UPDATE OR DELETE ON public.national_holidays
FOR EACH ROW EXECUTE FUNCTION public.handle_audit();
