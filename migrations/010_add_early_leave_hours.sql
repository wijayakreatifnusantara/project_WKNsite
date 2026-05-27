-- SQL MIGRATION: Add start_time and end_time columns to leave_requests table
-- Copy and execute this in your Supabase SQL Editor.

ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS end_time TEXT;
