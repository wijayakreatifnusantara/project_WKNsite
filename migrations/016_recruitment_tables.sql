-- 016_recruitment_tables.sql

-- 1. Create Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Closed, Internal Only
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Job Applicants Table
CREATE TABLE IF NOT EXISTS job_applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'New', -- New, Reviewing, Interview, Offered, Hired, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Assuming Admin only access for now)
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applicants ENABLE ROW LEVEL SECURITY;

-- Create policies for Admin (Currently simple authenticated access)
CREATE POLICY "Allow all authenticated users to read job postings" ON job_postings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all authenticated users to manage job postings" ON job_postings FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users to read job applicants" ON job_applicants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all authenticated users to manage job applicants" ON job_applicants FOR ALL TO authenticated USING (true);
