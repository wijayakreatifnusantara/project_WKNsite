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

-- Allow all for admin/HR role (you can adjust according to your RBAC)
CREATE POLICY "Allow all shifts for authenticated users" 
ON public.shifts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all holidays for authenticated users" 
ON public.national_holidays FOR ALL USING (auth.role() = 'authenticated');

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
