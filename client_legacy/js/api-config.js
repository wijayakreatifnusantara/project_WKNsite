/**
 * WKNsite API Configuration
 * Switch between Google Apps Script and FastAPI MCP backend
 */

// ====================================================================
// BACKEND CONFIGURATION
// ====================================================================

// NEW: FastAPI MCP Backend (RECOMMENDED)
const FASTAPI_BASE_URL = 'http://localhost:8000/api';

// OLD: Google Apps Script (Legacy - can be removed after migration)
const GAS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx7x_oiMA-70rmzxt97gzPepF6bJe8t5qLwgeTgaHFRcNRLVAwZjCeUq7hHST--6g/exec';

// ====================================================================
// CONFIGURATION SWITCH
// ====================================================================

// Set to true to use FastAPI MCP, false to use GAS
const USE_FASTAPI_MCP = true; 

// ====================================================================
// API ENDPOINTS CONFIGURATION
// ====================================================================

const API_CONFIG = {
    // FastAPI MCP Endpoints
    fastapi: {
        auth: {
            login: '/auth/login',
            admins: '/auth/admins'
        },
        employees: {
            list: '/employees',
            create: '/employees',
            update: '/employees/{employee_id}',
            delete: '/employees/{employee_id}'
        },
        dashboard: {
            stats: '/dashboard/stats',
            attendance: '/dashboard/attendance',
            mutations: '/dashboard/mutations',
            logs: '/dashboard/logs'
        },
        sync: {
            all: '/sync/all'
        }
    },
    
    // Google Apps Script Endpoints (Legacy)
    gas: {
        login: '?action=login',
        data: '', // Base URL for GET requests
        post: '' // Base URL for POST requests
    }
};

// ====================================================================
// API CLIENT CLASS
// ====================================================================

class WKNApiClient {
    constructor() {
        this.baseURL = USE_FASTAPI_MCP ? FASTAPI_BASE_URL : GAS_SCRIPT_URL;
        this.useFastAPI = USE_FASTAPI_MCP;
    }
    
    // Authentication
    async login(username, password) {
        if (this.useFastAPI) {
            return this.post('/auth/login', { username, password });
        } else {
            const url = `${this.baseURL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
            return this.fetchGas(url);
        }
    }
    
    // Employees
    async getEmployees(query = '') {
        if (this.useFastAPI) {
            const url = query ? `/employees?q=${encodeURIComponent(query)}` : '/employees';
            return this.get(url);
        } else {
            return this.fetchGas(this.baseURL);
        }
    }
    
    async createEmployee(employeeData) {
        if (this.useFastAPI) {
            return this.post('/employees', employeeData);
        } else {
            return this.postGas('add', employeeData);
        }
    }
    
    async updateEmployee(employeeId, employeeData) {
        if (this.useFastAPI) {
            return this.put(`/employees/${employeeId}`, employeeData);
        } else {
            const payload = { ...employeeData, rowid: employeeId, action: 'edit' };
            return this.postGas('edit', payload);
        }
    }
    
    async deleteEmployee(employeeId) {
        if (this.useFastAPI) {
            return this.delete(`/employees/${employeeId}`);
        } else {
            return this.postGas('delete', { rowid: employeeId, action: 'delete' });
        }
    }
    
    // Dashboard
    async getDashboardStats() {
        if (this.useFastAPI) {
            return this.get('/dashboard/stats');
        } else {
            return this.fetchGas(this.baseURL);
        }
    }
    
    async getAttendance() {
        if (this.useFastAPI) {
            return this.get('/dashboard/attendance');
        } else {
            return this.fetchGas(this.baseURL);
        }
    }
    
    async getMutations() {
        if (this.useFastAPI) {
            return this.get('/dashboard/mutations');
        } else {
            return this.fetchGas(this.baseURL);
        }
    }
    
    async getSystemLogs() {
        if (this.useFastAPI) {
            return this.get('/dashboard/logs');
        } else {
            return this.fetchGas(this.baseURL);
        }
    }
    
    async handleSyncAll() {
        if (this.useFastAPI) {
            return this.get('/sync/all');
        } else {
            return this.fetchGas(this.baseURL);
        }
    }
    
    // HTTP Methods for FastAPI
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            return { status: 'error', message: error.message };
        }
    }
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            return { status: 'error', message: error.message };
        }
    }
    
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            return { status: 'error', message: error.message };
        }
    }
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            return { status: 'error', message: error.message };
        }
    }
    
    // Google Apps Script Methods (Legacy)
    async fetchGas(url) {
        try {
            const response = await fetch(url, { redirect: 'follow' });
            const text = await response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error('GAS Fetch Error:', error);
            return { status: 'error', message: error.message };
        }
    }
    
    async postGas(action, data) {
        try {
            const payload = { action, ...data };
            const response = await fetch(this.baseURL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });
            return { status: 'success', message: 'Data sent to GAS' };
        } catch (error) {
            console.error('GAS POST Error:', error);
            return { status: 'error', message: error.message };
        }
    }
}

// ====================================================================
// GLOBAL API INSTANCE
// ====================================================================

const apiClient = new WKNApiClient();

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiClient, USE_FASTAPI_MCP };
} else {
    window.apiClient = apiClient;
    window.USE_FASTAPI_MCP = USE_FASTAPI_MCP;
}
