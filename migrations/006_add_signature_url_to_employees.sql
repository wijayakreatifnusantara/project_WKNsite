-- SQL MIGRATION: Add signature_url column to employees table
-- Copy and execute this in your Supabase SQL Editor.

ALTER TABLE employees ADD COLUMN IF NOT EXISTS signature_url TEXT;
