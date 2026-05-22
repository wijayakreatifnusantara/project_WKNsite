-- SQL MIGRATION: Update Organizations Table to support PIC Details
-- Copy and execute this in your Supabase SQL Editor

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS pic_name TEXT,
ADD COLUMN IF NOT EXISTS pic_email TEXT,
ADD COLUMN IF NOT EXISTS pic_phone TEXT;
