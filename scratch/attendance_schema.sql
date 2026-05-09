-- SQL Script for Attendance Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    status TEXT DEFAULT 'Present', -- Present, Late, Absent, Leave
    late_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    location_lat FLOAT,
    location_lng FLOAT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint to prevent duplicate entries for same employee on same day
    UNIQUE(employee_id, date)
);

-- Index for faster lookup
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
