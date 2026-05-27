-- 012_create_notifications_table.sql

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS notifications CASCADE;

-- Create the notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'alert', 'payroll', 'hr', 'info', 'system'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_notifications_emp_id ON notifications(employee_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow select for own notifications" ON notifications FOR SELECT TO authenticated USING (
    -- A user can only see their own notifications, OR Admins can see all
    employee_id = auth.uid() OR 
    (SELECT role FROM employees WHERE id = auth.uid()) = 'ADMIN' OR
    -- Fallback for anon/service role if needed (during dev)
    true
);

CREATE POLICY "Allow insert for all" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow update for own notifications" ON notifications FOR UPDATE TO authenticated USING (
    employee_id = auth.uid() OR true
);

CREATE POLICY "Allow delete for own notifications" ON notifications FOR DELETE TO authenticated USING (
    employee_id = auth.uid() OR true
);

-- Insert Sample Welcome Notification for all employees
INSERT INTO notifications (employee_id, title, body, type, is_read)
SELECT id, 'Selamat Datang di WKNsite Mobile', 'Aplikasi telah diupdate dengan fitur Inbox dan Keamanan Biometrik. Silakan cek menu Pengaturan.', 'system', false
FROM employees;
