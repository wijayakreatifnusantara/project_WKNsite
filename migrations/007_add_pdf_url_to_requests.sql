-- SQL MIGRATION: Add pdf_url column to leave_requests and overtime_requests tables
-- Copy and execute this in your Supabase SQL Editor.

ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE overtime_requests ADD COLUMN IF NOT EXISTS pdf_url TEXT;
