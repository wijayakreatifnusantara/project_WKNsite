-- Finance
CREATE TABLE IF NOT EXISTS finance_expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    category VARCHAR(255),
    amount DECIMAL(15,2),
    date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    user_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS finance_invoices (
    id SERIAL PRIMARY KEY,
    client VARCHAR(255),
    due_date DATE,
    invoice_no VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Unpaid',
    items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Surveys
CREATE TABLE IF NOT EXISTS company_surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'Active',
    questions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Wiki
CREATE TABLE IF NOT EXISTS company_wiki (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    category VARCHAR(100),
    content TEXT,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM Quotations
CREATE TABLE IF NOT EXISTS crm_quotations (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255),
    project_title VARCHAR(255),
    total_amount DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'Draft',
    items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Hub
CREATE TABLE IF NOT EXISTS documents_hub (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    type VARCHAR(50),
    file_url TEXT,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets Consumables
CREATE TABLE IF NOT EXISTS assets_consumables (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255),
    quantity INT,
    unit VARCHAR(50),
    min_threshold INT,
    last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Notifications (For the Bell Icon)
CREATE TABLE IF NOT EXISTS system_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
