-- 018_crm_tables.sql

-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert dummy client for initial testing
INSERT INTO clients (name, address, email, phone) 
VALUES ('PT. Wijaya Kusuma', 'Jl. Sudirman No. 45, Jakarta', 'finance@wijayakusuma.co.id', '021-555-1234')
ON CONFLICT DO NOTHING;

-- 2. Create Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(100) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- Flexible tax rate (e.g. 0, 11, 12)
    tax_total NUMERIC(15,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Accepted, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    qty NUMERIC(10,2) NOT NULL DEFAULT 1,
    rate NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Simple Policies for authenticated users (Admins)
CREATE POLICY "Allow all auth to manage clients" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all auth to manage quotations" ON quotations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all auth to manage quotation_items" ON quotation_items FOR ALL TO authenticated USING (true);
