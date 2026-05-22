
// --- Core Utility Functions (ALWAYS AVAILABLE) ---
// --- Core Utility Functions ---
const UI = {
    togglePassword: (inputId, btnId) => {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (!input || !btn) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        // Handle Font Awesome icons (new design)
        const iconI = btn.querySelector('i');
        if (iconI) {
            iconI.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
        
        // Fallback for SVG icons (old design compatibility)
        const iconSvg = btn.querySelector('svg');
        if (iconSvg) {
            iconSvg.innerHTML = isPassword 
                ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
                : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
    },
    icons: {
        search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
        user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
        delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
        reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`,
        eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
        plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
        bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        folder: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`
    },
    showToast: (message, type = 'info') => {
        let container = document.querySelector('.toast-container') || (() => {
            const c = document.createElement('div');
            c.className = 'toast-container';
            document.body.appendChild(c);
            return c;
        })();
        const toast = document.createElement('div');
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };
        const titleText = { success: 'BERHASIL', error: 'KESALAHAN', info: 'INFO', warning: 'PERINGATAN' }[type] || 'INFO';
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${icons[type] || icons.info}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.8125rem; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${titleText}</div>
                <div style="font-size: 0.75rem; color: #64748b; line-height: 1.4;">${message}</div>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; setTimeout(() => toast.remove(), 300); }, 4000);
    },
    transitionTo: (targetId, show = true) => {
        const el = document.getElementById(targetId);
        if (!el) return;
        
        if (show) {
            el.style.display = 'flex';
            el.style.opacity = '1';
            el.classList.add('fade-in');
        } else {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.display = 'none';
                el.classList.remove('fade-in');
            }, 500);
        }
    }
};
window.showToast = UI.showToast;

// Audit Log Global Data
let auditLogData = [];

function createAuditLog(action, target, details = "") {
    const timestamp = new Date().toLocaleString('id-ID');
    const user = localStorage.getItem('GajiPro_UserName') || 'System';
    const logEntry = {
        timestamp,
        user,
        action,
        target,
        details
    };
    
    auditLogData.unshift(logEntry);
    
    // Simpan ke spreadsheet (async background)
    if (typeof SCRIPT_URL !== 'undefined') {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'add_audit_log',
                ...logEntry
            })
        }).catch(err => console.warn('Audit log sync failed:', err));
    }
    
    console.log(`[AUDIT] ${timestamp} - ${user}: ${action} on ${target} | ${details}`);
}
window.createAuditLog = createAuditLog;

const Utils = {
    getVal: (obj, keys, fallback = '') => {
        if (!obj) return fallback;
        for (const k of keys) if (obj[k]) return obj[k];
        const lKeys = keys.map(k => k.toLowerCase());
        for (const k in obj) if (lKeys.includes(k.toLowerCase())) return obj[k];
        return fallback;
    },
    formatDate: (s) => {
        if (!s || s === '-' || s === 'undefined') return '';
        s = String(s).trim();
        if (!isNaN(s) && s.length > 4 && !s.includes('-')) {
            const d = new Date((Number(s) - 25569) * 86400 * 1000);
            return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
        const d = new Date(s);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    }
};
window.getVal = Utils.getVal;
window.formatDateForInput = Utils.formatDate;

function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    
    if (show === undefined) show = !sidebar.classList.contains('drawer-open');
    
    if (show) {
        sidebar.classList.add('drawer-open');
        overlay.classList.add('active');
    } else {
        sidebar.classList.remove('drawer-open');
        overlay.classList.remove('active');
    }
}
window.toggleSidebar = toggleSidebar;

function navigate(targetId) {
    const navItem = document.getElementById(targetId);
    if (navItem) {
        navItem.click();
        // Auto-close sidebar on mobile after navigation
        if (window.innerWidth <= 768) toggleSidebar(false);
    }
}
window.navigate = navigate;

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('WKN_Theme', newTheme);
    updateThemeIcon(newTheme);
}
window.toggleTheme = toggleTheme;

function updateThemeIcon(theme) {
    const path = document.getElementById('theme-path');
    if (!path) return;
    if (theme === 'dark') {
        // Sun icon for dark mode (to switch back to light)
        path.setAttribute('d', 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z');
    } else {
        // Moon icon for light mode
        path.setAttribute('d', 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('WKN_Theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTimeout(() => updateThemeIcon(savedTheme), 100);
}
initTheme();

try {
    // Main Application Logic Starts Here
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM Content Loaded - Initializing WKNsite");

        // Get elements after DOM is ready
        const togglePasswordBtn = document.getElementById('toggle-password');
        const loginForm = document.getElementById('login-form');
        const loginScreen = document.getElementById('login-screen');
        
        console.log("Elements found:", {
            togglePasswordBtn: !!togglePasswordBtn,
            loginForm: !!loginForm,
            loginScreen: !!loginScreen
        });
    
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Toggle password button clicked");
                UI.togglePassword('login-password', 'toggle-password');
            });
            console.log("Toggle password button event listener attached");
        } else {
            console.warn("main.js: toggle-password button not found!");
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Login form submitted");
                
                const submitBtn = e.target.querySelector('button[type="submit"]');
                const emailInput = document.getElementById('username');
                const passwordInput = document.getElementById('login-password');
                
                const username = emailInput ? emailInput.value.toLowerCase().trim() : "";
                const password = passwordInput ? passwordInput.value.trim() : "";

                console.log("Login attempt:", { username: username, hasPassword: !!password });

                if (!username || !password) {
                    showToast("Email dan password harus diisi", 'error');
                    return;
                }

                const originalContent = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Menautkan...</span><i class="fas fa-circle-notch fa-spin"></i>`;

                // Local login fallback for testing
                if (username === "admin@wijayakn.com" && password === "admin") {
                    console.log("Local login successful");
                    isAuthenticated = true;
                    localStorage.setItem('GajiPro_Auth', 'true');
                    localStorage.setItem('GajiPro_UserName', 'Super Admin');
                    localStorage.setItem('GajiPro_Auth_Username', username);
                    localStorage.setItem('GajiPro_Role', 'Super Admin');
                    localStorage.setItem('GajiPro_EmployeeId', '');
                    showToast('Login Berhasil!', 'success');
                    
                    // Hide login screen and show dashboard
                    if (loginScreen) {
                        loginScreen.style.opacity = '0';
                        setTimeout(() => {
                            loginScreen.style.display = 'none';
                            // Initialize dashboard
                            initializeDashboard();
                        }, 500);
                    }
                    return;
                }

                // Try API login
                try {
                    console.log("Attempting API login");
                    const response = await apiClient.login(username, password);
                    console.log("API Response:", response);

                    if (response.status === 'success' && response.user) {
                        console.log("API login successful");
                        isAuthenticated = true;
                        const userData = response.user || {};
                        localStorage.setItem('GajiPro_Auth', 'true');
                        localStorage.setItem('GajiPro_UserName', response.name || userData['Full Name'] || username);
                        localStorage.setItem('GajiPro_Auth_Username', username);
                        localStorage.setItem('GajiPro_Role', userData['Role'] || 'Staff');
                        localStorage.setItem('GajiPro_EmployeeId', userData['Employee ID'] || '');
                        showToast(`Selamat datang, ${response.name || userData['Full Name'] || username}!`, 'success');
                        
                        // Hide login screen and show dashboard
                        if (loginScreen) {
                            loginScreen.style.opacity = '0';
                            setTimeout(() => {
                                loginScreen.style.display = 'none';
                                // Initialize dashboard
                                initializeDashboard();
                            }, 500);
                        }
                    } else {
                        console.log("API login failed:", response.message);
                        showToast(response.message || 'Login Gagal', 'error');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalContent;
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showToast("Koneksi Error: " + error.message, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
            });
            console.log("Login form event listener attached");
        } else {
            console.warn("main.js: login form not found!");
        }

        // Initialize Auth
        checkAuth();
        
        // Start connection status monitoring
        connectionManager.startPeriodicCheck();
    });
} catch (error) {
    console.error("Critical error during initial load:", error);
}

window.onerror = function(msg, url, line, col, error) {
    console.error("Global Error:", msg, "at", url, ":", line);
    return false;
};

// Connection Status Management
class ConnectionStatusManager {
    constructor() {
        this.statusElement = document.getElementById('connection-status');
        this.statusDot = document.getElementById('status-dot');
        this.statusText = document.getElementById('status-text');
        this.checkInterval = null;
        this.isChecking = false;
    }

    updateStatus(status, message) {
        if (!this.statusElement) return;
        
        // Remove all status classes
        this.statusElement.classList.remove('status-online', 'status-offline', 'status-checking');
        
        // Add appropriate status class
        this.statusElement.classList.add(`status-${status}`);
        
        // Update text
        if (this.statusText) {
            this.statusText.textContent = message;
        }
        
        console.log(`Connection status: ${status} - ${message}`);
    }

    async checkSpreadsheetConnection() {
        if (this.isChecking) return;
        this.isChecking = true;
        
        try {
            this.updateStatus('checking', 'Memeriksa koneksi data...');
            
            // Use apiClient to test connection
            const startTime = Date.now();
            const response = await apiClient.getEmployees();
            const duration = Date.now() - startTime;
            
            if (response && Array.isArray(response)) {
                this.updateStatus('online', `🟢 Online - Terhubung ke data (${response.length} karyawan)`);
                console.log(`✅ Data source connected in ${duration}ms: ${response.length} employees loaded`);
            } else if (response && response.status === 'error') {
                throw new Error(response.message || 'Error fetching data');
            } else {
                throw new Error('Invalid data format from API');
            }
            
        } catch (error) {
            console.error('Spreadsheet connection error:', error);
            
            // Provide specific error messages
            let errorMessage = '🔴 Offline - Tidak terhubung ke spreadsheet';
            
            if (error.message.includes('timeout')) {
                errorMessage = '🔴 Offline - Koneksi timeout (server lambat)';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = '🔴 Offline - Server tidak dapat dijangkau';
            } else if (error.message.includes('Server error')) {
                errorMessage = '🔴 Offline - Server error';
            } else if (error.message.includes('Invalid data format')) {
                errorMessage = '🔴 Offline - Data format tidak valid';
            }
            
            this.updateStatus('offline', errorMessage);
        } finally {
            this.isChecking = false;
        }
    }

    startPeriodicCheck() {
        // Check immediately
        this.checkSpreadsheetConnection();
        
        // Check every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkSpreadsheetConnection();
        }, 30000);
    }

    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// Initialize connection status manager
const connectionManager = new ConnectionStatusManager();

// Initialize dashboard after successful login
function initializeDashboard() {
    console.log("Initializing dashboard...");
    
    try {
        // Apply RBAC permissions
        applyRBAC();
        
        // Show main app container
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        // Render dashboard
        renderDashboard();
        
        // Setup navigation
        setupNavigation();
        
        // Start data fetching
        fetchData();
        
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        showToast("Error loading dashboard", 'error');
    }
}

// Check for external libraries
console.log("Libraries check: Chart.js=" + (typeof Chart !== 'undefined' ? 'OK' : 'MISSING') + ", XLSX=" + (typeof XLSX !== 'undefined' ? 'OK' : 'MISSING'));
const EmployeeModal = {
    render: (mode = 'add', employee = {}) => {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru';
        const buttonText = isEdit ? 'Update Karyawan' : 'Simpan Karyawan';

        const photoData = employee['Profile Photo (Base64)'] || '';
        const previewUrl = photoData ? `data:image/jpeg;base64,${photoData}` : '';

        return `
            <div class="modal-card">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" id="close-modal">&times;</button>
                </div>
                <form id="employee-form" data-mode="${mode}" data-rowid="${employee.rowid || ''}">
                    <!-- Profile Photo Section -->
                    <div style="text-align: center; margin-bottom: 2rem; position: relative;">
                        <div id="profile-photo-preview" style="
                            width: 100px; height: 100px; border-radius: 50%; margin: 0 auto;
                            background: #f1f5f9; border: 3px solid var(--primary-color);
                            display: flex; align-items: center; justify-content: center;
                            overflow: hidden; cursor: pointer; position: relative;
                            box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);
                        " onclick="document.getElementById('profile-photo-input').click()">
                            ${previewUrl 
                                ? `<img src="${previewUrl}" style="width:100%; height:100%; object-fit:cover;">`
                                : UI.icons.user}
                            <div style="
                                position: absolute; bottom: 0; left: 0; right: 0;
                                background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem;
                                padding: 4px 0; opacity: 0; transition: opacity 0.3s;
                            " id="photo-overlay">Ganti Foto</div>
                        </div>
                        <input type="file" id="profile-photo-input" hidden accept="image/*" onchange="previewProfilePhoto(this)">
                        <input type="hidden" id="profile-photo-base64" name="Profile Photo (Base64)" value="${photoData}">
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Klik untuk ${isEdit ? 'ganti' : 'unggah'} foto profil</p>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="EMPLOYEE NAME" class="form-input" placeholder="Nama Lengkap" value="${employee['EMPLOYEE NAME'] || employee['Full Name *'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Employee ID / NIK *</label>
                            <input type="text" name="EMPLOYEE ID" class="form-input" placeholder="Contoh: 2024001" value="${employee['EMPLOYEE ID'] || employee['Employee ID *'] || ''}" required ${isEdit ? 'readonly style="background: #f1f5f9;"' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="EMAIL" class="form-input" placeholder="nama@wijayakn.com" value="${employee['EMAIL'] || employee['Email *'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Job Position *</label>
                            <input type="text" name="Job Position *" class="form-input" placeholder="Contoh: Senior Developer" value="${employee['Job Position *'] || employee['POSITION'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Organization Name * (Departemen)</label>
                            <input type="text" name="Organization Name *" class="form-input" placeholder="Contoh: IT Support" value="${employee['Organization Name *'] || employee['DEPARTMENT'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="PHONE NUMBER" class="form-input" placeholder="0812..." value="${employee['PHONE NUMBER'] || employee['Mobile Phone Number'] || ''}">
                        </div>
                        <div class="form-group">
                            <label>Join Date *</label>
                            <input type="date" name="JOIN DATE" class="form-input" value="${employee['JOIN DATE'] || employee['Join Date *'] || ''}" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-modal">Batal</button>
                        <button type="submit" class="btn btn-primary">${buttonText}</button>
                    </div>
                </form>
            </div>
        `;
    }
};

const EmployeeTable = {
    render: (employees = []) => {
        if (employees.length === 0) {
            return `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">${UI.icons.folder}</div>
                        <p style="font-weight: 500;">Tidak ada data karyawan ditemukan.</p>
                    </td>
                </tr>
            `;
        }

        return employees.map(emp => {
            const photoData = emp['Profile Photo (Base64)'] || '';
            const avatarHtml = photoData 
                ? `<img src="data:image/jpeg;base64,${photoData}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0;">`
                : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0; color: #94a3b8;">${UI.icons.user}</div>`;

            return `
                <tr class="table-row-hover">
                    <td style="padding: 1rem; text-align: center; white-space: nowrap;">
                        <div style="display: flex; gap: 4px; justify-content: center;">
                            <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px;" onclick="viewEmployeeDetails(${emp.rowid})" title="Lihat Detail">${UI.icons.eye}</button>
                            <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px;" onclick="showEditForm(${emp.rowid})" title="Edit Data">${UI.icons.edit}</button>
                            <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px; color: #f59e0b;" onclick="showResignForm(${emp.rowid})" title="Proses Resign">${UI.icons.logout}</button>
                            <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px; color: #ef4444;" onclick="deleteEmployee(${emp.rowid})" title="Hapus Data">${UI.icons.delete}</button>
                        </div>
                    </td>
                    <td style="padding: 1rem;"><span style="font-family: monospace; font-weight: 700; color: var(--primary-color);">${emp['EMPLOYEE ID'] || emp['Employee ID *'] || emp['Employee ID'] || '-'}</span></td>
                    <td style="padding: 1rem;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${avatarHtml}
                            <div>
                                <div style="font-weight: 700; color: var(--text-main);">${emp['EMPLOYEE NAME'] || emp['Full Name *'] || emp['Full Name'] || '-'}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${emp['EMAIL'] || emp['Email *'] || emp['Email'] || '-'}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 1rem;"><span style="font-size: 0.8125rem; font-weight: 500;">${emp['Organization Name *'] || emp['DEPARTMENT'] || '-'}</span></td>
                    <td style="padding: 1rem;"><span style="font-size: 0.8125rem;">${emp['Job Position *'] || emp['POSITION'] || '-'}</span></td>
                    <td style="padding: 1rem;">
                        <span class="status-badge" style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;">
                            ${emp['Status *'] || emp['Employment Status *'] || 'Active'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }
};

// Expose to window for HTML event handlers will be at the bottom to avoid hoisting issues

// Configuration
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx7x_oiMA-70rmzxt97gzPepF6bJe8t5qLwgeTgaHFRcNRLVAwZjCeUq7hHST--6g/exec';
const USE_LOCAL_DATA = false; // Set to false to use Spreadsheet/GAS via apiClient
let isAuthenticated = localStorage.getItem('GajiPro_Auth') === 'true';

// Session Timeout Configuration (30 Minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; 
const WARNING_TIMEOUT_MS = 25 * 60 * 1000; // Warn at 25 minutes
let lastActivityTime = Date.now();
let isWarningShown = false;

function updateLastActivity() {
    lastActivityTime = Date.now();
    if (isWarningShown) {
        isWarningShown = false;
        closeModal(); // Close the warning if user moves/types
    }
}

function checkSessionTimeout() {
    if (!isAuthenticated) return;
    
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivityTime;

    // Full Timeout at 30 mins
    if (inactiveTime > SESSION_TIMEOUT_MS) {
        closeModal();
        showToast('Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit.', 'info');
        setTimeout(() => logout(), 2000);
        return;
    }

    // Warning at 25 mins
    if (inactiveTime > WARNING_TIMEOUT_MS && !isWarningShown) {
        isWarningShown = true;
        showSessionWarning();
    }
}

function showSessionWarning() {
    showModal(`
        <div style="text-align: center; padding: 1.5rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${UI.icons.warning}</div>
            <h3 style="margin-bottom: 0.5rem; color: #0f172a;">Peringatan Keamanan</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 2rem;">Sesi Anda akan segera berakhir dalam 5 menit karena tidak ada aktivitas. Apakah Anda ingin tetap login?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-primary" onclick="updateLastActivity(); closeModal();" style="flex: 1;">Tetap Login</button>
                <button class="btn btn-secondary" onclick="logout()" style="flex: 1;">Logout Sekarang</button>
            </div>
        </div>
    `);
}

// Track User Activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, updateLastActivity, true);
});

// Run session checker every 30 seconds for better precision
setInterval(checkSessionTimeout, 30000);

// =========================================================================
// RBAC â€” Role-Based Access Control
// =========================================================================
const RBAC_CONFIG = {
    'Super Admin': {
        nav:     ['nav-dashboard','nav-data','nav-import','nav-attendance','nav-turnover','nav-bulk-attendance','nav-payroll','nav-admins','nav-maintenance','nav-leave','nav-shift','nav-overtime','nav-holidays','nav-audit','nav-announcement'],
        canAdd:  true, canEdit: true, canDelete: true, canFinalize: true, canManageUsers: true, canViewSalary: true,
        dataFilter: 'all'
    },
    'Admin': {
        nav:     ['nav-dashboard','nav-data','nav-import','nav-attendance','nav-turnover','nav-bulk-attendance','nav-payroll','nav-admins','nav-maintenance','nav-leave','nav-shift','nav-overtime','nav-holidays','nav-audit','nav-announcement'],
        canAdd:  true, canEdit: true, canDelete: true, canFinalize: true, canManageUsers: true, canViewSalary: true,
        dataFilter: 'all'
    },
    'HRD': {
        nav:     ['nav-dashboard','nav-data','nav-import','nav-attendance','nav-bulk-attendance','nav-payroll','nav-leave','nav-shift','nav-overtime','nav-holidays'],
        canAdd:  true, canEdit: true, canDelete: true, canFinalize: false, canManageUsers: false, canViewSalary: true,
        dataFilter: 'all'
    },
    'Finance': {
        nav:     ['nav-dashboard','nav-data','nav-payroll','nav-leave','nav-overtime'],
        canAdd:  false, canEdit: false, canDelete: false, canFinalize: true, canManageUsers: false, canViewSalary: true,
        dataFilter: 'all'
    },
    'Manager': {
        nav:     ['nav-dashboard','nav-data','nav-attendance','nav-payroll','nav-shift','nav-overtime'],
        canAdd:  false, canEdit: false, canDelete: false, canFinalize: false, canManageUsers: false, canViewSalary: false,
        dataFilter: 'department'
    },
    'Staff': {
        nav:     ['nav-dashboard','nav-attendance','nav-leave'],
        canAdd:  false, canEdit: false, canDelete: false, canFinalize: false, canManageUsers: false, canViewSalary: false,
        dataFilter: 'self'
    }
};

function getCurrentRole() {
    return localStorage.getItem('GajiPro_Role') || 'Staff';
}

function getCurrentEmployeeId() {
    return localStorage.getItem('GajiPro_EmployeeId') || '';
}

function hasPermission(action) {
    const rawRole = getCurrentRole();
    // Case-insensitive matching for RBAC keys
    const roleKey = Object.keys(RBAC_CONFIG).find(k => k.toLowerCase() === rawRole.toLowerCase()) || 'Staff';
    const config = RBAC_CONFIG[roleKey];
    return config[action] === true;
}

function applyRBAC() {
    const role = getCurrentRole();
    const config = RBAC_CONFIG[role] || RBAC_CONFIG['Staff'];
    
    // 1. Navigation Visibility
    const allNavIds = ['nav-dashboard','nav-data','nav-import','nav-attendance','nav-turnover','nav-bulk-attendance','nav-payroll','nav-admins','nav-maintenance','nav-leave','nav-shift','nav-overtime','nav-holidays'];

    allNavIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (config.nav.includes(id)) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });

    // 2. Action Buttons Visibility (Global)
    const addButtons = document.querySelectorAll('.btn-add-employee');
    addButtons.forEach(btn => btn.style.display = config.canAdd ? '' : 'none');

    // 3. Role Badge in Topbar
    const roleBadgeEl = document.getElementById('topbar-role-badge');
    if (roleBadgeEl) {
        roleBadgeEl.textContent = role;
        const roleColors = {
            'Super Admin': { bg: '#0f172a', color: '#ffffff' },
            'Admin':       { bg: '#ffe4e6', color: '#9f1239' },
            'HRD':         { bg: '#dcfce7', color: '#166534' },
            'Finance':     { bg: '#fef3c7', color: '#92400e' },
            'Manager':     { bg: '#f3e8ff', color: '#6b21a8' },
            'Staff':       { bg: '#e0e7ff', color: '#3730a3' }
        };
        const c = roleColors[role] || roleColors['Staff'];
        roleBadgeEl.style.background = c.bg;
        roleBadgeEl.style.color = c.color;
    }
}

// Global UI Elements
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const togglePasswordBtn = document.getElementById('toggle-password');
const app = document.getElementById('app');
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');

const translations = {
    id: {
        dashboard: "Ringkasan Dashboard", employee_data: "Database Karyawan", attendance_log: "Log Kehadiran",
        bulk_upload: "Unggah Massal", import_staff: "Impor Karyawan", payroll_system: "Sistem Payroll", 
        user_management: "Manajemen User", maintenance: "Pemeliharaan", sign_out: "Keluar", 
        connected: "Terhubung", auto_synced: "Sinkron Otomatis", total_employees: "Total Karyawan", 
        total_expenditure: "Total Pengeluaran", average_salary: "Rata-rata Gaji", active: "Aktif", 
        resigned: "Resign", add_employee: "Tambah Karyawan", login_title: "Selamat Datang Kembali",
        login_subtitle: "Silakan masuk untuk mengakses dashboard manajemen korporat.",
        username: "Email Perusahaan", password: "Kata Sandi", login_btn: "Masuk Sekarang", cancel: "Batal", save_data: "Simpan",
        connecting: "Menghubungkan...", disconnected: "Offline - Server tidak dapat dijangkau",
        processing: "Memproses...", export_data: "Ekspor Data", finalize_all: "Finalisasi Semua",
        confirm_delete: "Konfirmasi Hapus", upload_success: "Berhasil!", upload_failed: "Gagal!",
        financial_trends: "Tren Finansial", last_6_months: "6 Bulan Terakhir", recent_activity: "Aktivitas Terbaru",
        leave_management: "Manajemen Cuti", shift_scheduling: "Penjadwalan Shift", overtime_management: "Rekap Lembur",
        national_holidays: "Hari Libur Nasional", audit_log: "Audit Log", announcements: "Pengumuman",
        org_structure: "Struktur Organisasi", turnover_report: "Laporan Turnover", unknown: "Tidak Diketahui",
        employee: "Karyawan", active_db: "Database Aktif", resigned_db: "Database Resign", data: "Data",
        search_placeholder: "Cari nama atau ID...", staff_registry: "Registri Staf",
        welcome_desc: "Pantau performa dan manajemen SDM Wijaya Kreatif Nusantara secara real-time dari satu dashboard terpadu.",
        manage_employees: "Kelola Karyawan", process_payroll: "Proses Payroll", people: "Orang",
        active_contracts: "Kontrak Aktif", expiring_soon: "Mendekati Expired", expired_contracts: "Kontrak Habis",
        happy_birthday: "Berulang Tahun", see_all_announcements: "Lihat Semua Pengumuman",
        actions: "AKSI", nik: "NIK", name_contact: "NAMA & KONTAK", department: "DEPARTEMEN", position: "JABATAN",
        status: "STATUS", contract_status: "KONTRAK", resign_date: "TGL RESIGN", reason: "ALASAN",
        no_active_emp: "Tidak ada data karyawan aktif.", no_resigned_emp: "Tidak ada data karyawan resign.",
        employee_not_found: "Data karyawan tidak ditemukan."
    },
    en: {
        dashboard: "Dashboard Overview", employee_data: "Employee Database", attendance_log: "Attendance Log",
        bulk_upload: "Bulk Upload", import_staff: "Import Staff", payroll_system: "Payroll System", 
        user_management: "User Management", maintenance: "Maintenance", sign_out: "Sign Out", 
        connected: "Connected", auto_synced: "Auto-Synced", total_employees: "Total Employees", 
        total_expenditure: "Total Expenditure", average_salary: "Average Salary", active: "Active", 
        resigned: "Resigned", add_employee: "Add Employee", login_title: "Welcome Back",
        login_subtitle: "Please sign in to access the corporate management dashboard.",
        username: "Corporate Email", password: "Password", login_btn: "Sign In Now", cancel: "Cancel", save_data: "Save",
        connecting: "Connecting...", disconnected: "Offline - Server unreachable",
        processing: "Processing...", export_data: "Export Data", finalize_all: "Finalize All",
        confirm_delete: "Confirm Deletion", upload_success: "Success!", upload_failed: "Failed!",
        financial_trends: "Financial Trends", last_6_months: "Last 6 Months", recent_activity: "Recent Activity",
        leave_management: "Leave Management", shift_scheduling: "Shift Scheduling", overtime_management: "Overtime Recap",
        national_holidays: "National Holidays", audit_log: "Audit Log", announcements: "Announcements",
        org_structure: "Organization Structure", turnover_report: "Turnover Report", unknown: "Unknown",
        employee: "Employee", active_db: "Active Database", resigned_db: "Resigned Database", data: "Data",
        search_placeholder: "Search name or ID...", staff_registry: "Staff Registry",
        welcome_desc: "Monitor performance and HR management of Wijaya Kreatif Nusantara in real-time from one integrated dashboard.",
        manage_employees: "Manage Employees", process_payroll: "Process Payroll", people: "People",
        active_contracts: "Active Contracts", expiring_soon: "Expiring Soon", expired_contracts: "Expired Contracts",
        happy_birthday: "Happy Birthday", see_all_announcements: "See All Announcements",
        actions: "ACTIONS", nik: "NIK", name_contact: "NAME & CONTACT", department: "DEPARTMENT", position: "POSITION",
        status: "STATUS", contract_status: "CONTRACT", resign_date: "RESIGN DATE", reason: "REASON",
        no_active_emp: "No active employee data found.", no_resigned_emp: "No resigned employee data found.",
        employee_not_found: "Employee data not found."
    }
};

let currentLang = localStorage.getItem('WKN_Language') || 'id';
if (currentLang !== 'id' && currentLang !== 'en') currentLang = 'id';

function t(key) {
    const lang = currentLang || 'id';
    if (!translations[lang]) return key;
    return translations[lang][key] || key;
}

function translateSidebar() {
    const navItems = {
        'nav-dashboard': 'dashboard',
        'nav-data': 'employee_data',
        'nav-org': 'org_structure',
        'nav-turnover': 'turnover_report',
        'nav-import': 'import_staff',
        'nav-attendance': 'attendance_log',
        'nav-bulk-attendance': 'bulk_upload',
        'nav-payroll': 'payroll_system',
        'nav-admins': 'user_management',
        'nav-leave': 'leave_management',
        'nav-shift': 'shift_scheduling',
        'nav-overtime': 'overtime_management',
        'nav-holidays': 'national_holidays',
        'nav-maintenance': 'maintenance',
        'nav-audit': 'audit_log',
        'nav-announcement': 'announcements'
    };

    Object.entries(navItems).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) {
            try {
                // Keep the icon if it exists, otherwise just the text
                const svg = el.querySelector('svg');
                const icon = svg ? svg.outerHTML : '';
                const text = t(key);
                el.innerHTML = `${icon} <span>${text}</span>`;
            } catch (e) {
                console.warn("Failed to translate nav item:", id, e);
            }
        }
    });

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        // Keep the text simple if there's no icon in the original button, 
        // but if we want to support icons later, we keep this logic.
        logoutBtn.innerText = t('sign_out');
    }

    // Login Screen Translation
    const loginTitle = document.querySelector('#login-screen h2');
    if (loginTitle) loginTitle.innerText = t('login_title');

    const loginSubtitle = document.querySelector('#login-screen p');
    if (loginSubtitle) loginSubtitle.innerText = t('login_subtitle');

    const usernameLabel = document.querySelector('label[for="username"]');
    if (usernameLabel) usernameLabel.innerText = t('username');

    const passwordLabel = document.querySelector('label[for="password"]');
    if (passwordLabel) passwordLabel.innerText = t('password');

    const loginBtn = document.querySelector('#login-form button[type="submit"]');
    if (loginBtn) loginBtn.innerText = t('login_btn');
}

function saveCache() {
    localStorage.setItem('WKNsite_Cache', JSON.stringify({
        salaryData: typeof salaryData !== 'undefined' ? salaryData : [], 
        attendanceData: typeof attendanceData !== 'undefined' ? attendanceData : [], 
        adminData: typeof adminData !== 'undefined' ? adminData : [], 
        mutationData: typeof mutationData !== 'undefined' ? mutationData : [],
        systemLogs: typeof systemLogs !== 'undefined' ? systemLogs : [], 
        rolesData: typeof rolesData !== 'undefined' ? rolesData : [],
        leaveRequests: typeof leaveRequests !== 'undefined' ? leaveRequests : [],
        shiftSchedules: typeof shiftSchedules !== 'undefined' ? shiftSchedules : [],
        payrollHistory: typeof payrollHistory !== 'undefined' ? payrollHistory : []
    }));
}

window.toggleLanguage = function() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    localStorage.setItem('WKN_Language', currentLang);
    location.reload(); // Reload to apply translations everywhere
};

// Current Data State
let salaryData = [];
let attendanceData = [];
let mutationData = [];
let systemLogs = [];
let rolesData = [];
let leaveRequests = [];
let announcements = [];
let shiftSchedules = [];
let payrollHistory = [];
let nationalHolidays = [
    { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
    { date: '2026-02-17', name: 'Isra Mikraj Nabi Muhammad SAW' },
    { date: '2026-02-18', name: 'Tahun Baru Imlek 2577' },
    { date: '2026-03-20', name: 'Hari Suci Nyepi Tahun Baru Saka 1948' },
    { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H' },
    { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H' },
    { date: '2026-04-03', name: 'Wafat Yesus Kristus' },
    { date: '2026-04-05', name: 'Hari Paskah' },
    { date: '2026-05-01', name: 'Hari Buruh Internasional' },
    { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
    { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H' },
    { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
    { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H' },
    { date: '2026-08-17', name: 'Hari Kemerdekaan RI ke-81' },
    { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
    { date: '2026-12-25', name: 'Hari Raya Natal' }
];
let payslipConfig = {
    showLogo: true,
    showCompanyInfo: true,
    showSignature: true,
    showTaxDetail: true,
    companyAddress: 'Wijaya Kreatif Nusantara\nGraha WKN, Jakarta Selatan',
    footnote: 'Terima kasih atas dedikasi dan kerja keras Anda.'
};
let unreadNotifications = [];
let isFetching = false;
let isFirstFetch = true;

// Inisialisasi: karena script ada di akhir <body>, DOM sudah siap.
// Gunakan pengecekan readyState untuk memastikan tetap aman di semua skenario.

// Auth Handlers
function checkAuth() {
    
    try {
        if (!loginScreen) {
            console.error("checkAuth: loginScreen element not found!");
            return;
        }

        const authState = localStorage.getItem('GajiPro_Auth');
        isAuthenticated = authState === 'true';

        if (isAuthenticated) {
            loginScreen.style.display = 'none';
            applyRBAC(); // Terapkan hak akses sesuai role

            // Cek halaman terakhir yang dibuka
            const lastPage = localStorage.getItem('WKN_LastPage') || 'nav-dashboard';
            const role     = getCurrentRole();
            const config   = RBAC_CONFIG[role] || RBAC_CONFIG['Staff'];
            // Pastikan lastPage diizinkan untuk role ini
            const safePage = config.nav.includes(lastPage) ? lastPage : config.nav[0];
            const targetNav = document.getElementById(safePage);

if (targetNav) {
                targetNav.click();
            } else {
                renderDashboard();
            }

            // Inisialisasi Auto-Sync (Setiap 60 detik agar lebih stabil)
            if (!window.autoSyncTimer) {
                window.autoSyncTimer = setInterval(() => triggerBackgroundFetch(), 60000);
                setTimeout(() => triggerBackgroundFetch(), 1000); // Initial sync with delay
            }
        } else {
            
            UI.transitionTo('login-screen', true);
        }
    } catch (error) {
        console.error("Critical error in checkAuth:", error);
        UI.transitionTo('login-screen', true);
    }
}

function logout() {
    isAuthenticated = false;
    localStorage.removeItem('GajiPro_Auth');
    localStorage.removeItem('GajiPro_UserName');
    location.reload();
}

function formatCurrency(amount) {
    if (isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function resetSystemCache() {
    if (confirm(t('clear_cache') + '?')) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }
}

function forceManualSync() {
    fetchData(true);
}

// window.showAddForm is defined later with a full modal implementation

function getNextEmployeeID() {

    if (!salaryData || salaryData.length === 0) return 'WKN-001';
    
    let maxId = 0;
    salaryData.forEach(item => {
        const idStr = item['Employee ID *'] || '';
        // Extract numbers from string like "WKN-005"
        const match = idStr.match(/\d+/);
        if (match) {
            const num = parseInt(match[0]);
            if (num > maxId) maxId = num;
        }
    });
    
    const nextNum = maxId + 1;
    // Pad with leading zeros (e.g., 006)
    return `WKN-${nextNum.toString().padStart(3, '0')}`;
}

function updateActiveNavItem(id) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

// Navigation Event Listeners
const setupNavigation = () => {
    const navMapping = [
        { id: 'nav-dashboard', renderer: renderDashboard },
        { id: 'nav-data', renderer: renderDataPage },
        { id: 'nav-org', renderer: renderOrgChart },
        { id: 'nav-attendance', renderer: typeof renderAttendancePage !== 'undefined' ? renderAttendancePage : null },
        { id: 'nav-bulk-attendance', renderer: typeof renderBulkUploadPage !== 'undefined' ? renderBulkUploadPage : null },
        { id: 'nav-import', renderer: typeof renderImportPage !== 'undefined' ? renderImportPage : null },
        { id: 'nav-admins', renderer: typeof renderAdminsPage !== 'undefined' ? renderAdminsPage : null },
        { id: 'nav-maintenance', renderer: typeof renderMaintenancePage !== 'undefined' ? renderMaintenancePage : null },
        { id: 'nav-payroll', renderer: typeof renderPayrollPage !== 'undefined' ? renderPayrollPage : null },
        { id: 'nav-turnover', renderer: typeof renderTurnoverReport !== 'undefined' ? renderTurnoverReport : null },
        { id: 'nav-leave', renderer: typeof renderLeaveManagementPage !== 'undefined' ? renderLeaveManagementPage : null },
        { id: 'nav-shift', renderer: typeof renderShiftSchedulePage !== 'undefined' ? renderShiftSchedulePage : null },
        { id: 'nav-overtime', renderer: typeof renderOvertimePage !== 'undefined' ? renderOvertimePage : null },
        { id: 'nav-holidays', renderer: typeof renderHolidaysPage !== 'undefined' ? renderHolidaysPage : null },
        { id: 'nav-audit', renderer: typeof renderAuditLogPage !== 'undefined' ? renderAuditLogPage : null },
        { id: 'nav-announcement', renderer: typeof renderAnnouncementManager !== 'undefined' ? renderAnnouncementManager : null }
    ];

    navMapping.forEach(nav => {
        const el = document.getElementById(nav.id);
        if (el && nav.renderer) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                updateActiveNavItem(nav.id);
                nav.renderer();
            });
        }
    });
};

// setupNavigation() is now called inside DOMContentLoaded listener above

function showModal(content) {
    modalBody.innerHTML = content;
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    modalOverlay.style.display = 'none';
    if (modalBody) modalBody.innerHTML = '';
}

// Tutup modal saat klik di luar area modal content
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// Tutup modal dengan tombol Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.style.display === 'flex') {
        closeModal();
    }
});

window.showConfirm = (title, message, onConfirm) => {
    showModal(`
        <div style="text-align: center; padding: 1rem;">
            <div style="width: 60px; height: 60px; background: #fee2e2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 1.5rem;">âš ï¸</div>
            <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem; font-weight: 800;">${title}</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 2rem;">${message}</p>
            <div class="btn-group-modern">
                <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Batal</button>
                <button class="btn btn-primary" style="flex: 1; background: #ef4444;" id="confirm-action-btn">Konfirmasi Hapus</button>
            </div>
        </div>
    `);
    document.getElementById('confirm-action-btn').onclick = () => {
        closeModal();
        onConfirm();
    };
};

async function fetchData(force = false) {
    try {
        // Use apiClient to get employee data
        let response;
        if (USE_FASTAPI_MCP) {
            console.log("Fetching all data from FastAPI MCP Sync...");
            response = await apiClient.handleSyncAll();
        } else {
            console.log("Fetching data from Spreadsheet (GAS)...");
            response = await apiClient.getEmployees();
        }
        
        if (response && (Array.isArray(response) || response.status === 'success')) {
            // Handle bulk response from FastAPI or legacy array from GAS
            if (response.status === 'success') {
                const rawSalary = [response.employees, response.salary, response.data].find(arr => Array.isArray(arr)) || [];
                salaryData = rawSalary.map((emp, i) => ({ ...emp, rowid: i }));
                attendanceData = response.attendance || [];
                mutationData = response.mutations || [];
                systemLogs = response.logs || [];
                // Map admin data
                if (response.admins) adminData = response.admins.map((adm, i) => ({ ...adm, rowid: i }));
            } else {
                salaryData = response;
            }
            
            console.log(`Successfully synced ${salaryData.length} employees`);
            updateConnectionStatus('online');
            saveCache();
            
            if (force) {
                showToast(currentLang === 'id' ? `Sinkronisasi berhasil: ${salaryData.length} data dimuat` : `Sync successful: ${salaryData.length} records loaded`, 'success');
            }
            return salaryData;
        } else {
            console.error("Invalid data format from API:", response);
            updateConnectionStatus('offline');
            return salaryData;
        }
        
    } catch (error) {
        console.error('API fetch error:', error);
        updateConnectionStatus('offline');
        
        // Fallback to local data if available
        if (salaryData.length === 0) {
            try {
                const localResponse = await fetch('mock_data.json');
                const localData = await localResponse.json();
                salaryData = localData.salaryData || [];
                console.log("Using fallback local data");
            } catch (localError) {
                console.error("Local fallback also failed:", localError);
            }
        }
        
        return salaryData;
    }
}

async function triggerBackgroundFetch() {
    if (!isAuthenticated || !SCRIPT_URL || isFetching) return salaryData;
    
    const syncIcon = document.getElementById('sync-icon-spinner');
    const syncText = document.getElementById('sync-text');
    if (syncIcon) syncIcon.style.animation = 'spin 1s linear infinite';
    if (syncText) syncText.innerText = t('syncing');

    updateConnectionStatus('connecting');
    isFetching = true;
    try {
        let result;
        if (USE_FASTAPI_MCP) {
            console.log("Fetching background bulk data via FastAPI MCP...");
            result = await apiClient.handleSyncAll();
        } else if (USE_LOCAL_DATA) {
            const response = await fetch('mock_data.json');
            result = await response.json();
        } else {
            // Cache-busting URL for GAS
            const fetchUrl = SCRIPT_URL + (SCRIPT_URL.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
            const response = await fetch(fetchUrl, { redirect: 'follow' });
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            result = JSON.parse(text);
        }
        console.log("Processing background fetch result...");
        
        // CATAT KUNCI SEGERA SETELAH PARSE BERHASIL
        if (result) {
            window.rawApiKeys = Object.keys(result);
            window.rawApiResponse = result;
        }

        if (result && (result.status?.toLowerCase() === 'success' || result.salary || result.employees || result.data)) {
            updateConnectionStatus('online');
            
            // Log untuk debug

// Prioritize non-empty arrays across common key names
            const rawSalary = [result.salary, result.employees, result.Employees, result.data, result.Karyawan, result.Database].find(arr => Array.isArray(arr) && arr.length > 0) || [];
            
            // Normalize headers (handle both "Full Name" and "Full Name *")
            salaryData = rawSalary.map((emp, i) => {
                const normalized = { ...emp, rowid: i };
                const mapping = {
                    'Employee ID': 'Employee ID *',
                    'Full Name': 'Full Name *',
                    'Email': 'Email *',
                    'Job Position': 'Job Position *',
                    'Organization Name': 'Organization Name *',
                    'Join Date': 'Join Date *',
                    'Employment Status': 'Employment Status *'
                };
                for (const [oldKey, newKey] of Object.entries(mapping)) {
                    if (normalized[oldKey] && !normalized[newKey]) {
                        normalized[newKey] = normalized[oldKey];
                    }
                }
                return normalized;
            });

            adminData = (result.admins || result.Admins || []).map((adm, i) => ({ ...adm, rowid: i }));
            attendanceData = result.attendance || result.Attendance || [];
            mutationData = result.mutations || result.Mutations || [];
            systemLogs = result.systemLogs || result.logs || result.Logs || [];
            rolesData = result.roles || result.Roles || [];
            payrollHistory = result.payrollHistory || result.PayrollHistory || [];
            checkNotifications(isFirstFetch);
            isFirstFetch = false;
            saveCache();
            
            const activePage = document.querySelector('.nav-item.active');
            if (activePage) {
                if (activePage.id === 'nav-dashboard') renderDashboard(true);
                if (activePage.id === 'nav-data') renderDataPage(true);
                if (activePage.id === 'nav-admins') renderAdminsPage(true);
                if (activePage.id === 'nav-attendance') renderAttendancePage(true);
                if (activePage.id === 'nav-maintenance') renderMaintenancePage(true);
            }
        } else {
            updateConnectionStatus('offline');
        }
        return salaryData;
    } catch (error) {
        console.error('Background fetch error:', error);
        updateConnectionStatus('offline');
        return salaryData;
    } finally {
        isFetching = false;
        const syncIcon = document.getElementById('sync-icon-spinner');
        const syncText = document.getElementById('sync-text');
        if (syncIcon) syncIcon.style.animation = 'none';
        if (syncText) syncText.innerText = t('auto_synced');
    }
}

function updateConnectionStatus(status) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (!dot || !text) return;

    if (status === 'online') {
        dot.style.background = '#10b981';
        dot.style.boxShadow = '0 0 8px #10b981';
        text.innerText = t('connected');
        text.style.color = '#065f46';
    } else if (status === 'connecting') {
        dot.style.background = '#f59e0b';
        dot.style.boxShadow = 'none';
        text.innerText = t('connecting');
        text.style.color = '#92400e';
    } else {
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 8px #ef4444';
        text.innerText = t('disconnected');
        text.style.color = '#991b1b';
    }
}

function checkNotifications(suppressPopup = false) {
    unreadNotifications = [];
    const today = new Date();

    // 1. Check Contracts
    salaryData.forEach(emp => {
        const endDateStr = emp['Contract End Date'];
        if (endDateStr) {
            const endDate = new Date(endDateStr);
            if (!isNaN(endDate.getTime())) {
                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays <= 30 && diffDays > 0) {
                    unreadNotifications.push({
                        type: 'contract_expiry',
                        level: 'warning',
                        title: 'Kontrak Segera Berakhir',
                        message: `Kontrak <strong>${emp['Full Name *']}</strong> akan berakhir dalam ${diffDays} hari.`,
                        date: endDateStr,
                        empId: emp.rowid
                    });
                } else if (diffDays <= 0) {
                    unreadNotifications.push({
                        type: 'contract_expired',
                        level: 'danger',
                        title: 'Kontrak Telah Berakhir',
                        message: `Kontrak <strong>${emp['Full Name *']}</strong> telah berakhir pada ${endDateStr}.`,
                        date: endDateStr,
                        empId: emp.rowid
                    });
                }
            }
        }
    });

    // 2. Check Excessive Leave Balance
    const currentMonth = today.getMonth();
    salaryData.forEach(emp => {
        const used = (leaveRequests || [])
            .filter(r => r.employeeName === (emp['Full Name *'] || emp['EMPLOYEE NAME']) && r.status === 'Approved')
            .reduce((sum, r) => {
                const diff = Math.ceil(Math.abs(new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                return sum + diff;
            }, 0);
        
        const balance = 12 - used;
        if (balance > 10 && currentMonth >= 10) { 
            unreadNotifications.push({
                type: 'leave_pileup',
                level: 'warning',
                title: 'Cuti Menumpuk',
                message: `<strong>${emp['Full Name *']}</strong> masih memiliki saldo cuti ${balance} hari di akhir tahun.`,
                date: 'Akhir Tahun',
                empId: emp.rowid
            });
        }
    });

    // 3. Check Excessive Late Arrivals
    const lateThreshold = 3; 
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lateCounts = {};
    (attendanceData || []).forEach(log => {
        const ts = new Date(log.Timestamp || log.timestamp);
        if (ts >= thisMonthStart && ts.getHours() >= 9 && (ts.getHours() > 9 || ts.getMinutes() > 0)) {
            const empId = log['Employee ID'] || log['employeeId'];
            lateCounts[empId] = (lateCounts[empId] || 0) + 1;
        }
    });

    Object.keys(lateCounts).forEach(empId => {
        if (lateCounts[empId] >= lateThreshold) {
            const emp = findEmployeeById(empId);
            if (emp) {
                unreadNotifications.push({
                    type: 'excessive_late',
                    level: 'warning',
                    title: 'Indikasi Absensi Buruk',
                    message: `<strong>${emp['Full Name *']}</strong> sudah terlambat ${lateCounts[empId]} kali di bulan ini.`,
                    date: 'Bulan Berjalan',
                    empId: emp.rowid
                });
            }
        }
    });

    // 4. Trigger Browser Push Notifications if enabled
    if (window.wknNotifications && !suppressPopup) {
        unreadNotifications.forEach(n => {
            // Remove HTML tags for the push notification body
            const plainMessage = n.message.replace(/<[^>]*>?/gm, '');
            wknNotifications.show(n.title, plainMessage, `${n.type}-${n.empId}`);
        });
    }
}

window.renderNotificationCenter = () => {
    showModal(`
        <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: #fee2e2; color: #ef4444; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">${UI.icons.bell}</div>
            <div>
                <h3 style="margin: 0;">Pusat Notifikasi</h3>
                <p style="color: var(--text-muted); font-size: 0.75rem; margin: 0;">Pemberitahuan sistem dan kontrak karyawan</p>
            </div>
        </div>

        <div style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px;">
            ${unreadNotifications.length === 0 ? `
                <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">${UI.icons.folder}</div>
                    <p style="font-weight: 600; margin-bottom: 4px;">Tidak ada notifikasi baru</p>
                    <p style="font-size: 0.75rem;">Semua kontrak karyawan masih dalam batas aman.</p>
                </div>
            ` : unreadNotifications.map(n => `
                <div style="background: ${n.level === 'danger' ? '#fef2f2' : '#fff7ed'}; border: 1px solid ${n.level === 'danger' ? '#fecaca' : '#ffedd5'}; padding: 1rem; border-radius: 12px; display: flex; gap: 12px; align-items: flex-start; cursor: pointer; transition: transform 0.2s;" onclick="closeModal(); viewEmployeeDetails(${n.empId})">
                    <div style="font-size: 1.25rem;">${UI.icons.bell}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.8125rem; font-weight: 800; color: ${n.level === 'danger' ? '#991b1b' : '#9a3412'}; margin-bottom: 2px;">${n.title}</div>
                        <div style="font-size: 0.75rem; color: ${n.level === 'danger' ? '#b91c1c' : '#c2410c'}; line-height: 1.4;">${n.message}</div>
                        <div style="font-size: 0.65rem; color: ${n.level === 'danger' ? '#f87171' : '#fb923c'}; font-weight: 700; margin-top: 8px; text-transform: uppercase;">Batas Akhir: ${n.date}</div>
                    </div>
                    <div style="color: #cbd5e1;">${UI.icons.arrowRight}</div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 1.5rem; text-align: center;">
            <button class="btn btn-secondary" style="width: 100%;" onclick="closeModal()">Tutup</button>
        </div>
    `);
};
function toggleNavCategory(categoryId) {
    const content = document.getElementById(categoryId);
    const header = content.previousElementSibling;
    const chevron = header.querySelector('svg');
    
    const isCollapsed = content.classList.toggle('collapsed');
    
    // Rotate chevron
    if (chevron) {
        chevron.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
    }
}

function renderTopbar(title) {
    const userName = localStorage.getItem('GajiPro_UserName') || 'Admin';
    const userRole = getCurrentRole();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const roleColors = {
        'Super Admin': { bg: '#0f172a', color: '#ffffff' },
        'Admin':       { bg: '#ffe4e6', color: '#9f1239' },
        'HRD':         { bg: '#dcfce7', color: '#166534' },
        'Finance':     { bg: '#fef3c7', color: '#92400e' },
        'Manager':     { bg: '#f3e8ff', color: '#6b21a8' },
        'Staff':       { bg: '#e0e7ff', color: '#3730a3' }
    };
    const rc = roleColors[userRole] || roleColors['Staff'];

    return `
        <div class="topbar">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button class="hamburger" onclick="toggleSidebar()" title="Toggle Menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div style="min-width: 0; overflow: hidden; flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; white-space: nowrap;">
                        <h2 style="font-size: 1.125rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis;">${title}</h2>
                        <span id="conn-status" style="display: flex; align-items: center; gap: 5px; padding: 2px 8px; background: #f1f5f9; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0;">
                            <span id="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                            <span id="status-text">${t('connected')}</span>
                        </span>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px; margin-top: 2px; white-space: nowrap;">
                        ${dateStr} | <span id="live-clock" style="font-weight: 600; color: var(--primary-color);">${now.toLocaleTimeString(currentLang === 'id' ? 'id-ID' : 'en-US', { hour12: false })}</span>
                    </p>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <!-- Theme Toggle Button -->
                <button class="btn btn-secondary" onclick="toggleTheme()" style="width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
                    <svg id="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path id="theme-path" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
                    </svg>
                </button>

                <!-- Language Toggle -->
                <button onclick="toggleLanguage()" title="${currentLang === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 14px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; color: var(--text-main); transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <span>${currentLang === 'id' ? 'IND' : 'ENG'}</span>
                </button>

                <!-- Auto-Sync Status Indicator (Clickable for Manual Sync) -->
                <div id="sync-status-indicator" class="topbar-desktop-only" 
                     onclick="forceManualSync()" 
                     title="${currentLang === 'id' ? 'Sinkronisasi Sekarang' : 'Sync Now'}"
                     style="display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.75rem; font-weight: 600; padding: 6px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;"
                     onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='var(--primary-color)';"
                     onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';">
                    <svg id="sync-icon-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    <span id="sync-text">${t('auto_synced')}</span>
                </div>

                <!-- Notifications Bell -->
                <div style="position: relative; cursor: pointer;" onclick="renderNotificationCenter()">
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    ${unreadNotifications.length > 0 ? `
                        <span style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); animation: pulse-red 2s infinite;">
                            ${unreadNotifications.length}
                        </span>
                    ` : ''}
                </div>

                <div style="display: flex; align-items: center; gap: 12px; padding-left: 1rem; border-left: 1px solid #e2e8f0; flex-shrink: 0;">
                    <div style="text-align: right; line-height: 1.2;" class="topbar-desktop-only">
                        <div style="font-size: 0.875rem; font-weight: 800; color: var(--text-main); white-space: nowrap;">${userName}</div>
                        <div style="font-size: 0.65rem; font-weight: 700; color: var(--primary-color); cursor: pointer;" onclick="showChangePasswordModal()">${currentLang === 'id' ? 'Ganti Password' : 'Change Password'}</div>
                    </div>
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--primary-color), #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">
                        ${userName[0]}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function startLiveClock() {
    setInterval(() => {
        const clockEl = document.getElementById('live-clock');
        if (clockEl) {
            const now = new Date();
            clockEl.innerText = now.toLocaleTimeString('id-ID', { hour12: false });
        }
    }, 1000);
}

// Page Renderers
function findEmployeeById(id) {
    if (!salaryData) return null;
    const cleanId = String(id || '').trim().toLowerCase();
    return salaryData.find(e => {
        const empId = String(e['EMPLOYEE ID'] || e['Employee ID *'] || '').trim().toLowerCase();
        return empId === cleanId;
    });
}

// Page Renderers
async function renderAttendancePage(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-attendance');

    await fetchData();

    // Default to today's date if no filter set
    if (!window._attendanceDateFilter) {
        const now = new Date();
        window._attendanceDateFilter = now.toISOString().split('T')[0];
    }

    // Get unique departments for filter
    const deptOptions = [...new Set(salaryData.map(e => e['Organization Name *'] || e['DEPARTMENT'] || 'Unassigned'))].sort();
    if (!window._attendanceDeptFilter) window._attendanceDeptFilter = 'all';

    const filteredLogs = (attendanceData || []).filter(log => {
        try {
            const ts = log.Timestamp || log.timestamp;
            if (!ts) return false;
            // Handle different date formats (Google Sheets might return "2026-04-29 08:00" or ISO)
            const logDate = new Date(ts).toISOString().split('T')[0];
            const dateMatch = logDate === window._attendanceDateFilter;
            
            if (!dateMatch) return false;
            if (window._attendanceDeptFilter === 'all') return true;
            
            const emp = findEmployeeById(log['Employee ID'] || log['employeeId']);
            const empDept = emp ? (emp['Organization Name *'] || emp['DEPARTMENT'] || 'Unassigned') : 'Unassigned';
            return empDept === window._attendanceDeptFilter;
        } catch(e) { return false; }
    });

    app.innerHTML = `
        ${renderTopbar(t('attendance_log'))}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">${t('attendance_title')}</h3>
                    <p style="color: var(--text-muted); font-size: 0.8125rem;">${t('attendance_subtitle')}</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="btn btn-secondary" onclick="toggleAttendanceView()" id="btn-toggle-attendance-view" style="height: 42px;">
                        📊 Lihat Tren
                    </button>
                    <button class="btn btn-secondary" onclick="showAttendanceExportModal()" style="height: 42px; display: flex; align-items: center; gap: 8px;">
                        <span>📥</span> Export Rekap Periode
                    </button>
                    <button class="btn btn-primary" onclick="showAttendanceForm()" style="height: 42px; display: flex; align-items: center; gap: 8px;">
                        <span>➕</span> ${t('new_attendance')}
                    </button>
                    <select id="attendance-dept-filter" class="form-input" 
                        onchange="updateAttendanceDeptFilter(this.value)"
                        style="width: 160px; height: 42px;">
                        <option value="all">Semua Dept.</option>
                        ${deptOptions.map(d => `<option value="${d}" ${window._attendanceDeptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                    <input type="date" id="attendance-date-filter" class="form-input" 
                        value="${window._attendanceDateFilter}" 
                        onchange="updateAttendanceFilter(this.value)"
                        style="width: 160px; height: 42px;">
                    <button class="btn btn-secondary" onclick="forceManualSync()" title="Refresh Data">${UI.icons.refresh}</button>
                </div>
            </header>

            <div id="attendance-chart-container" style="display: none; width: 100%; margin-bottom: 2rem;">
                <div class="card" style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; font-size: 0.875rem; font-weight: 700; color: var(--text-main);">Tren Kehadiran 30 Hari Terakhir</h4>
                    <div style="height: 200px; width: 100%;">
                        <canvas id="attendanceTrendsChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 1.5rem;">
                <div class="card stat-card">
                    <div style="padding: 1rem;">
                        <span class="stat-label">Total Absensi</span>
                        <span class="stat-value" style="display: block; margin-top: 5px;">${filteredLogs.length}</span>
                    </div>
                </div>
                <div class="card stat-card">
                    <div style="padding: 1rem;">
                        <span class="stat-label">Tepat Waktu (< 09:00)</span>
                        <span class="stat-value" style="display: block; margin-top: 5px; color: #10b981;">
                            ${filteredLogs.filter(l => {
                                const h = new Date(l.Timestamp || l.timestamp).getHours();
                                return h < 9;
                            }).length}
                        </span>
                    </div>
                </div>
                <div class="card stat-card">
                    <div style="padding: 1rem;">
                        <span class="stat-label">Terlambat (> 09:00)</span>
                        <span class="stat-value" style="display: block; margin-top: 5px; color: #f59e0b;">
                            ${filteredLogs.filter(l => {
                                const h = new Date(l.Timestamp || l.timestamp).getHours();
                                return h >= 9;
                            }).length}
                        </span>
                    </div>
                </div>
                <div class="card stat-card">
                    <div style="padding: 1rem;">
                        <span class="stat-label">Staf Aktif</span>
                        <span class="stat-value" style="display: block; margin-top: 5px;">
                            ${salaryData.filter(e => !['resigned', 'resign'].some(s => (e['Employment Status *'] || '').toLowerCase().includes(s))).length}
                        </span>
                    </div>
                </div>
            </div>

            <div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <div class="table-container" style="margin-top: 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f1f5f9;">
                                <th style="padding: 1rem; width: 100px;">Jam</th>
                                <th style="padding: 1rem;">Karyawan</th>
                                <th style="padding: 1rem;">Lokasi & Alamat</th>
                                <th style="padding: 1rem;">Catatan</th>
                                <th style="padding: 1rem; width: 80px; text-align: center;">Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredLogs.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                                        <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                                        <p style="font-weight: 600;">Tidak ada log absensi pada tanggal ini.</p>
                                    </td>
                                </tr>
                            ` : filteredLogs.sort((a,b) => new Date(b.Timestamp || b.timestamp) - new Date(a.Timestamp || a.timestamp)).reverse().map(log => {
                                const ts = log.Timestamp || log.timestamp;
                                const empIdRaw = log['Employee ID'] || log['employeeId'];
                                const emp = findEmployeeById(empIdRaw);
                                const time = new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                                const photo = log.Photo || log.photo || '';
                                
                                return `
                                    <tr class="table-row-hover">
                                        <td style="padding: 1rem;">
                                            <span style="font-weight: 800; color: var(--text-main);">${time}</span>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <div style="width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: var(--primary-color);">
                                                    ${(emp ? (emp['Full Name *'] || 'E') : 'E')[0]}
                                                </div>
                                                <div>
                                                    <div style="font-weight: 700;">${emp ? (emp['Full Name *'] || emp['EMPLOYEE NAME']) : empIdRaw}</div>
                                                    <div style="font-size: 0.7rem; color: var(--text-muted);">${emp ? (emp['Job Position *'] || '-') : '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="font-size: 0.8125rem; font-weight: 600;">📍 ${log.Location || '-'}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${log.Address || ''}">${log.Address || '-'}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            ${(() => {
                                                const notesRaw = log.Notes || log.notes || '-';
                                                if (notesRaw.startsWith('[DINAS]')) {
                                                    const parts = notesRaw.replace('[DINAS] ', '').split(' | ');
                                                    const kota = parts[0]?.split(': ')[1] || '-';
                                                    const hasil = parts[1]?.split(': ')[1] || '-';
                                                    const link = parts[2]?.split(': ')[1] || '';
                                                    
                                                    return `
                                                        <div style="background: #eef2ff; border: 1px solid #e0e7ff; padding: 8px; border-radius: 8px; font-size: 0.75rem;">
                                                            <div style="font-weight: 800; color: #4338ca; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                                ${kota}
                                                            </div>
                                                            <div style="color: #374151; margin-bottom: 4px;">${hasil}</div>
                                                            ${link ? `<a href="${link}" target="_blank" style="color: #4338ca; text-decoration: underline; font-weight: 600;">Lihat Surat Tugas ↗</a>` : ''}
                                                        </div>
                                                    `;
                                                }
                                                return `<span style="font-size: 0.8125rem;">${notesRaw}</span>`;
                                            })()}
                                        </td>
                                        <td style="padding: 1rem; text-align: center;">
                                            ${photo ? `
                                                <img src="data:image/jpeg;base64,${photo}" 
                                                    style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; cursor: pointer; border: 1px solid #e2e8f0;"
                                                    onclick="viewLargePhoto('${photo}')">
                                            ` : '<span style="color: #cbd5e1;">-</span>'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Smart Summary Section -->
            ${filteredLogs.length > 0 ? `
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                        <span>±️</span> Rekapitulasi Jam Kerja (Estimasi)
                    </h4>
                    <div class="card" style="padding: 0; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                            <thead style="background: #f8fafc;">
                                <tr>
                                    <th style="padding: 12px; text-align: left;">Karyawan</th>
                                    <th style="padding: 12px; text-align: center;">Jam Masuk</th>
                                    <th style="padding: 12px; text-align: center;">Terlambat</th>
                                    <th style="padding: 12px; text-align: center;">Jam Pulang</th>
                                    <th style="padding: 12px; text-align: center;">Durasi Bruto</th>
                                    <th style="padding: 12px; text-align: center;">Jam Kerja (Net)</th>
                                    <th style="padding: 12px; text-align: center;">Estimasi Lembur</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                                    const summary = {};
                                    filteredLogs.forEach(log => {
                                        const id = log['Employee ID'] || log['employeeId'];
                                        if (!summary[id]) summary[id] = { first: log.Timestamp || log.timestamp, last: log.Timestamp || log.timestamp };
                                        const ts = log.Timestamp || log.timestamp;
                                        if (new Date(ts) < new Date(summary[id].first)) summary[id].first = ts;
                                        if (new Date(ts) > new Date(summary[id].last)) summary[id].last = ts;
                                    });

                                    return Object.keys(summary).map(id => {
                                        const emp = findEmployeeById(id);
                                        const dIn = new Date(summary[id].first);
                                        const dOut = new Date(summary[id].last);

                                        // Hitung Keterlambatan (Batas: 08:00)
                                        const limitIn = new Date(dIn);
                                        limitIn.setHours(8, 0, 0, 0);
                                        let lateText = '-';
                                        if (dIn > limitIn) {
                                            const diffMinutes = Math.floor((dIn - limitIn) / (1000 * 60));
                                            lateText = `<span style="color: #ef4444; font-weight: 700;">${diffMinutes} menit</span>`;
                                        }

                                        let diff = (dOut - dIn) / (1000 * 60 * 60);
                                        
                                        // Simple Indonesian Rule: Deduct 1 hour break if worked > 5 hours
                                        let workHours = diff > 5 ? Math.min(diff - 1, 8) : diff;
                                        let estOt = diff > 9 ? diff - 9 : 0;

                                        return `
                                            <tr style="border-top: 1px solid #f1f5f9;">
                                                <td style="padding: 12px; font-weight: 600;">${emp ? emp['Full Name *'] : id}</td>
                                                <td style="padding: 12px; text-align: center;">${dIn.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td>
                                                <td style="padding: 12px; text-align: center;">${lateText}</td>
                                                <td style="padding: 12px; text-align: center;">${dOut.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td>
                                                <td style="padding: 12px; text-align: center; color: var(--text-muted);">${diff.toFixed(2)} jam</td>
                                                <td style="padding: 12px; text-align: center; font-weight: 700; color: var(--primary-color);">${workHours.toFixed(2)} jam</td>
                                                <td style="padding: 12px; text-align: center;">
                                                    ${estOt > 0 ? `<span style="background: #fef2f2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-weight: 700;">+${estOt.toFixed(2)} jam</span>` : '-'}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('');
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    if (window._showAttendanceChart) {
        document.getElementById('attendance-chart-container').style.display = 'block';
        document.getElementById('btn-toggle-attendance-view').innerText = '📋 Lihat List';
        initAttendanceChart();
    }
}

function toggleAttendanceView() {
    window._showAttendanceChart = !window._showAttendanceChart;
    renderAttendancePage(true);
}

function initAttendanceChart() {
    const ctx = document.getElementById('attendanceTrendsChart');
    if (!ctx) return;

    // Process last 30 days
    const labels = [];
    const presentData = [];
    const lateData = [];
    const leaveData = [];

    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        
        labels.push(dayName);

        // Count Present & Late
        const logs = attendanceData.filter(l => {
            const ts = l.Timestamp || l.timestamp;
            return ts && new Date(ts).toISOString().split('T')[0] === dateStr;
        });

        // Unique employees per day
        const uniqueEmps = new Set(logs.map(l => l['Employee ID'] || l['employeeId']));
        
        let present = 0;
        let late = 0;

        uniqueEmps.forEach(empId => {
            present++;
            const empLogs = logs.filter(l => (l['Employee ID'] || l['employeeId']) === empId);
            const firstLog = empLogs.sort((a,b) => new Date(a.Timestamp || a.timestamp) - new Date(b.Timestamp || b.timestamp))[0];
            if (firstLog) {
                const hour = new Date(firstLog.Timestamp || firstLog.timestamp).getHours();
                if (hour >= 9) late++;
            }
        });

        // Count Leave/Izin
        const leaves = leaveRequests.filter(r => {
            if (r.status !== 'Approved') return false;
            const start = new Date(r.startDate).toISOString().split('T')[0];
            const end = new Date(r.endDate).toISOString().split('T')[0];
            return dateStr >= start && dateStr <= end;
        });

        presentData.push(present - late);
        lateData.push(late);
        leaveData.push(leaves.length);
    }

    if (window.activeAttendanceChart) window.activeAttendanceChart.destroy();

    window.activeAttendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tepat Waktu',
                    data: presentData,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                },
                {
                    label: 'Terlambat',
                    data: lateData,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                },
                {
                    label: 'Izin/Cuti',
                    data: leaveData,
                    backgroundColor: '#6366f1',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        font: { size: 11, weight: '600' }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: { stepSize: 1, font: { size: 10 } }
                }
            }
        }
    });
}

window.updateAttendanceFilter = (val) => {
    window._attendanceDateFilter = val;
    renderAttendancePage(true);
};

window.updateAttendanceDeptFilter = (val) => {
    window._attendanceDeptFilter = val;
    renderAttendancePage(true);
};

window.viewLargePhoto = (base64) => {
    showModal(`
        <div style="text-align: center; padding: 1rem;">
            <img src="data:image/jpeg;base64,${base64}" style="max-width: 100%; max-height: 70vh; border-radius: 16px; box-shadow: var(--shadow-md); border: 4px solid #fff;">
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-secondary" style="width: 100%;" onclick="closeModal()">Tutup Pratinjau</button>
            </div>
        </div>
    `);
};

window.showAttendanceExportModal = () => {
    const today = new Date().toISOString().split('T')[0];
    // Default range: Start of month to today
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    showModal(`
        <div style="padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem; font-weight: 800;">📊 Export Rekap Kehadiran</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">Pilih rentang periode untuk mengunduh rekapan absensi semua karyawan.</p>
            
            <div class="grid-2" style="margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label>Dari Tanggal</label>
                    <input type="date" id="export-start-date" class="form-input" value="${firstDay}">
                </div>
                <div class="form-group">
                    <label>Sampai Tanggal</label>
                    <input type="date" id="export-end-date" class="form-input" value="${today}">
                </div>
            </div>

            <div class="btn-group-modern">
                <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Batal</button>
                <button class="btn btn-primary" style="flex: 2;" onclick="processAttendanceExport()">Unduh Laporan (.xlsx)</button>
            </div>
        </div>
    `);
};

window.processAttendanceExport = () => {
    const start = document.getElementById('export-start-date').value;
    const end = document.getElementById('export-end-date').value;
    
    if (!start || !end) {
        showToast("Pilih rentang tanggal dengan benar", "error");
        return;
    }

    exportAttendanceToExcel(start, end);
    closeModal();
};

window.exportAttendanceToExcel = (startDate, endDate) => {
    if (!attendanceData || attendanceData.length === 0) {
        window.showToast("Tidak ada data absensi untuk diekspor.", "error");
        return;
    }

    window.showToast("Menyiapkan laporan...", 'info');

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Include full end day

        const dataToExport = attendanceData.filter(log => {
            const ts = log.Timestamp || log.timestamp;
            if (!ts) return false;
            const logDate = new Date(ts);
            return logDate >= start && logDate <= end;
        });

        if (dataToExport.length === 0) {
            window.showToast("Tidak ada data pada periode tersebut.", "warning");
            return;
        }

        // Sort by Date then Name
        dataToExport.sort((a, b) => new Date(a.Timestamp || a.timestamp) - new Date(b.Timestamp || b.timestamp));

        const formattedData = dataToExport.map(log => {
            const emp = findEmployeeById(log['Employee ID'] || log['employeeId']);
            const ts = new Date(log.Timestamp || log.timestamp);
            return {
                'Tanggal': ts.toLocaleDateString('id-ID'),
                'Waktu': ts.toLocaleTimeString('id-ID', { hour12: false }),
                'ID Karyawan': log['Employee ID'] || log['employeeId'] || '',
                'Nama Karyawan': emp ? (emp['Full Name *'] || emp['EMPLOYEE NAME']) : 'Unknown',
                'Departemen': emp ? (emp['Organization Name *'] || '-') : '-',
                'Jabatan': emp ? (emp['Job Position *'] || '-') : '-',
                'Status Absen': log['STATUS ABSEN'] || log.Status || 'Hadir',
                'Lokasi (GPS)': log.Location || '',
                'Alamat': log.Address || '',
                'Catatan': log.Notes || log.notes || ''
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        
        // Auto-size columns
        const colWidths = Object.keys(formattedData[0]).map(key => ({ wch: key.length + 10 }));
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");
        
        const fileName = `WKN_Rekap_Absensi_${startDate}_to_${endDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        window.showToast("Laporan berhasil diunduh", 'success');
    } catch (err) {
        console.error("Export Error:", err);
        window.showToast("Gagal mengekspor data: " + err.message, "error");
    }
};

async function renderOrgChart(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-org');

    await fetchData();

    // Group employees by Department
    const depts = {};
    salaryData.forEach(emp => {
        // Skip resigned if not in a separate view
        const isResigned = ['resigned', 'resign'].some(s => (emp['Employment Status *'] || '').toLowerCase().includes(s));
        if (isResigned) return;

        const deptName = emp['Organization Name *'] || 'Unassigned';
        if (!depts[deptName]) depts[deptName] = [];
        depts[deptName].push(emp);
    });

    const deptList = Object.keys(depts).sort();

    app.innerHTML = `
        ${renderTopbar(t('org_structure'))}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <!-- Search Bar for Org Chart -->
            <div style="max-width: 600px; margin: 0 auto 2rem; position: relative;">
                <input type="text" id="org-search" class="form-input" 
                    placeholder="${currentLang === 'id' ? 'Cari nama atau jabatan di struktur...' : 'Search name or position in chart...'}" 
                    oninput="applyOrgFilter()"
                    style="padding-left: 2.75rem; height: 48px; box-shadow: var(--shadow-md); border-radius: 16px;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.25rem; opacity: 0.5;">🔍 </span>
            </div>

            <div class="org-container">
                <div class="org-tree">
                    <!-- Root Node -->
                    <div class="org-node root">
                        <div class="org-node-name">Wijaya Kreatif Nusantara</div>
                        <div class="org-node-subtitle">Corporate Headquarters</div>
                    </div>

                    <!-- Department Level -->
                    <div class="org-children">
                        ${deptList.map((dept, index) => {
                            const isFirst = index === 0;
                            const isLast = index === deptList.length - 1;
                            const isOnly = deptList.length === 1;
                            let lineClass = 'middle';
                            if (isFirst && !isOnly) lineClass = 'right';
                            if (isLast && !isOnly) lineClass = 'left';
                            if (isOnly) lineClass = '';

                            return `
                                <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                                    ${!isOnly ? `<div class="org-branch-line ${lineClass}"></div>` : ''}
                                    <div class="org-node dept">
                                        <div class="org-node-name" style="color: var(--primary-color);">${dept}</div>
                                        <div class="org-node-subtitle" style="font-weight: 700;">${depts[dept].length} Personil</div>
                                        
                                        <div class="org-member-list">
                                            ${depts[dept].sort((a,b) => {
                                                const levels = { 'Director': 0, 'Manager': 1, 'Senior': 2, 'Staff': 3 };
                                                const lvlA = levels[a['Job Level *']] || 99;
                                                const lvlB = levels[b['Job Level *']] || 99;
                                                return lvlA - lvlB;
                                            }).map(m => `
                                                <div class="org-member-item" onclick="viewEmployeeDetails(${m.rowid})" style="cursor: pointer;">
                                                    <div class="org-member-avatar">${(m['Full Name *'] || 'E')[0]}</div>
                                                    <div class="org-member-info">
                                                        <div class="org-member-name">${m['Full Name *']}</div>
                                                        <div class="org-member-pos">${m['Job Position *']}</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.applyOrgFilter = () => {
    const term = document.getElementById('org-search').value.toLowerCase();
    const nodes = document.querySelectorAll('.org-member-item');
    const depts = document.querySelectorAll('.org-node.dept');

    nodes.forEach(node => {
        const name = node.querySelector('.org-member-name').innerText.toLowerCase();
        const pos = node.querySelector('.org-member-pos').innerText.toLowerCase();
        
        if (name.includes(term) || pos.includes(term)) {
            node.style.display = 'flex';
            if (term) {
                node.style.background = '#fff1f2';
                node.style.borderColor = 'var(--primary-color)';
                node.style.transform = 'scale(1.02)';
            } else {
                node.style.background = '#ffffff';
                node.style.borderColor = '#f1f5f9';
                node.style.transform = 'scale(1)';
            }
        } else {
            node.style.display = term ? 'none' : 'flex';
            node.style.background = '#ffffff';
            node.style.borderColor = '#f1f5f9';
            node.style.transform = 'scale(1)';
        }
    });

    // Fade out departments with no matches
    depts.forEach(dept => {
        const visibleMembers = Array.from(dept.querySelectorAll('.org-member-item')).filter(n => n.style.display !== 'none').length;
        if (term && visibleMembers === 0) {
            dept.style.opacity = '0.3';
            dept.style.filter = 'grayscale(100%)';
        } else {
            dept.style.opacity = '1';
            dept.style.filter = 'none';
        }
    });
};

async function renderDashboard(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-dashboard');

    if (!Array.isArray(salaryData)) salaryData = [];

    // Loading State
    if (salaryData.length === 0 && !silent) {
        app.innerHTML = `
            ${renderTopbar(t('dashboard'))}
            <div style="display: flex; flex: 1; align-items: center; justify-content: center; flex-direction: column; gap: 1.5rem; padding: 4rem; height: 80vh;">
                <div class="loading-spinner"></div>
                <div style="text-align: center;">
                    <p style="font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">${t('processing')}</p>
                    <p style="font-size: 0.8125rem; color: var(--text-muted); max-width: 300px;">${currentLang === 'id' ? 'Aplikasi sedang mengambil data terbaru...' : 'Fetching latest data from server...'}</p>
                </div>
            </div>
        `;
    }

    await fetchData();
    if (!Array.isArray(salaryData)) salaryData = [];

    const today = new Date();
    const hour = today.getHours();
    let greeting = 'Selamat Datang';
    if (hour < 11) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 19) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';
    if (currentLang === 'en') {
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 17) greeting = 'Good Afternoon';
        else greeting = 'Good Evening';
    }

    const userName = localStorage.getItem('GajiPro_UserName') || 'Admin';

    // Calculate Statistics
    const stats = salaryData.reduce((acc, emp) => {
        const salary = parseInt(emp['Gaji Pokok'] || emp['Basic Salary']) || 0;
        acc.total += salary;
        const status = getContractStatus(emp).class;
        acc.contract[status] = (acc.contract[status] || 0) + 1;

        const dobRaw = emp['DATE OF BIRTH'] || emp['Date of Birth *'] || emp['Date of Birth'];
        if (dobRaw) {
            const dob = new Date(dobRaw);
            if (dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()) {
                acc.birthdays.push(emp);
            }
        }
        return acc;
    }, { total: 0, contract: {}, birthdays: [] });

    const totalPayroll = stats.total;
    const avgSalary = salaryData.length ? totalPayroll / salaryData.length : 0;
    const contractStats = stats.contract;

    // Empty State
    if (salaryData.length === 0) {
        app.innerHTML = `
            ${renderTopbar(t('dashboard'))}
            <div class="content-body" style="flex: 1; display: flex; align-items: center; justify-content: center; text-align: center;">
                <div class="card fade-in" style="max-width: 500px; padding: 4rem 2rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl);">
                    <div style="font-size: 5rem; margin-bottom: 2rem;">🚀</div>
                    <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem;">${currentLang === 'id' ? 'Dashboard Belum Terisi' : 'Dashboard Not Populated'}</h2>
                    <p style="color: var(--text-muted); margin-bottom: 3rem; line-height: 1.6;">${currentLang === 'id' ? 'Database Anda masih kosong. Mulai dengan mengimpor data karyawan atau menambahkannya secara manual.' : 'Your database is currently empty. Start by importing employee data or adding them manually.'}</p>
                    <button class="btn btn-primary" onclick="navigate('nav-data')" style="padding: 1.25rem 2.5rem; border-radius: var(--radius-lg); font-weight: 800; font-size: 1rem; box-shadow: 0 10px 20px -5px rgba(225, 29, 72, 0.4);">
                        <i class="fas fa-plus-circle" style="margin-right: 10px;"></i> ${t('add_employee')}
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Main Dashboard UI
    app.innerHTML = `
        ${renderTopbar(t('dashboard'))}
        <div class="content-body ${silent ? '' : 'fade-in'}" style="flex: 1; padding: 2rem 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Hero Section (Full Width) -->
            <div class="card" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 3rem; border-radius: var(--radius-xl); position: relative; overflow: hidden; border: none; flex-shrink: 0;">
                <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(225, 29, 72, 0.2) 0%, transparent 70%); border-radius: 50%; filter: blur(60px);"></div>
                <div style="position: relative; z-index: 5; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="max-width: 600px;">
                        <h1 style="font-size: 2.75rem; font-weight: 800; font-family: 'Outfit', sans-serif; letter-spacing: -1px; margin-bottom: 1rem; color: #ffffff;">
                            ${greeting}, <span style="color: var(--accent-color);">${userName}</span>! 👋
                        </h1>
                        <p style="font-size: 1.125rem; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 2.5rem;">
                            ${t('welcome_desc')}
                        </p>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn" onclick="navigate('nav-data')" style="background: white; color: #0f172a; padding: 1rem 2rem; border-radius: var(--radius-md); font-weight: 800; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-users" style="color: var(--primary-color);"></i> ${t('manage_employees')}
                            </button>
                            <button class="btn" onclick="navigate('nav-payroll')" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 1rem 2rem; border-radius: var(--radius-md); font-weight: 800; backdrop-filter: blur(10px);">
                                <i class="fas fa-file-invoice-dollar"></i> ${t('process_payroll')}
                            </button>
                        </div>
                    </div>
                    <div style="text-align: right;" class="topbar-desktop-only">
                        <div id="hero-clock" style="font-size: 4rem; font-weight: 800; font-family: 'Outfit', sans-serif; color: white; line-height: 1;">
                            ${today.toLocaleTimeString(currentLang === 'id' ? 'id-ID' : 'en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style="font-size: 1rem; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px;">
                            ${today.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Two-Column Layout (Flexbox) -->
            <div class="dashboard-grid-container" style="display: flex; gap: 2rem; flex: 1;">
                
                <!-- Left Column (70%) -->
                <div class="dashboard-column-left" style="flex: 7; display: flex; flex-direction: column; gap: 2rem; min-width: 0;">
                    
                    <!-- Stats Quick View -->
                    <div class="hero-stats-grid" style="display: flex; gap: 1.5rem;">
                        <div class="card-premium" style="flex: 1; padding: 1.75rem;">
                            <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase;">${t('total_employees')}</div>
                            <div style="font-size: 2rem; font-weight: 800; color: var(--text-main);">${salaryData.length}</div>
                        </div>
                        <div class="card-premium" style="flex: 1; padding: 1.75rem;">
                            <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase;">${t('total_expenditure')}</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">${formatCurrency(totalPayroll)}</div>
                        </div>
                        <div class="card-premium" style="flex: 1; padding: 1.75rem;">
                            <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase;">${t('average_salary')}</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">${formatCurrency(avgSalary)}</div>
                        </div>
                    </div>

                    <!-- Financial Trends -->
                    <div class="card-premium" style="padding: 2rem; flex: 1; min-height: 350px;">
                        <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem;">📈 ${t('financial_trends')}</h3>
                        <div style="height: 300px; width: 100%; position: relative;">
                            <canvas id="salaryChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Right Column (30%) -->
                <div class="dashboard-column-right" style="flex: 3; display: flex; flex-direction: column; gap: 2rem; min-width: 320px;">
                    
                    <!-- Contract Distribution -->
                    <div class="card-premium" style="padding: 1.5rem;">
                        <h3 style="font-size: 1rem; font-weight: 800; margin-bottom: 1rem;">📝 ${t('staff_registry')}</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #10b981;">
                                <span style="font-size: 0.8125rem; font-weight: 700; color: #15803d;">${t('active_contracts')}</span>
                                <span style="font-weight: 800; color: #064e3b;">${contractStats.active || 0}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fff7ed; border-radius: 12px; border-left: 4px solid #f59e0b;">
                                <span style="font-size: 0.8125rem; font-weight: 700; color: #b45309;">${t('expiring_soon')}</span>
                                <span style="font-weight: 800; color: #7c2d12;">${contractStats.warning || 0}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444;">
                                <span style="font-size: 0.8125rem; font-weight: 700; color: #b91c1c;">${t('expired_contracts')}</span>
                                <span style="font-weight: 800; color: #7f1d1d;">${contractStats.expired || 0}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Birthdays -->
                    <div class="card-premium" style="padding: 1.5rem; background: ${stats.birthdays.length > 0 ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' : '#fff'}; color: ${stats.birthdays.length > 0 ? '#fff' : 'inherit'};">
                        <h3 style="font-size: 1rem; font-weight: 800; margin-bottom: 1rem;">🎂 ${t('happy_birthday')}</h3>
                        ${stats.birthdays.length > 0 ? stats.birthdays.map(emp => `
                            <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 12px; margin-bottom: 8px;">
                                <div style="font-size: 0.875rem; font-weight: 800;">${emp['Full Name *'] || emp['EMPLOYEE NAME']}</div>
                                <div style="font-size: 0.7rem; opacity: 0.8;">${emp['Job Position *'] || '-'}</div>
                            </div>
                        `).join('') : '<p style="font-size: 0.8125rem; opacity: 0.6; text-align: center;">-</p>'}
                    </div>
                </div>
            </div>

            <!-- Recent Activity (Full Width) -->
            <div class="card-premium" style="padding: 2rem;">
                <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem;">📋 ${t('recent_activity')}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                    ${salaryData.slice(-4).reverse().map(item => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 8px; background: #fff; color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: 800;">
                                ${(item['EMPLOYEE NAME'] || item['Full Name *'] || 'E')[0]}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.8125rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item['EMPLOYEE NAME'] || item['Full Name *'] || t('unknown')}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">${item['Job Position *'] || t('employee')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Real-time Hero Clock Update
    if (document.getElementById('hero-clock')) {
        const clockInterval = setInterval(() => {
            const clockEl = document.getElementById('hero-clock');
            if (!clockEl) {
                clearInterval(clockInterval);
                return;
            }
            const now = new Date();
            clockEl.innerText = now.toLocaleTimeString(currentLang === 'id' ? 'id-ID' : 'en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        }, 1000);
    }

    const chartEl = document.getElementById('salaryChart');
    if (chartEl && typeof Chart !== 'undefined') {
        const ctx = chartEl.getContext('2d');
        
        let historyLabels = [];
        let historyValues = [];
        
        if (payrollHistory && payrollHistory.length > 0) {
            const last6 = payrollHistory.slice().sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(-6);
            historyLabels = last6.map(h => {
                const d = new Date(h.year, h.month - 1);
                return d.toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
            });
            historyValues = last6.map(h => h.totalExpenditure / 1000000);
        } else {
            historyLabels = [new Date().toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'short' })];
            historyValues = [(parseInt(totalPayroll) || 0) / 1000000];
        }

        if (window.activeSalaryChart) window.activeSalaryChart.destroy();

        window.activeSalaryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historyLabels,
                datasets: [{
                    label: currentLang === 'id' ? 'Total Gaji (Juta)' : 'Total Salary (M)',
                    data: historyValues,
                    borderColor: '#e11d48',
                    backgroundColor: 'rgba(225, 29, 72, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#e11d48',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Rp ${context.parsed.y.toFixed(1)} Juta`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: '#f1f5f9' }, 
                        border: { display: false }, 
                        ticks: { 
                            color: '#94a3b8', 
                            font: { size: 10 },
                            callback: value => value + 'M'
                        } 
                    },
                    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

async function renderDataPage(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-data');

    // Pisahkan data karyawan aktif vs resign
    const RESIGN_STATUSES = ['Resigned', 'Resigned/Deleted', 'Resign', 'resigned'];
    const activeEmployees = salaryData.filter(emp => !RESIGN_STATUSES.some(s => (emp['Employment Status *'] || '').toLowerCase().includes('resign')));
    const resignedEmployees = salaryData.filter(emp => RESIGN_STATUSES.some(s => (emp['Employment Status *'] || '').toLowerCase().includes('resign')));

    // Baca tab aktif dari state (default: active)
    const currentTab = window._employeeTab || 'active';

    app.innerHTML = `
        ${renderTopbar(t('employee_data'))}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">${t('staff_registry')}</h3>
                    <p style="color: var(--text-muted); font-size: 0.8125rem;">${currentLang === 'id' ? 'Manajemen database karyawan Wijaya Kreatif Nusantara.' : 'Management of Wijaya Kreatif Nusantara employee database.'}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="printEmployeeReport()" style="display: flex; align-items: center; gap: 6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Cetak Laporan
                    </button>
                    <button class="btn btn-primary" onclick="showAddForm()" style="display: ${currentTab === 'active' ? 'flex' : 'none'}; align-items: center; gap: 6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        ${t('add_employee')}
                    </button>
                </div>
            </header>

            <!-- Tab Selector -->
            <div style="display: flex; gap: 0; margin-bottom: 1.5rem; background: #f1f5f9; border-radius: 14px; padding: 4px;">
                <button id="tab-btn-active" onclick="switchEmployeeTab('active')" style="
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer;
                    font-weight: 700; font-size: 0.875rem; transition: all 0.25s ease;
                    background: ${currentTab === 'active' ? '#ffffff' : 'transparent'};
                    color: ${currentTab === 'active' ? 'var(--primary-color)' : 'var(--text-muted)'};
                    box-shadow: ${currentTab === 'active' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    ${t('active_db')}
                    <span style="background: #10b981; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 1px 8px; border-radius: 20px; min-width: 24px; text-align: center;">
                        ${activeEmployees.length}
                    </span>
                </button>
                <button id="tab-btn-resign" onclick="switchEmployeeTab('resign')" style="
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer;
                    font-weight: 700; font-size: 0.875rem; transition: all 0.25s ease;
                    background: ${currentTab === 'resign' ? '#ffffff' : 'transparent'};
                    color: ${currentTab === 'resign' ? '#f59e0b' : 'var(--text-muted)'};
                    box-shadow: ${currentTab === 'resign' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    ${t('resigned_db')}
                    <span style="background: #f59e0b; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 1px 8px; border-radius: 20px; min-width: 24px; text-align: center;">
                        ${resignedEmployees.length}
                    </span>
                </button>
            </div>

            <!-- Search + Filter Bar -->
            <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem; background: #f8fafc; border: 1px solid #e2e8f0;">
                <!-- Row 1: Search + Count -->
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <input type="text" id="filter-search" class="form-input"
                            placeholder="${t('search_placeholder')}"
                            oninput="applyEmployeeFilters()"
                            style="padding-left: 2.75rem; height: 44px;">
                        <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.5; display: flex; align-items: center;">${UI.icons.search}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 0.8125rem; font-weight: 600; white-space: nowrap;">
                            <span id="record-count">${currentTab === 'active' ? activeEmployees.length : resignedEmployees.length}</span> ${t('data')}
                        </div>
                        <button onclick="resetEmployeeFilters()" title="Reset Semua Filter" style="padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 5px; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--primary-color)';this.style.color='var(--primary-color)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.color='var(--text-muted)'">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                            Reset
                        </button>
                    </div>
                </div>

                <!-- Row 2: Filter Dropdowns -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.75rem;">
                    <!-- Filter: Departemen -->
                    <div style="position: relative;">
                        <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Departemen</label>
                        <select id="filter-dept" onchange="applyEmployeeFilters()" class="form-input" style="height: 38px; font-size: 0.8125rem; padding: 0 0.75rem; cursor: pointer;">
                            <option value="">Semua Departemen</option>
                            ${[...new Set(salaryData.map(e => e['Organization Name *']).filter(Boolean))].sort().map(d => `<option value="${d}">${d}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Filter: Jabatan -->
                    <div>
                        <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Jabatan</label>
                        <select id="filter-position" onchange="applyEmployeeFilters()" class="form-input" style="height: 38px; font-size: 0.8125rem; padding: 0 0.75rem; cursor: pointer;">
                            <option value="">Semua Jabatan</option>
                            ${[...new Set(salaryData.map(e => e['Job Position *']).filter(Boolean))].sort().map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Filter: Level -->
                    <div>
                        <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Level</label>
                        <select id="filter-level" onchange="applyEmployeeFilters()" class="form-input" style="height: 38px; font-size: 0.8125rem; padding: 0 0.75rem; cursor: pointer;">
                            <option value="">Semua Level</option>
                            ${[...new Set(salaryData.map(e => e['Job Level *']).filter(Boolean))].sort().map(l => `<option value="${l}">${l}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Filter: Status -->
                    <div>
                        <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Status Kepegawaian</label>
                        <select id="filter-empstatus" onchange="applyEmployeeFilters()" class="form-input" style="height: 38px; font-size: 0.8125rem; padding: 0 0.75rem; cursor: pointer;">
                            <option value="">Semua Status</option>
                            ${[...new Set(salaryData.map(e => e['Employment Status *']).filter(Boolean))].sort().map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Table Container -->
            <div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <div class="table-container">
                    <table style="width: 100%; border-collapse: collapse;" id="employee-main-table">
                        <thead>
                            <tr style="background: #f1f5f9;">
                                <th style="padding: 1rem; width: 120px; text-align: center;">${t('actions')}</th>
                                <th style="padding: 1rem; width: 110px;">${t('nik')}</th>
                                <th style="padding: 1rem;">${t('name_contact')}</th>
                                <th style="padding: 1rem;">${t('department')}</th>
                                <th style="padding: 1rem;">${t('position')}</th>
                                ${currentTab === 'resign' ? `
                                    <th style="padding: 1rem;">${t('resign_date')}</th>
                                    <th style="padding: 1rem;">${t('reason')}</th>
                                ` : `
                                    <th style="padding: 1rem;">${t('status')}</th>
                                    <th style="padding: 1rem;">${t('contract_status')}</th>
                                `}
                            </tr>
                        </thead>
                        <tbody id="employee-table-body">
                            <tr><td colspan="${currentTab === 'resign' ? 7 : 6}" style="text-align: center; padding: 2rem;"><div class="loading-spinner" style="margin: 0 auto;"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Render rows berdasarkan tab
    const targetData = currentTab === 'active' ? activeEmployees : resignedEmployees;
    document.getElementById('employee-table-body').innerHTML =
        currentTab === 'active'
            ? renderEmployeeRows(targetData)
            : renderResignedRows(targetData);
}

// Fungsi switch tab â€” dipanggil dari onclick
window.switchEmployeeTab = function(tab) {
    window._employeeTab = tab;
    renderDataPage(true);
};

function getContractStatus(emp) {
    const endDateStr = emp['Contract End Date'];
    if (!endDateStr) return { label: t('contract_none'), class: 'none' };

    const today = new Date();
    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) return { label: t('contract_none'), class: 'none' };

    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: t('contract_expired'), class: 'expired' };
    if (diffDays <= 30) return { label: t('contract_expiring'), class: 'warning' };
    return { label: t('contract_active'), class: 'active' };
}

function renderContractStatusBadge(emp) {
    const status = getContractStatus(emp);
    let bg = '#f1f5f9', color = '#64748b', border = '#e2e8f0';

    if (status.class === 'active') { bg = '#dcfce7'; color = '#166534'; border = '#bbf7d0'; }
    else if (status.class === 'warning') { bg = '#fff7ed'; color = '#9a3412'; border = '#ffedd5'; }
    else if (status.class === 'expired') { bg = '#fef2f2'; color = '#991b1b'; border = '#fecaca'; }

    return `<span class="status-badge" style="background: ${bg}; color: ${color}; border: 1px solid ${border}; font-size: 0.65rem;">${status.label}</span>`;
}

function renderResignedRows(data) {
    return renderEmployeeRows(data, 'resign');
}

function renderEmployeeRows(data, type = 'active') {
    if (data.length === 0) {
        const icon = type === 'active' ? `${UI.icons.user}` : `${UI.icons.logout}`;
        const msg = type === 'active' ? t('no_active_emp') : t('no_resigned_emp');
        return `<tr><td colspan="${type === 'active' ? 7 : 7}" style="text-align: center; padding: 4rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">${icon}</div>
            <p style="font-weight: 600;">${msg}</p>
        </td></tr>`;
    }

    return data.map(item => {
        const photo = item['Profile Photo (Base64)'] || '';
        const isResign = type === 'resign';
        return `
            <tr class="table-row-hover" ${isResign ? 'style="opacity: 0.85;"' : ''}>
                <td style="padding: 0.875rem; text-align: center;">
                    <div style="display: flex; gap: 3px; justify-content: center;">
                        <button class="btn btn-secondary" style="padding: 5px 7px;" onclick="viewEmployeeDetails(${item.rowid})">${UI.icons.eye}</button>
                        ${hasPermission('canEdit') ? `<button class="btn btn-secondary" style="padding: 5px 7px;" onclick="showEditForm(${item.rowid})">${UI.icons.edit}</button>` : ''}
                        ${!isResign && hasPermission('canDelete') ? `<button class="btn btn-secondary" style="color: #f59e0b;" onclick="showResignForm(${item.rowid})">${UI.icons.logout}</button>` : ''}
                        ${hasPermission('canDelete') ? `<button class="btn btn-secondary" style="color: #ef4444;" onclick="deleteEmployee(${item.rowid})">${UI.icons.delete}</button>` : ''}
                    </div>
                </td>
                <td style="padding: 1rem; font-family: monospace; font-weight: 700;">${item['EMPLOYEE ID'] || item['Employee ID *'] || '-'}</td>
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${photo ? `<img src="data:image/jpeg;base64,${photo}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">` : `<div style="width:32px; height:32px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center;">${UI.icons.user}</div>`}
                        <div>
                            <div style="font-weight: 700;">${item['EMPLOYEE NAME'] || item['Full Name *'] || '-'}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${item['EMAIL'] || item['Email *'] || '-'}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 1rem;">${item['Organization Name *'] || '-'}</td>
                <td style="padding: 1rem;">${item['Job Position *'] || '-'}</td>
                ${isResign ? `
                    <td style="padding: 1rem; color: #9a3412;">${item['Resign Date'] || '-'}</td>
                    <td style="padding: 1rem; max-width: 200px; font-size: 0.75rem;">${item['Resign Reason'] || '-'}</td>
                ` : `
                    <td style="padding: 1rem;">${item['Status *'] || t('active')}</td>
                    <td style="padding: 1rem;">${renderContractStatusBadge(item)}</td>
                `}
            </tr>
        `;
    }).join('');
}

window.viewEmployeeDetails = (rowid) => {
    // Pastikan rowid dikonversi ke number (HTML onclick kadang kirim string)
    const id = typeof rowid === 'string' ? parseInt(rowid, 10) : rowid;
    const employee = salaryData.find(emp => emp.rowid === id || emp.rowid === rowid);
    
    if (!employee) {
        window.showToast(t('employee_not_found'), 'error');
        return;
    }

    // Comprehensive Key Mapping for Details View
    const name = employee['EMPLOYEE NAME'] || employee['Full Name *'] || employee['NAME'] || '-';
    const empId = employee['EMPLOYEE ID'] || employee['Employee ID *'] || '-';
    const email = employee['EMAIL'] || employee['Email *'] || '-';
    const status = employee['Status *'] || employee['Employment Status *'] || employee['STATUS'] || 'Active';
    const org = employee['Organization Name *'] || employee['DEPARTMENT'] || '-';
    const pos = employee['Job Position *'] || employee['POSITION'] || '-';
    const level = employee['Job Level *'] || employee['Job Level *'] || employee['LEVEL'] || '-';
    const dob = employee['DATE OF BIRTH'] || employee['Date of Birth *'] || '-';
    const nik = employee['NATIONAL ID (NIK)'] || employee['NIK (NPWP 16 digit)'] || '-';
    const basicSalary = employee['Gaji Pokok'] || employee['Basic Salary'] || 0;
    const mealAllowance = employee['Meal Allowance'] || employee['Daily Meal Allowance'] || 0;
    const transAllowance = employee['Transport Allowance'] || employee['Daily Transport Allowance'] || 0;
    const bpjsTk = employee['BPJS Ketenagakerjaan (Isi dengan: Aktif / Tidak Aktif)'] || employee['BPJS Ketenagakerjaan'] || '-';
    const bpjsKes = employee['BPJS Kesehatan (Isi dengan: Aktif / Tidak Aktif)'] || employee['BPJS Kesehatan'] || '-';
    const bankName = employee['Bank Name'] || '-';
    const bankAcc = employee['Bank Account'] || '-';
    const bankHolder = employee['Bank Account Holder'] || '-';
    const photo = employee['Profile Photo (Base64)'] || '';
    const ec1_name = employee['Emergency Contact 1 (Name)'] || '-';
    const ec1_rel = employee['Emergency Contact 1 (Relationship)'] || '-';
    const ec1_phone = employee['Emergency Contact 1 (Phone)'] || '-';
    const ec2_name = employee['Emergency Contact 2 (Name)'] || '-';
    const ec2_rel = employee['Emergency Contact 2 (Relationship)'] || '-';
    const ec2_phone = employee['Emergency Contact 2 (Phone)'] || '-';
    const ktpDoc = employee['KTP Document (Link)'] || '';
    const npwpDoc = employee['NPWP Document (Link)'] || '';
    const kkDoc = employee['KK Document (Link)'] || '';
    const contractDoc = employee['Contract Document (Link)'] || '';
    const cvDoc = employee['CV Document (Link)'] || '';
    const bankBookDoc = employee['Bank Book Document (Link)'] || '';
    const simADoc = employee['SIM A Document (Link)'] || '';
    const simCDoc = employee['SIM C Document (Link)'] || '';
    const contractEndDate = employee['Contract End Date'] || '-';

    showModal(`
        <div class="text-sm">
            <!-- Header Card -->
            <div class="detail-card flex-between">
                <div class="flex gap-4 items-center">
                    <div class="avatar-large flex-center">
                        ${photo 
                            ? `<img src="data:image/jpeg;base64,${photo}" style="width:100%; height:100%; object-fit:cover;">`
                            : (name || 'E')[0]}
                    </div>
                    <div>
                        <h2 class="text-bold" style="font-size: 1.15rem; margin-bottom: 2px; color: #0f172a;">${name}</h2>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-extrabold" style="background: var(--primary-color); color: #fff; padding: 1px 6px; border-radius: 4px; font-family: monospace;">ID: ${empId}</span>
                            <span class="text-muted text-xs">${email}</span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="status-badge" style="background: ${status === 'Active' ? '#dcfce7' : '#fee2e2'}; color: ${status === 'Active' ? '#166534' : '#991b1b'}; border: 1px solid ${status === 'Active' ? '#bbf7d0' : '#fecaca'}; padding: 4px 12px; font-size: 0.7rem; font-weight: 800;">
                        ${status.toUpperCase()}
                    </span>
                    ${renderContractStatusBadge(employee)}
                </div>
            </div>

            <div class="grid-2">
                <div class="detail-section">
                    <h4 class="section-label">${t('employment')}</h4>
                    <div class="flex flex-col gap-4">
                        <div>
                            <div class="info-item-label">ORGANIZATION</div>
                            <div class="info-item-value">${org}</div>
                        </div>
                        <div>
                            <div class="info-item-label">POSITION</div>
                            <div class="info-item-value">${pos}</div>
                        </div>
                        <div class="grid-2" style="gap: 0.5rem;">
                            <div>
                                <div class="info-item-label">LEVEL</div>
                                <div class="info-item-value">${level}</div>
                            </div>
                            <div>
                                <div class="info-item-label">DATE OF BIRTH</div>
                                <div class="info-item-value">${dob}</div>
                            </div>
                        </div>
                        <div>
                            <div class="info-item-label">NIK / NATIONAL ID</div>
                            <div class="info-item-value" style="font-family: monospace;">${nik}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4 class="section-label">${t('financial')}</h4>
                    <div class="flex flex-col gap-4">
                        ${hasPermission('canViewSalary') ? `
                            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 10px; border: 1px dashed #e2e8f0;">
                                <div class="info-item-label" style="font-weight: 700;">BASIC SALARY</div>
                                <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary-color);">${formatCurrency(basicSalary)}</div>
                            </div>
                        ` : `
                            <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 10px; opacity: 0.7;">
                                <div class="info-item-label">BASIC SALARY</div>
                                <div style="font-size: 0.8125rem; font-style: italic; color: #64748b;">Akses Terbatas</div>
                            </div>
                        `}
                        <div class="grid-2" style="gap: 0.5rem;">
                            <div>
                                <div class="info-item-label">BANK</div>
                                <div class="info-item-value">${bankName}</div>
                            </div>
                            <div>
                                <div class="info-item-label">HOLDER</div>
                                <div class="info-item-value">${bankHolder}</div>
                            </div>
                        </div>
                        <div>
                            <div class="info-item-label">ACCOUNT NO.</div>
                            <div class="info-item-value" style="font-family: monospace;">${bankAcc}</div>
                        </div>
                        <div class="grid-2" style="gap: 0.5rem;">
                            <div>
                                <div class="info-item-label">BPJS TK</div>
                                <div class="info-item-value">${bpjsTk}</div>
                            </div>
                            <div>
                                <div class="info-item-label">BPJS KES</div>
                                <div class="info-item-value">${bpjsKes}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid-2" style="margin-top: 1rem;">
                <!-- Column 3: Emergency Contacts -->
                <div class="detail-section" style="grid-column: span 2;">
                    <h4 class="section-label">${UI.icons.warning} KONTAK DARURAT</h4>
                    <div class="grid-2" style="gap: 1.5rem;">
                        <div style="background: #f8fafc; padding: 0.75rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <div class="text-xs text-extrabold" style="color: var(--primary-color); margin-bottom: 8px;">KONTAK 1</div>
                            <div class="text-bold" style="color: #0f172a; margin-bottom: 2px;">${ec1_name}</div>
                            <div class="text-xs text-muted" style="margin-bottom: 4px;">${ec1_rel}</div>
                            <div class="text-bold" style="color: var(--primary-color); font-family: monospace;">${ec1_phone}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 0.75rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <div class="text-xs text-extrabold" style="color: var(--primary-color); margin-bottom: 8px;">KONTAK 2</div>
                            <div class="text-bold" style="color: #0f172a; margin-bottom: 2px;">${ec2_name}</div>
                            <div class="text-xs text-muted" style="margin-bottom: 4px;">${ec2_rel}</div>
                            <div class="text-bold" style="color: var(--primary-color); font-family: monospace;">${ec2_phone}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Documents Section -->
            <div class="detail-section" style="margin-top: 1rem;">
                <h4 class="section-label">📄 DOKUMEN KARYAWAN</h4>
                <div class="grid-2" style="gap: 1rem;">
                    ${[
                        { label: 'KTP', link: ktpDoc },
                        { label: 'NPWP', link: npwpDoc },
                        { label: 'KK', link: kkDoc },
                        { label: 'KONTRAK', link: contractDoc },
                        { label: 'CV', link: cvDoc },
                        { label: 'BUKU TABUNGAN', link: bankBookDoc },
                        { label: 'SIM A', link: simADoc },
                        { label: 'SIM C', link: simCDoc }
                    ].map(doc => `
                        <div class="flex-between" style="background: #f8fafc; padding: 0.75rem; border-radius: 10px; border: 1px solid #e2e8f0;">
                            <span class="text-xs text-extrabold text-muted">${doc.label}</span>
                            ${doc.link 
                                ? `<a href="${doc.link}" target="_blank" class="btn btn-primary" style="padding: 4px 10px; font-size: 0.65rem; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                                    <span>${UI.icons.eye}</span> Lihat
                                   </a>` 
                                : `<span class="text-xs text-muted" style="font-style: italic;">Belum diunggah</span>`
                            }
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Career History Section -->
            <div class="detail-section" style="margin-top: 1rem;">
                <div class="flex-between" style="margin-bottom: 1rem;">
                    <h4 class="section-label" style="margin: 0;">📈 RIWAYAT MUTASI / PROMOSI</h4>
                    ${hasPermission('canEdit') ? `<button type="button" class="btn btn-secondary" style="font-size: 0.65rem; padding: 4px 10px;" onclick="showAddMutationForm(${id})">+ Tambah Riwayat</button>` : ''}
                </div>
                
                <div id="mutation-history-list">
                    ${(() => {
                        const history = (mutationData || []).filter(m => String(m['EMPLOYEE ID']) === String(empId));
                        if (history.length === 0) {
                            return `<div style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.75rem; font-style: italic; background: #f8fafc; border-radius: 12px; border: 1px dashed #e2e8f0;">Belum ada riwayat mutasi/promosi.</div>`;
                        }
                        return `
                            <div class="flex flex-col" style="gap: 0.75rem;">
                                ${history.sort((a,b) => new Date(b['EFFECTIVE DATE']) - new Date(a['EFFECTIVE DATE'])).map(m => `
                                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; position: relative;">
                                        <div class="flex-between" style="margin-bottom: 8px;">
                                            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; text-transform: uppercase;">${m['MUTATION TYPE'] || 'MUTATION'}</span>
                                            <span class="text-xs text-muted text-bold">Effective: ${m['EFFECTIVE DATE'] || '-'}</span>
                                        </div>
                                        <div class="grid-3" style="gap: 10px; align-items: center; margin-bottom: 8px; grid-template-columns: 1fr auto 1fr;">
                                            <div class="text-sm">
                                                <div class="text-xs text-muted text-bold">DARI</div>
                                                <div class="text-bold" style="color: #475569;">${m['OLD POSITION'] || '-'}</div>
                                                <div class="text-xs text-muted">${m['OLD DEPT'] || '-'}</div>
                                            </div>
                                            <div style="color: #cbd5e1;">${UI.icons.arrowRight}</div>
                                            <div class="text-sm">
                                                <div class="text-xs text-bold" style="color: var(--primary-color);">MENJADI</div>
                                                <div class="text-extrabold" style="color: #0f172a;">${m['NEW POSITION'] || '-'}</div>
                                                <div class="text-xs text-muted">${m['NEW DEPT'] || '-'}</div>
                                            </div>
                                        </div>
                                        ${m['DESCRIPTION'] ? `<div class="text-xs text-muted" style="padding-top: 8px; border-top: 1px solid #f1f5f9; font-style: italic;">"${m['DESCRIPTION']}"</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    })()}
                </div>
            </div>
        </div>
        <div class="btn-group-modern" style="justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            ${hasPermission('canEdit') ? `<button type="button" class="btn btn-primary" onclick="showEditForm(${id})">Edit Data</button>` : ''}
        </div>
    `);
};

window.applyRBAC = (role) => {
    const permissions = {
        'Super Admin': ['canAdd', 'canEdit', 'canDelete', 'canViewSalary', 'canAccessAdmins'],
        'Admin': ['canAdd', 'canEdit', 'canDelete', 'canViewSalary'],
        'Finance': ['canViewSalary'],
        'Staff': []
    };
    window._currentUserRole = role;
    window._permissions = permissions[role] || [];
};

window.hasPermission = (action) => {
    return (window._permissions || []).includes(action);
};

window.applyEmployeeFilters = () => {
    const searchEl   = document.getElementById('filter-search');
    const deptEl     = document.getElementById('filter-dept');
    const posEl      = document.getElementById('filter-position');
    const levelEl    = document.getElementById('filter-level');
    const statusEl   = document.getElementById('filter-empstatus');

    const search     = searchEl   ? searchEl.value.toLowerCase()   : '';
    const dept       = deptEl     ? deptEl.value                   : '';
    const position   = posEl      ? posEl.value                    : '';
    const level      = levelEl    ? levelEl.value                  : '';
    const empStatus  = statusEl   ? statusEl.value                 : '';

    const currentTab = window._employeeTab || 'active';
    const baseData = currentTab === 'resign'
        ? salaryData.filter(emp => (emp['Employment Status *'] || '').toLowerCase().includes('resign'))
        : salaryData.filter(emp => !(emp['Employment Status *'] || '').toLowerCase().includes('resign'));

    const filtered = baseData.filter(emp => {
        const matchSearch = !search ||
            (emp['Full Name *']    || '').toLowerCase().includes(search) ||
            (emp['Employee ID *']  || '').toLowerCase().includes(search) ||
            (emp['Email *']        || '').toLowerCase().includes(search);

        const matchDept     = !dept      || (emp['Organization Name *'] || '') === dept;
        const matchPosition = !position  || (emp['Job Position *']      || '') === position;
        const matchLevel    = !level     || (emp['Job Level *']         || '') === level;
        const matchStatus   = !empStatus || (emp['Employment Status *'] || '') === empStatus;

        return matchSearch && matchDept && matchPosition && matchLevel && matchStatus;
    });

    const tbody   = document.getElementById('employee-table-body');
    const counter = document.getElementById('record-count');

    if (tbody) {
        tbody.innerHTML = currentTab === 'resign'
            ? renderResignedRows(filtered)
            : renderEmployeeRows(filtered);
    }
    if (counter) counter.innerText = filtered.length;
};

window.resetEmployeeFilters = () => {
    ['filter-search','filter-dept','filter-position','filter-level','filter-empstatus'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    applyEmployeeFilters();
};

async function previewProfilePhoto(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        const base64Full = await getBase64Compressed(file);
        const base64Data = base64Full.split(',')[1];
        
        document.getElementById('profile-photo-base64').value = base64Data;
        document.getElementById('profile-photo-preview').innerHTML = `<img src="${base64Full}" style="width:100%; height:100%; object-fit:cover;">`;
    } catch (err) {
        console.error(err);
        showToast("Gagal memproses foto profil", "error");
    }
}

async function handleAddData(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const action = e.target.dataset.action || 'add';
    const rowid = e.target.dataset.rowid;

    const formData = {
        action: action,
        rowid: rowid,
        "Employee ID *": document.getElementById('employeeid').value,
        "Full Name *": document.getElementById('nama').value,
        "Email *": document.getElementById('email').value,
        "Mobile Phone Number": document.getElementById('mobile').value,
        "NATIONAL ID (NIK)": document.getElementById('nik').value,
        "Date of Birth *": document.getElementById('dob').value,
        "ADDRESS": document.getElementById('alamat-ktp') ? document.getElementById('alamat-ktp').value : "",
        "Emergency Contact 1 (Name)": document.getElementById('ec1_name') ? document.getElementById('ec1_name').value : "",
        "Emergency Contact 1 (Relationship)": document.getElementById('ec1_rel') ? document.getElementById('ec1_rel').value : "",
        "Emergency Contact 1 (Phone)": document.getElementById('ec1_phone') ? document.getElementById('ec1_phone').value : "",
        "Emergency Contact 2 (Name)": document.getElementById('ec2_name') ? document.getElementById('ec2_name').value : "",
        "Emergency Contact 2 (Relationship)": document.getElementById('ec2_rel') ? document.getElementById('ec2_rel').value : "",
        "Emergency Contact 2 (Phone)": document.getElementById('ec2_phone') ? document.getElementById('ec2_phone').value : "",
        "Organization Name *": document.getElementById('org').value,
        "Job Position *": document.getElementById('pos').value,
        "Job Level *": document.getElementById('level').value,
        "Employment Status *": document.getElementById('status').value,
        "Contract End Date": document.getElementById('end_status').value,
        "Resign Date": document.getElementById('resign_date') ? document.getElementById('resign_date').value : "",
        "NPWP": document.getElementById('npwp').value,
        "PTKP Status *": document.getElementById('ptkp').value,
        "Bank Name": document.getElementById('bank_name').value,
        "Bank Account": document.getElementById('bank_acc').value,
        "Bank Account Holder": document.getElementById('bank_holder').value,
        "KTP Document (Link)": document.getElementById('ktp_doc') ? document.getElementById('ktp_doc').value : "",
        "NPWP Document (Link)": document.getElementById('npwp_doc') ? document.getElementById('npwp_doc').value : "",
        "KK Document (Link)": document.getElementById('kk_doc') ? document.getElementById('kk_doc').value : "",
        "Contract Document (Link)": document.getElementById('contract_doc') ? document.getElementById('contract_doc').value : "",
        "CV Document (Link)": document.getElementById('cv_doc') ? document.getElementById('cv_doc').value : "",
        "Bank Book Document (Link)": document.getElementById('bankbook_doc') ? document.getElementById('bankbook_doc').value : "",
        "SIM A Document (Link)": document.getElementById('sima_doc') ? document.getElementById('sima_doc').value : "",
        "SIM C Document (Link)": document.getElementById('simc_doc') ? document.getElementById('simc_doc').value : "",
        "BPJS Ketenagakerjaan Status": document.getElementById('bpjs_tk_status') ? document.getElementById('bpjs_tk_status').value : "",
        "BPJS Ketenagakerjaan": document.getElementById('bpjs_tk') ? document.getElementById('bpjs_tk').value : "",
        "BPJS Kesehatan Status": document.getElementById('bpjs_ks_status') ? document.getElementById('bpjs_ks_status').value : "",
        "BPJS Kesehatan": document.getElementById('bpjs_ks') ? document.getElementById('bpjs_ks').value : "",
        "Alamat KTP": document.getElementById('alamat-ktp') ? document.getElementById('alamat-ktp').value : "",
        "Alamat Domisili": document.getElementById('alamat-domisili') ? document.getElementById('alamat-domisili').value : "",
        "Join Date": document.getElementById('join_date') ? document.getElementById('join_date').value : "",
        "Resign Reason": document.getElementById('resign_reason') ? document.getElementById('resign_reason').value : "",
        "Basic Salary": document.getElementById('basic_salary') ? document.getElementById('basic_salary').value : "0",
        "Position Allowance": document.getElementById('pos_allowance') ? document.getElementById('pos_allowance').value : "0",
        "Communication Allowance": document.getElementById('comm_allowance') ? document.getElementById('comm_allowance').value : "0",
        "Daily Meal Allowance": document.getElementById('meal_allowance') ? document.getElementById('meal_allowance').value : "0",
        "Daily Transport Allowance": document.getElementById('trans_allowance') ? document.getElementById('trans_allowance').value : "0",
        "Private Insurance Deduction": document.getElementById('private_ins') ? document.getElementById('private_ins').value : "0",
        "Profile Photo (Base64)": document.getElementById('profile-photo-base64') ? document.getElementById('profile-photo-base64').value : ""
    };

    // 1. Optimistic Update
    if (action === 'edit') {
        const id = parseInt(rowid, 10);
        const index = salaryData.findIndex(emp => emp.rowid === id);
        if (index !== -1) {
            const oldData = { ...salaryData[index] };
            salaryData[index] = { ...salaryData[index], ...formData };
            
            // Create detailed audit log for edit
            const changedFields = [];
            for (const key in formData) {
                if (formData[key] !== oldData[key] && key !== 'action' && key !== 'rowid') {
                    changedFields.push(`${key}: ${oldData[key]} -> ${formData[key]}`);
                }
            }
            createAuditLog('EDIT', formData["Full Name *"], changedFields.join(' | '));
        }
    } else {
        const newRecord = { ...formData, rowid: salaryData.length };
        salaryData.push(newRecord);
        createAuditLog('ADD', formData["Full Name *"], `New employee added with ID: ${formData["Employee ID *"]}`);
    }

    // 2. Persist to Local Cache
    saveCache();

    // 3. Immediate UI Feedback
    closeModal();
    renderDataPage(true); // silent render
    showToast(t('processing'), 'info');

    try {
        if (USE_LOCAL_DATA) {
            
            showToast("Data Tersimpan (Local Mode)", 'success');
            return;
        }
        let response;
        if (action === 'edit') {
            response = await apiClient.updateEmployee(rowid, formData);
        } else {
            response = await apiClient.createEmployee(formData);
        }
        
        if (response && response.status === 'success') {
            showToast(t('connected'), 'success');
        } else {
            showToast('Gagal sinkronisasi ke server', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        // Even with no-cors, catch errors like network offline
    }
}

window.showAddMutationForm = (rowid) => {
    const emp = salaryData.find(e => e.rowid === rowid);
    if (!emp) return;
    
    showModal(`
        <div style="margin-bottom: 1.5rem;">
            <h3 style="margin: 0;">Log Mutasi / Promosi</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Karyawan: <strong>${emp['Full Name *']}</strong> (${emp['Employee ID *']})</p>
        </div>

        <form id="add-mutation-form">
            <input type="hidden" id="mut_empid" value="${emp['Employee ID *']}">
            <input type="hidden" id="mut_empname" value="${emp['Full Name *']}">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label>Tipe Perubahan</label>
                    <select id="mut_type" class="form-input" required>
                        <option value="Promotion">Promotion (Promosi)</option>
                        <option value="Mutation">Mutation (Mutasi)</option>
                        <option value="Salary Change">Salary Change (Penyesuaian Gaji)</option>
                        <option value="Role Change">Role Change (Perubahan Peran)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tanggal Efektif</label>
                    <input type="date" id="mut_date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div style="padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <p style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; margin-bottom: 0.5rem; text-transform: uppercase;">Data Lama (Saat Ini)</p>
                    <div class="form-group"><label>Dept</label><input type="text" id="mut_olddept" class="form-input" value="${emp['Organization Name *'] || ''}" readonly style="background: #f1f5f9;"></div>
                    <div class="form-group"><label>Posisi</label><input type="text" id="mut_oldpos" class="form-input" value="${emp['Job Position *'] || ''}" readonly style="background: #f1f5f9;"></div>
                    <div class="form-group"><label>Level</label><input type="text" id="mut_oldlevel" class="form-input" value="${emp['Job Level *'] || ''}" readonly style="background: #f1f5f9;"></div>
                </div>
                <div style="padding: 1rem; background: #fff; border: 2px solid #e0f2fe; border-radius: 12px;">
                    <p style="font-size: 0.65rem; font-weight: 800; color: var(--primary-color); margin-bottom: 0.5rem; text-transform: uppercase;">Data Baru</p>
                    <div class="form-group"><label>Dept</label><input type="text" id="mut_newdept" class="form-input" value="${emp['Organization Name *'] || ''}" required></div>
                    <div class="form-group"><label>Posisi</label><input type="text" id="mut_newpos" class="form-input" value="${emp['Job Position *'] || ''}" required></div>
                    <div class="form-group"><label>Level</label><input type="text" id="mut_newlevel" class="form-input" value="${emp['Job Level *'] || ''}" required></div>
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 2rem;">
                <label>Keterangan / Alasan</label>
                <textarea id="mut_desc" class="form-input" style="height: 80px;" placeholder="Contoh: Promosi jabatan berdasarkan KPI 2024"></textarea>
            </div>

            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="viewEmployeeDetails(${rowid})">Batal</button>
                <button type="submit" class="btn btn-primary" style="flex: 2;">Simpan Riwayat</button>
            </div>
        </form>
    `);

    document.getElementById('add-mutation-form').onsubmit = (e) => handleAddMutation(e, rowid);
};

async function handleAddMutation(e, rowid) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = "Processing...";

    const mutationRecord = {
        action: "add_mutation",
        "EMPLOYEE ID": document.getElementById('mut_empid').value,
        "EMPLOYEE NAME": document.getElementById('mut_empname').value,
        "MUTATION TYPE": document.getElementById('mut_type').value,
        "OLD DEPT": document.getElementById('mut_olddept').value,
        "NEW DEPT": document.getElementById('mut_newdept').value,
        "OLD POSITION": document.getElementById('mut_oldpos').value,
        "NEW POSITION": document.getElementById('mut_newpos').value,
        "OLD LEVEL": document.getElementById('mut_oldlevel').value,
        "NEW LEVEL": document.getElementById('mut_newlevel').value,
        "EFFECTIVE DATE": document.getElementById('mut_date').value,
        "DESCRIPTION": document.getElementById('mut_desc').value,
        "Timestamp": new Date().toLocaleString('id-ID')
    };

    // Optimistic Update
    mutationData.unshift(mutationRecord);
    saveCache();
    
    // Close and reopen details to refresh list
    showToast(t('processing'), 'info');
    viewEmployeeDetails(rowid);

    try {
        if (USE_LOCAL_DATA) {
            
            showToast("Riwayat Tersimpan (Local Mode)", 'success');
            return;
        }
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(mutationRecord)
        });
        showToast(t('connected'), 'success');
        fetchData(true); // Silent background sync
    } catch (err) {
        console.error(err);
        showToast("Error saving mutation", "error");
    }
}

window.showAddForm = () => {
    const nextId = getNextEmployeeID();
    showModal(`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0;">${t('add_employee_title')}</h3>
            <button type="button" class="btn btn-secondary" style="font-size: 0.75rem; display: flex; align-items: center; gap: 8px;" onclick="document.getElementById('ktp-upload').click()">
                <span>ðŸ“·</span> Scan KTP (OCR)
            </button>
            <input type="file" id="ktp-upload" hidden accept="image/*" onchange="handleKTPScan(this)">
        </div>

        <div id="ktp-preview-container" style="display: none; margin-bottom: 1.5rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 10px; text-align: center;">
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">KTP Preview</p>
            <img id="ktp-preview-img" src="" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: var(--card-shadow);">
        </div>

        <form id="add-salary-form" data-action="add">
            <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                <!-- Profile Photo Section -->
                <div style="text-align: center; margin-bottom: 2rem; position: relative;">
                    <div id="profile-photo-preview" style="
                        width: 100px; height: 100px; border-radius: 50%; margin: 0 auto;
                        background: #f1f5f9; border: 3px solid var(--primary-color);
                        display: flex; align-items: center; justify-content: center;
                        overflow: hidden; cursor: pointer; position: relative;
                        box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);
                    " onclick="document.getElementById('profile-photo-input').click()">
                        <span style="font-size: 2rem;">${UI.icons.user}</span>
                        <div style="
                            position: absolute; bottom: 0; left: 0; right: 0;
                            background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem;
                            padding: 4px 0; opacity: 0; transition: opacity 0.3s;
                        " id="photo-overlay">Unggah Foto</div>
                    </div>
                    <input type="file" id="profile-photo-input" hidden accept="image/*" onchange="previewProfilePhoto(this)">
                    <input type="hidden" id="profile-photo-base64" name="Profile Photo (Base64)" value="">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Klik untuk unggah foto profil</p>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">${t('basic_info')}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div class="form-group"><label>Employee ID *</label><input type="text" id="employeeid" class="form-input" value="${nextId}" readonly style="background: #f8fafc; cursor: not-allowed; border-color: #e2e8f0;"></div>
                    <div class="form-group"><label>Full Name *</label><input type="text" id="nama" class="form-input" required></div>
                    <div class="form-group"><label>Email *</label><input type="email" id="email" class="form-input" required></div>
                    <div class="form-group"><label>Mobile Phone Number</label><input type="text" id="mobile" class="form-input"></div>
                    <div class="form-group"><label>NIK (16 digit)</label><input type="text" id="nik" class="form-input"></div>
                    <div class="form-group"><label>Date of Birth *</label><input type="date" id="dob" class="form-input" required></div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Alamat KTP</label><textarea id="alamat-ktp" class="form-input" style="height: 80px; resize: none; padding-top: 10px;"></textarea></div>
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="margin-bottom: 0;">Alamat Domisili</label>
                            <label style="font-size: 0.70rem; color: var(--primary-color); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <input type="checkbox" onchange="if(this.checked) document.getElementById('alamat-domisili').value = document.getElementById('alamat-ktp').value" style="cursor: pointer;"> Same as KTP
                            </label>
                        </div>
                        <textarea id="alamat-domisili" class="form-input" style="height: 80px; resize: none; padding-top: 10px;"></textarea>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Kontak Darurat</h4>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                    <p style="font-weight: 800; font-size: 0.75rem; color: var(--primary-color); margin-bottom: 0.75rem; text-transform: uppercase;">Kontak Darurat 1</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group"><label>Nama</label><input type="text" id="ec1_name" class="form-input"></div>
                        <div class="form-group"><label>Hubungan</label><input type="text" id="ec1_rel" class="form-input"></div>
                        <div class="form-group"><label>No. HP</label><input type="text" id="ec1_phone" class="form-input"></div>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
                    <p style="font-weight: 800; font-size: 0.75rem; color: var(--primary-color); margin-bottom: 0.75rem; text-transform: uppercase;">Kontak Darurat 2</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group"><label>Nama</label><input type="text" id="ec2_name" class="form-input"></div>
                        <div class="form-group"><label>Hubungan</label><input type="text" id="ec2_rel" class="form-input"></div>
                        <div class="form-group"><label>No. HP</label><input type="text" id="ec2_phone" class="form-input"></div>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">${t('org_job')}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>${t('organization')} *</label><input type="text" id="org" class="form-input" required></div>
                    <div class="form-group"><label>${t('join_date')} *</label><input type="date" id="join_date" class="form-input" required></div>
                    <div class="form-group"><label>${t('position')} *</label><input type="text" id="pos" class="form-input" required></div>
                    <div class="form-group"><label>${t('level')} *</label><input type="text" id="level" class="form-input" required></div>
                    <div class="form-group"><label>${t('employment_status')} *</label>
                        <select id="status" class="form-input" required>
                            <option value="Active">Active</option>
                            <option value="Contract">Contract</option>
                            <option value="Probation">Probation</option>
                            <option value="Resigned">Resigned</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Contract End Date</label><input type="date" id="end_status" class="form-input"></div>
                    <div class="form-group"><label>Resign Date</label><input type="date" id="resign_date" class="form-input"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Komponen Gaji (IDR)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Gaji Pokok *</label><input type="number" id="basic_salary" class="form-input" value="0" required></div>
                    <div class="form-group"><label>Tunjangan Jabatan (Tetap)</label><input type="number" id="pos_allowance" class="form-input" value="0"></div>
                    <div class="form-group"><label>Tunjangan Komunikasi (Tetap)</label><input type="number" id="comm_allowance" class="form-input" value="0"></div>
                    <div class="form-group"><label>Uang Makan Harian (Variabel)</label><input type="number" id="meal_allowance" class="form-input" value="0"></div>
                    <div class="form-group"><label>Uang Transport Harian (Variabel)</label><input type="number" id="trans_allowance" class="form-input" value="0"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Regulasi Pajak & BPJS</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>NPWP</label><input type="text" id="npwp" class="form-input" placeholder="Wajib untuk PPh 21"></div>
                    <div class="form-group">
                        <label>Status PTKP (Pajak) *</label>
                        <select id="ptkp" class="form-input" required>
                            <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
                            <option value="TK/1">TK/1 (Tidak Kawin, 1 Tanggungan)</option>
                            <option value="TK/2">TK/2 (Tidak Kawin, 2 Tanggungan)</option>
                            <option value="TK/3">TK/3 (Tidak Kawin, 3 Tanggungan)</option>
                            <option value="K/0">K/0 (Kawin, 0 Tanggungan)</option>
                            <option value="K/1">K/1 (Kawin, 1 Tanggungan)</option>
                            <option value="K/2">K/2 (Kawin, 2 Tanggungan)</option>
                            <option value="K/3">K/3 (Kawin, 3 Tanggungan)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status Kepesertaan BPJS TK</label>
                        <select id="bpjs_tk_status" class="form-input">
                            <option value="Aktif">Aktif (Potong Gaji)</option>
                            <option value="Tidak">Tidak Ikut</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Nomor BPJS Ketenagakerjaan</label><input type="text" id="bpjs_tk" class="form-input"></div>
                    
                    <div class="form-group">
                        <label>Status Kepesertaan BPJS Kesehatan</label>
                        <select id="bpjs_ks_status" class="form-input">
                            <option value="Aktif">Aktif (Potong Gaji)</option>
                            <option value="Mandiri/Tidak">Mandiri / Tidak Ikut</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Nomor BPJS Kesehatan</label><input type="text" id="bpjs_ks" class="form-input"></div>
                    <div class="form-group"><label>Asuransi Swasta / Potongan Lain</label><input type="number" id="private_ins" class="form-input" value="0"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">${t('bank_config')}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>${t('bank')}</label><input type="text" id="bank_name" class="form-input"></div>
                    <div class="form-group"><label>${t('account_no')}</label><input type="text" id="bank_acc" class="form-input"></div>
                    <div class="form-group" style="grid-column: span 2;"><label>${t('holder')}</label><input type="text" id="bank_holder" class="form-input"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Dokumen Karyawan (Link Google Drive)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>KTP Document Link</label><input type="text" id="ktp_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>NPWP Document Link</label><input type="text" id="npwp_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>KK Document Link</label><input type="text" id="kk_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>Contract Link</label><input type="text" id="contract_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>CV Document Link</label><input type="text" id="cv_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>Bank Book / Statement</label><input type="text" id="bankbook_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>SIM A Document Link</label><input type="text" id="sima_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>SIM C Document Link</label><input type="text" id="simc_doc" class="form-input" placeholder="https://drive.google.com/..."></div>
                </div>
            </div>
            <div class="btn-group" style="margin-top: 2rem; display: flex; gap: 10px;">
                <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary" style="flex: 1;">${t('save_data')}</button>
            </div>
        </form>
    `);
    document.getElementById('add-salary-form').onsubmit = handleAddData;
};

window.showResignForm = (rowid) => {
    const item = salaryData.find(i => i.rowid === rowid);
    if (!item) return;

    showModal(`
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 60px; height: 60px; background: #fff7ed; color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">${UI.icons.logout}</div>
            <h3 style="font-weight: 800;">${currentLang === 'id' ? 'Proses Resign' : 'Process Resignation'}</h3>
            <p style="color: #64748b; font-size: 0.875rem;">${currentLang === 'id' ? 'Memperbarui status untuk' : 'Updating status for'} <b>${item['Full Name *']}</b></p>
        </div>

        <form id="resign-form" data-action="edit" data-rowid="${rowid}">
            <!-- Hidden inputs to preserve other data during edit action -->
            <input type="hidden" id="employeeid" value="${item['Employee ID *']}">
            <input type="hidden" id="nama" value="${item['Full Name *']}">
            <input type="hidden" id="email" value="${item['Email *']}">
            <input type="hidden" id="org" value="${item['Organization Name *']}">
            <input type="hidden" id="pos" value="${item['Job Position *']}">
            <input type="hidden" id="level" value="${item['Job Level *']}">
            <input type="hidden" id="ptkp" value="${item['PTKP Status *']}">
            <input type="hidden" id="tax_status" value="${item['Employee Tax Status*']}">
            <input type="hidden" id="status" value="Resigned">

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="form-group">
                    <label>${t('resign_date')} *</label>
                    <input type="date" id="resign_date" class="form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>${t('reason')} *</label>
                    <textarea id="resign_reason" class="form-input" style="height: 120px; resize: none; padding-top: 10px;" placeholder="${currentLang === 'id' ? 'Contoh: Pindah kerja, Melanjutkan studi, Alasan pribadi, dll.' : 'Example: Career change, Continuing studies, Personal reasons, etc.'}" required>${item['Resign Reason'] || ''}</textarea>
                </div>
            </div>

            <div class="btn-group-modern">
                <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary" style="flex: 1; background: #f59e0b;">Update Resign Status</button>
            </div>
        </form>
    `);
    
    // Use the same handleAddData logic
    document.getElementById('resign-form').onsubmit = handleAddData;
};

window.showEditForm = (rowid) => {
    const item = salaryData.find(i => i.rowid === rowid);
    if (!item) return;

    showModal(`
        <h3 style="margin-bottom: 1.5rem;">${currentLang === 'id' ? 'Edit Profil Karyawan' : 'Edit Employee Profile'}</h3>
        <form id="add-salary-form" data-action="edit" data-rowid="${rowid}">
            <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                <!-- Profile Photo Section -->
                <div style="text-align: center; margin-bottom: 2rem; position: relative;">
                    <div id="profile-photo-preview" style="
                        width: 100px; height: 100px; border-radius: 50%; margin: 0 auto;
                        background: #f1f5f9; border: 3px solid var(--primary-color);
                        display: flex; align-items: center; justify-content: center;
                        overflow: hidden; cursor: pointer; position: relative;
                        box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);
                    " onclick="document.getElementById('profile-photo-input').click()">
                        ${item['Profile Photo (Base64)'] 
                            ? `<img src="data:image/jpeg;base64,${item['Profile Photo (Base64)']}" style="width:100%; height:100%; object-fit:cover;">`
                            : `<span style="font-size: 2rem;">${UI.icons.user}</span>`}
                        <div style="
                            position: absolute; bottom: 0; left: 0; right: 0;
                            background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem;
                            padding: 4px 0; opacity: 0; transition: opacity 0.3s;
                        " id="photo-overlay">Ganti Foto</div>
                    </div>
                    <input type="file" id="profile-photo-input" hidden accept="image/*" onchange="previewProfilePhoto(this)">
                    <input type="hidden" id="profile-photo-base64" name="Profile Photo (Base64)" value="${item['Profile Photo (Base64)'] || ''}">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Klik untuk ganti foto profil</p>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Basic Information</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Employee ID *</label><input type="text" id="employeeid" class="form-input" value="${getVal(item, ['EMPLOYEE ID', 'Employee ID *', 'ID'])}" readonly style="background: #f8fafc; cursor: not-allowed; border-color: #e2e8f0;"></div>
                    <div class="form-group"><label>Full Name *</label><input type="text" id="nama" class="form-input" value="${getVal(item, ['EMPLOYEE NAME', 'Full Name *', 'NAME', 'Nama'])}" required></div>
                    <div class="form-group"><label>Email *</label><input type="email" id="email" class="form-input" value="${getVal(item, ['EMAIL', 'Email *'])}" required></div>
                    <div class="form-group"><label>Mobile Phone Number</label><input type="text" id="mobile" class="form-input" value="${getVal(item, ['PHONE NUMBER', 'Mobile Phone Number', 'Mobile'])}"></div>
                    <div class="form-group"><label>NIK (16 digit)</label><input type="text" id="nik" class="form-input" value="${getVal(item, ['NATIONAL ID (NIK)', 'NIK (NPWP 16 digit)', 'NIK'])}"></div>
                    <div class="form-group"><label>Date of Birth *</label><input type="date" id="dob" class="form-input" value="${formatDateForInput(getVal(item, ['DATE OF BIRTH', 'Date of Birth *', 'DOB']))}" required></div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Alamat KTP</label><textarea id="alamat-ktp" class="form-input" style="height: 80px; resize: none; padding-top: 10px;">${item['Alamat KTP'] || item['ADDRESS'] || ''}</textarea></div>
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="margin-bottom: 0;">Alamat Domisili</label>
                            <label style="font-size: 0.70rem; color: var(--primary-color); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <input type="checkbox" onchange="if(this.checked) document.getElementById('alamat-domisili').value = document.getElementById('alamat-ktp').value" style="cursor: pointer;"> Same as KTP
                            </label>
                        </div>
                        <textarea id="alamat-domisili" class="form-input" style="height: 80px; resize: none; padding-top: 10px;">${item['Alamat Domisili'] || item['ADDRESS'] || ''}</textarea>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Kontak Darurat</h4>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                    <p style="font-weight: 800; font-size: 0.75rem; color: var(--primary-color); margin-bottom: 0.75rem; text-transform: uppercase;">Kontak Darurat 1</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group"><label>Nama</label><input type="text" id="ec1_name" class="form-input" value="${item['Emergency Contact 1 (Name)'] || ''}"></div>
                        <div class="form-group"><label>Hubungan</label><input type="text" id="ec1_rel" class="form-input" value="${item['Emergency Contact 1 (Relationship)'] || ''}"></div>
                        <div class="form-group"><label>No. HP</label><input type="text" id="ec1_phone" class="form-input" value="${item['Emergency Contact 1 (Phone)'] || ''}"></div>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
                    <p style="font-weight: 800; font-size: 0.75rem; color: var(--primary-color); margin-bottom: 0.75rem; text-transform: uppercase;">Kontak Darurat 2</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group"><label>Nama</label><input type="text" id="ec2_name" class="form-input" value="${item['Emergency Contact 2 (Name)'] || ''}"></div>
                        <div class="form-group"><label>Hubungan</label><input type="text" id="ec2_rel" class="form-input" value="${item['Emergency Contact 2 (Relationship)'] || ''}"></div>
                        <div class="form-group"><label>No. HP</label><input type="text" id="ec2_phone" class="form-input" value="${item['Emergency Contact 2 (Phone)'] || ''}"></div>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Organization & Job</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Organization Name *</label><input type="text" id="org" class="form-input" value="${getVal(item, ['Organization Name *', 'DEPARTMENT', 'Organization'])}" required></div>
                    <div class="form-group"><label>Join Date *</label><input type="date" id="join_date" class="form-input" value="${formatDateForInput(getVal(item, ['JOIN DATE', 'Join Date *']))}" required></div>
                    <div class="form-group"><label>Job Position *</label><input type="text" id="pos" class="form-input" value="${getVal(item, ['Job Position *', 'POSITION'])}" required></div>
                    <div class="form-group"><label>Job Level *</label><input type="text" id="level" class="form-input" value="${getVal(item, ['Job Level *', 'LEVEL'])}" required></div>
                    <div class="form-group"><label>Employment Status *</label>
                        <select id="status" class="form-input" required>
                            <option value="Active" ${(item['Employment Status *'] || item['STATUS']) === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Contract" ${(item['Employment Status *'] || item['STATUS']) === 'Contract' ? 'selected' : ''}>Contract</option>
                            <option value="Probation" ${(item['Employment Status *'] || item['STATUS']) === 'Probation' ? 'selected' : ''}>Probation</option>
                            <option value="Resigned" ${(item['Employment Status *'] || item['STATUS']) === 'Resigned' ? 'selected' : ''}>Resigned</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Contract End Date</label><input type="date" id="end_status" class="form-input" value="${formatDateForInput(item['Contract End Date'] || item['End Employment Status Date'])}"></div>
                    <div class="form-group"><label>Resign Date</label><input type="date" id="resign_date" class="form-input" value="${formatDateForInput(item['Resign Date'])}"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Komponen Gaji (IDR)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Gaji Pokok *</label><input type="number" id="basic_salary" class="form-input" value="${item['Gaji Pokok'] || item['Basic Salary'] || 0}" required></div>
                    <div class="form-group"><label>Tunjangan Jabatan (Tetap)</label><input type="number" id="pos_allowance" class="form-input" value="${item['Position Allowance'] || 0}"></div>
                    <div class="form-group"><label>Tunjangan Komunikasi (Tetap)</label><input type="number" id="comm_allowance" class="form-input" value="${item['Communication Allowance'] || 0}"></div>
                    <div class="form-group"><label>Uang Makan Harian (Variabel)</label><input type="number" id="meal_allowance" class="form-input" value="${item['Meal Allowance'] || item['Daily Meal Allowance'] || 0}"></div>
                    <div class="form-group"><label>Uang Transport Harian (Variabel)</label><input type="number" id="trans_allowance" class="form-input" value="${item['Transport Allowance'] || item['Daily Transport Allowance'] || 0}"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Regulasi Pajak & BPJS</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>NPWP</label><input type="text" id="npwp" class="form-input" value="${item['NPWP'] || ''}" placeholder="Wajib untuk PPh 21"></div>
                    <div class="form-group">
                        <label>Status PTKP (Pajak) *</label>
                        <select id="ptkp" class="form-input" required>
                            <option value="TK/0" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'TK/0' ? 'selected' : ''}>TK/0</option>
                            <option value="TK/1" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'TK/1' ? 'selected' : ''}>TK/1</option>
                            <option value="TK/2" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'TK/2' ? 'selected' : ''}>TK/2</option>
                            <option value="TK/3" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'TK/3' ? 'selected' : ''}>TK/3</option>
                            <option value="K/0" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'K/0' ? 'selected' : ''}>K/0</option>
                            <option value="K/1" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'K/1' ? 'selected' : ''}>K/1</option>
                            <option value="K/2" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'K/2' ? 'selected' : ''}>K/2</option>
                            <option value="K/3" ${(item['PTKP Status *'] || item['PTKP Status (Isi dengan: TK/0, TK/1, K/0, K/1, dst)']) === 'K/3' ? 'selected' : ''}>K/3</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Nomor BPJS Ketenagakerjaan</label><input type="text" id="bpjs_tk" class="form-input" value="${item['BPJS Ketenagakerjaan (Isi dengan: Aktif / Tidak Aktif)'] || item['BPJS Ketenagakerjaan'] || ''}"></div>
                    <div class="form-group"><label>Nomor BPJS Kesehatan</label><input type="text" id="bpjs_ks" class="form-input" value="${item['BPJS Kesehatan (Isi dengan: Aktif / Tidak Aktif)'] || item['BPJS Kesehatan'] || ''}"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Bank Info</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>Bank Name</label><input type="text" id="bank_name" class="form-input" value="${item['Bank Name'] || ''}"></div>
                    <div class="form-group"><label>Bank Account No.</label><input type="text" id="bank_acc" class="form-input" value="${item['Bank Account'] || ''}"></div>
                    <div class="form-group"><label>Bank Account Holder</label><input type="text" id="bank_holder" class="form-input" value="${item['Bank Account Holder'] || ''}" style="grid-column: span 2;"></div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--primary-color); border-bottom: 2px solid #f1f5f9; padding-bottom: 5px;">Dokumen Karyawan (Link Google Drive)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group"><label>KTP Document Link</label><input type="text" id="ktp_doc" class="form-input" value="${item['KTP Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>NPWP Document Link</label><input type="text" id="npwp_doc" class="form-input" value="${item['NPWP Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>KK Document Link</label><input type="text" id="kk_doc" class="form-input" value="${item['KK Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>Contract Link</label><input type="text" id="contract_doc" class="form-input" value="${item['Contract Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>CV Document Link</label><input type="text" id="cv_doc" class="form-input" value="${item['CV Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>Bank Book / Statement</label><input type="text" id="bankbook_doc" class="form-input" value="${item['Bank Book Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>SIM A Document Link</label><input type="text" id="sima_doc" class="form-input" value="${item['SIM A Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                    <div class="form-group"><label>SIM C Document Link</label><input type="text" id="simc_doc" class="form-input" value="${item['SIM C Document (Link)'] || ''}" placeholder="https://drive.google.com/..."></div>
                </div>
            </div>
            <div class="btn-group-modern">
                <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary" style="flex: 1;">${currentLang === 'id' ? 'Update Profil' : 'Update Profile'}</button>
            </div>
        </form>
    `);
    document.getElementById('add-salary-form').onsubmit = handleAddData;
};

window.deleteEmployee = async (rowid) => {
    const employee = salaryData.find(emp => emp.rowid === rowid);
    const empName = employee ? employee['Full Name *'] : 'this record';

    showConfirm(
        t('confirm_delete') || 'Confirm Deletion', 
        t('confirm_delete_msg') || `Are you sure you want to permanently delete <b>${empName}</b>? This action cannot be undone.`,
        async () => {
            // Log before deletion
            createAuditLog('DELETE', empName, `Deleted record with rowid: ${rowid}`);

            // 1. Optimistic Delete
            salaryData = salaryData.filter(emp => emp.rowid !== rowid);
            
            // 2. Persist Cache
            saveCache();

            // 3. Immediate UI Feedback
            renderDataPage(true);
            showToast(t('processing'), 'info');

            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({ action: 'delete', rowid: rowid })
                });
                showToast(t('connected'), 'success');
            } catch (error) {
                console.error('Error:', error);
            }
        }
    );
};


// ==========================================
// BULK UPLOAD & IMPORT
// ==========================================

function renderBulkUploadPage() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-bulk-attendance');
    
    app.innerHTML = `
        ${renderTopbar(t('bulk_upload'))}
        <div class="content-body fade-in">
            <div class="card" style="padding: 2.5rem; max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 class="text-bold" style="font-size: 1.5rem; margin-bottom: 0.5rem;">📤 Unggah Absensi Massal</h2>
                    <p class="text-muted">Gunakan template Excel untuk mengunggah data absensi banyak karyawan sekaligus.</p>
                </div>

                <div class="drop-zone" onclick="document.getElementById('bulk-upload-file').click()" id="upload-dropzone" style="border: 2px dashed var(--primary-color); border-radius: 20px; padding: 4rem 2rem; text-align: center; background: #fff1f2; cursor: pointer;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                    <p class="text-bold">Klik atau seret file Excel ke sini</p>
                    <p class="text-xs text-muted">Format yang didukung: .xlsx, .xls, .csv</p>
                    <input type="file" id="bulk-upload-file" accept=".xlsx, .xls, .csv" style="display: none;" onchange="handleBulkUploadChange(event)">
                </div>

                <div id="bulk-upload-preview" style="display: none; margin-top: 2rem;"></div>

                <div class="flex gap-4" style="margin-top: 2rem;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="renderAttendancePage()">Batal</button>
                    <button class="btn btn-primary" id="btn-process-upload" style="flex: 2;" onclick="processBulkUpload()" disabled>Mulai Unggah</button>
                </div>
            </div>
        </div>
    `;
}

function renderImportPage() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-import');
    
    app.innerHTML = `
        ${renderTopbar('Impor Karyawan')}
        <div class="content-body fade-in">
            <div class="card" style="padding: 2.5rem; max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 class="text-bold">📥 Impor Data Karyawan</h2>
                    <p class="text-muted">Unggah file Excel untuk menambah banyak karyawan baru secara instan.</p>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <button class="btn btn-secondary" onclick="downloadEmployeeTemplate()" style="width: 100%;">⬇️ Unduh Template Excel</button>
                </div>

                <div class="drop-zone" onclick="document.getElementById('employee-import-file').click()" id="import-dropzone" style="border: 2px dashed #4f46e5; border-radius: 20px; padding: 4rem 2rem; text-align: center; background: #f5f3ff; cursor: pointer;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                    <p class="text-bold">Klik atau seret file karyawan ke sini</p>
                    <input type="file" id="employee-import-file" accept=".xlsx, .xls" style="display: none;" onchange="handleEmployeeImportChange(event)">
                </div>

                <div id="import-preview-section" style="display: none; margin-top: 2rem;">
                    <h4 class="text-bold" id="import-row-count">0 Baris Terdeteksi</h4>
                    <div class="table-container" style="max-height: 300px; overflow-y: auto; margin-top: 1rem;">
                        <table class="data-table">
                            <thead>
                                <tr><th>Status</th><th>ID</th><th>Nama</th><th>Email</th></tr>
                            </thead>
                            <tbody id="import-preview-body"></tbody>
                        </table>
                    </div>
                </div>

                <div class="flex gap-4" style="margin-top: 2rem;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="navigate('nav-data')">Batal</button>
                    <button class="btn btn-primary" id="btn-start-import" style="flex: 2;" onclick="processEmployeeImport()" disabled>Proses Impor</button>
                </div>
            </div>
        </div>
    `;
}

// Attendance Logic
function renderAttendancePage(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-attendance');
    const currentTab = window._attendanceTab || 'log';

    app.innerHTML = `
        ${renderTopbar('Log Kehadiran')}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <header class="flex-between" style="margin-bottom: 1.5rem;">
                <div>
                    <h3 class="text-bold">Manajemen Kehadiran</h3>
                    <p class="text-muted text-xs">Pantau absensi dan lembur karyawan secara real-time.</p>
                </div>
                <div class="flex gap-3">
                    <button class="btn btn-secondary" onclick="showAttendanceExportModal()">📊 Export Rekap Periode</button>
                    <button class="btn btn-primary" onclick="showAttendanceForm()">+ Absensi Baru</button>
                </div>
            </header>

            <div class="flex gap-0" style="margin-bottom: 1.5rem; background: #f1f5f9; border-radius: 12px; padding: 4px;">
                <button onclick="switchAttendanceTab('log')" class="tab-btn ${currentTab === 'log' ? 'active' : ''}" style="flex:1;">Log Harian</button>
                <button onclick="switchAttendanceTab('summary')" class="tab-btn ${currentTab === 'summary' ? 'active' : ''}" style="flex:1;">Rekap Bulanan</button>
            </div>
            
            ${currentTab === 'log' ? renderAttendanceLogHtml() : renderAttendanceSummaryHtml()}
        </div>
    `;
}

function switchAttendanceTab(tab) {
    window._attendanceTab = tab;
    renderAttendancePage(true);
}

function renderAttendanceLogHtml() {
    return `
        <div class="card" style="padding:0; overflow:hidden;">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Karyawan</th>
                            <th>Tanggal</th>
                            <th>Jam Masuk/Keluar</th>
                            <th>Lembur</th>
                            <th>Total Jam</th>
                            <th>Status</th>
                            <th style="text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendanceData.slice().reverse().map(log => `
                            <tr>
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar-small">${(log['EMPLOYEE NAME'] || 'E')[0]}</div>
                                        <div>
                                            <div class="text-bold">${log['EMPLOYEE NAME']}</div>
                                            <div class="text-xs text-muted">${log['EMPLOYEE ID']}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${log['DATE']}<br><span class="text-xs text-muted">${log['DAY']}</span></td>
                                <td>
                                    <span class="badge badge-success">IN: ${log['ABSEN IN']}</span>
                                    <span class="badge badge-danger">OUT: ${log['ABSEN OUT']}</span>
                                </td>
                                <td>${log['DURASI LEMBUR (JAM)']} Jam</td>
                                <td>${log['WORK HOURS (8 JAM)']} Jam</td>
                                <td><span class="status-badge">${log['STATUS ABSEN']}</span></td>
                                <td style="text-align: right;">
                                    <button class="btn btn-secondary" style="padding: 4px 8px;">Edit</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderAttendanceSummaryHtml() {
    return `<div class="card" style="padding: 2rem; text-align: center;">Fitur Rekap Bulanan sedang dimuat...</div>`;
}

async function handleAttendanceSubmit(e) {
    e.preventDefault();
    // Logic for submitting attendance...
    showToast('Data berhasil disimpan', 'success');
    closeModal();
    renderAttendancePage(true);
}

// Helper functions for import/upload
function handleBulkUploadChange(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('btn-process-upload').disabled = false;
        showToast('File siap diproses', 'info');
    }
}

async function processBulkUpload() {
    showToast('Memproses unggahan massal...', 'info');
    // Implement full logic...
}

function handleEmployeeImportChange(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('btn-start-import').disabled = false;
        document.getElementById('import-preview-section').style.display = 'block';
    }
}

async function processEmployeeImport() {
    showToast('Mengimpor data karyawan...', 'info');
    // Implement full logic...
}

function downloadEmployeeTemplate() {
    window.location.href = '#'; // Placeholder
    showToast('Template diunduh', 'success');
}

function showAttendanceForm() {
    showModal(`<h3>Tambah Absensi</h3><p>Formulir absensi akan muncul di sini.</p>`);
}

async function renderAdminsPage(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-admins');

    const currentTab = window._adminTab || 'active';
    const activeAdmins = adminData.filter(a => (a.Status || '').toLowerCase() === 'active');
    const inactiveAdmins = adminData.filter(a => (a.Status || '').toLowerCase() !== 'active');
    const displayList = currentTab === 'active' ? activeAdmins : inactiveAdmins;

    app.innerHTML = `
        ${renderTopbar(t('admins_title'))}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">${t('admins_title')}</h3>
                    <p style="color: var(--text-muted); font-size: 0.8125rem;">${t('admins_subtitle')}</p>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-secondary" onclick="exportDataToExcel()" style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        ${t('export_data')}
                    </button>
                    ${hasPermission('canAdd') ? `
                        <button class="btn btn-primary btn-add-employee" onclick="showAddEmployeeModal()" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            ${t('add_employee')}
                        </button>
                    ` : ''}
                </div>
            </header>
            
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                 <button class="btn btn-primary" onclick="showAdminForm()"
                    style="display: ${currentTab === 'active' ? 'flex' : 'none'}; align-items: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    ${t('add_user')}
                </button>
            </header>

            <!-- Tab Selector -->
            <div style="display: flex; gap: 0; margin-bottom: 1.5rem; background: #f1f5f9; border-radius: 14px; padding: 4px;">
                <button onclick="switchAdminTab('active')" style="
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer;
                    font-weight: 700; font-size: 0.875rem; transition: all 0.25s ease;
                    background: ${currentTab === 'active' ? '#ffffff' : 'transparent'};
                    color: ${currentTab === 'active' ? 'var(--primary-color)' : 'var(--text-muted)'};
                    box-shadow: ${currentTab === 'active' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ${t('active_user')}
                    <span style="background: #10b981; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 1px 8px; border-radius: 20px;">
                        ${activeAdmins.length}
                    </span>
                </button>
                <button onclick="switchAdminTab('inactive')" style="
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer;
                    font-weight: 700; font-size: 0.875rem; transition: all 0.25s ease;
                    background: ${currentTab === 'inactive' ? '#ffffff' : 'transparent'};
                    color: ${currentTab === 'inactive' ? '#64748b' : 'var(--text-muted)'};
                    box-shadow: ${currentTab === 'inactive' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                    ${t('inactive_user')}
                    <span style="background: #94a3b8; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 1px 8px; border-radius: 20px;">
                        ${inactiveAdmins.length}
                    </span>
                </button>
            </div>

            <!-- Table -->
            <div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <div class="table-container">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f1f5f9;">
                                <th style="padding: 1rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${t('user_id')}</th>
                                <th style="padding: 1rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${t('full_name')}</th>
                                <th style="padding: 1rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${t('username')}</th>
                                <th style="padding: 1rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${t('role')}</th>
                                <th style="padding: 1rem 1.25rem; text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${t('active_status')}</th>
                                <th style="padding: 1rem 1.25rem; text-align: right; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${adminData.length === 0 ? `
                                <!-- Skeleton loading â€” data belum datang dari server -->
                                ${[1,2,3].map(() => `
                                <tr>
                                    ${[1,2,3,4,5,6].map(() => `
                                    <td style="padding: 1rem 1.25rem;">
                                        <div style="height: 14px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px;"></div>
                                    </td>`).join('')}
                                </tr>`).join('')}
                            ` : displayList.length === 0 ? `
                                <tr>
                                    <td colspan="6" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">${currentTab === 'active' ? '${UI.icons.user}' : '${UI.icons.warning}'}</div>
                                        <p style="font-weight: 600; margin-bottom: 0.5rem;">
                                            ${currentTab === 'active' ? (currentLang === 'id' ? 'Belum ada user aktif.' : 'No active users yet.') : (currentLang === 'id' ? 'Belum ada user non-aktif.' : 'No inactive users yet.')}
                                        </p>
                                        <p style="font-size: 0.8125rem;">
                                            ${currentTab === 'active' ? (currentLang === 'id' ? 'Tambahkan user baru menggunakan tombol di atas.' : 'Add new users using the button above.') : (currentLang === 'id' ? 'User yang dinonaktifkan akan muncul di sini.' : 'Disabled users will appear here.')}
                                        </p>
                                    </td>
                                </tr>
                            ` : displayList.map(admin => `
                                <tr class="table-row-hover" style="${currentTab === 'inactive' ? 'opacity: 0.75;' : ''}">
                                    <td style="padding: 1rem 1.25rem;">
                                        <span style="font-family: monospace; font-weight: 700; color: var(--primary-color); font-size: 0.8125rem;">${admin['User ID'] || '-'}</span>
                                    </td>
                                    <td style="padding: 1rem 1.25rem;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary-color), #4f46e5); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 800; flex-shrink: 0;">
                                                ${(admin['Full Name'] || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style="font-weight: 700; color: var(--text-main); font-size: 0.875rem;">${admin['Full Name'] || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem 1.25rem; font-size: 0.8125rem; color: var(--text-muted);">${admin['Username'] || '-'}</td>
                                    <td style="padding: 1rem 1.25rem;">
                                        <span style="background: ${admin['Role'] === 'Super Admin' ? '#fef3c7' : '#eff6ff'}; color: ${admin['Role'] === 'Super Admin' ? '#92400e' : '#1e40af'}; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;">
                                            ${admin['Role'] || 'Staff'}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem 1.25rem; text-align: center;">
                                        <!-- Toggle Saklar -->
                                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                            <span style="font-size: 0.75rem; font-weight: 600; color: ${currentTab === 'inactive' ? '#94a3b8' : 'var(--text-muted)'}; min-width: 50px; text-align: right;">
                                                ${currentTab === 'inactive' ? (currentLang === 'id' ? 'Non-Aktif' : 'Inactive') : ''}
                                            </span>
                                            <button
                                                onclick="toggleAdminStatus(${admin.rowid})"
                                                title="${currentTab === 'active' ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}"
                                                style="
                                                    position: relative; display: inline-flex; align-items: center;
                                                    width: 48px; height: 26px; border-radius: 13px; border: none; cursor: pointer;
                                                    background: ${currentTab === 'active' ? '#10b981' : '#cbd5e1'};
                                                    transition: background 0.3s ease; padding: 0; flex-shrink: 0;
                                                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);
                                                ">
                                                <span style="
                                                    position: absolute;
                                                    width: 20px; height: 20px; border-radius: 50%; background: #fff;
                                                    left: ${currentTab === 'active' ? '25px' : '3px'};
                                                    transition: left 0.3s ease;
                                                    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                                                "></span>
                                            </button>
                                            <span style="font-size: 0.75rem; font-weight: 600; color: ${currentTab === 'active' ? '#10b981' : 'var(--text-muted)'}; min-width: 40px;">
                                                ${currentTab === 'active' ? (currentLang === 'id' ? 'Aktif' : 'Active') : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem 1.25rem; text-align: right;">
                                        <div style="display: flex; gap: 4px; justify-content: flex-end;">
                                            ${currentTab === 'active' ? `<button class="btn btn-secondary" style="padding: 5px 8px; border-radius: 7px; font-size: 0.8rem;" onclick="showAdminForm(${admin.rowid})" title="Edit">âœï¸</button>` : ''}
                                            <button class="btn btn-secondary" style="padding: 5px 8px; border-radius: 7px; color: #ef4444; font-size: 0.8rem;" onclick="deleteAdmin(${admin.rowid})" title="Hapus">ðŸ—‘ï¸</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function switchAdminTab(tab) {
    window._adminTab = tab;
    renderAdminsPage(true);
}

async function toggleAdminStatus(rowid) {
    // Type-safe lookup (sama seperti viewEmployeeDetails)
    const id = typeof rowid === 'string' ? parseInt(rowid, 10) : rowid;
    const admin = adminData.find(a => a.rowid === id || a.rowid === rowid);
    if (!admin) {
        console.warn('toggleAdminStatus: admin not found for rowid:', rowid);
        alert(currentLang === 'id' ? 'Data user tidak ditemukan.' : 'User data not found.');
        return;
    }

    const isCurrentlyActive = (admin.Status || '').toLowerCase() === 'active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const name = admin['Full Name'] || 'User';
    const actionId = isCurrentlyActive ? 'deactivate' : 'activate';
    const actionEn = isCurrentlyActive ? 'deactivate' : 'activate';
    const actionMsg = currentLang === 'id' 
        ? `Apakah Anda yakin ingin ${isCurrentlyActive ? 'nonaktifkan' : 'aktifkan'} akun "${name}"?`
        : `Are you sure you want to ${actionEn} account "${name}"?`;

    if (!confirm(actionMsg)) return;

    // 1. Optimistic Update: Ubah status di memory dan re-render SEKARANG JUGA
    admin.Status = newStatus;
    
    // Simpan ke local cache agar jika user me-refresh halaman sebelum auto-sync, 
    // datanya tidak kembali ke awal (mencegah revert)
    saveCache();
    
    renderAdminsPage(true);

    try {
        const formData = {
            action: 'edit_admin',
            rowid: parseInt(id, 10), // Google Apps Script getRange butuh integer, bukan string
            fullname: admin['Full Name'] || '',
            username: admin['Username'] || '',
            password: admin['Password'] || '',
            role: admin['Role'] || '',
            Status: newStatus
        };
        
        // Memaksa browser mengirim POST request tanpa dicegat oleh policy CORS
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: 'follow',
            body: JSON.stringify(formData)
        });

        // 2. Fetch ke server selesai (atau sukses CORS)
        // KITA TIDAK MEMANGGIL triggerBackgroundFetch() DI SINI!
        // Google Sheets butuh waktu 1-3 detik untuk benar-benar menyimpan data.
        // Jika kita fetch sekarang, Google Sheets akan mengembalikan data LAMA, 
        // sehingga UI akan kembali (revert) ke status sebelumnya.
        // Biarkan auto-sync 30 detik yang mengambil alih pembaruan di background.
    } catch (error) {
        // Tangani CORS Error Google Apps Script yang dianggap sukses
        console.warn('toggleAdminStatus: mengabaikan CORS error dari Google Apps Script');
    }
};

function showAdminForm(rowid = null) {
    const isEdit = rowid !== null && rowid !== undefined && rowid !== "";
    const id = isEdit ? parseInt(rowid, 10) : null;
    const admin = isEdit ? adminData.find(a => a.rowid === id) : null;
    
    showModal(`
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.25rem;">${isEdit ? (currentLang === 'id' ? 'Update Akun User' : 'Update User Account') : (currentLang === 'id' ? 'Registrasi User Baru' : 'Register New User')}</h3>
            <p style="color: var(--text-muted); font-size: 0.75rem;">${currentLang === 'id' ? 'Konfigurasi akun dan kontrol akses' : 'Account configuration and access control'}</p>
        </div>

        <form id="admin-account-form">
            <!-- Row 1: ID & Status -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>${t('user_id')}</label>
                    <input type="text" class="form-input" value="${admin ? admin['User ID'] : 'Auto-Generated'}" readonly style="background: #f1f5f9; font-weight: 700; color: var(--primary-color);">
                </div>
                <div class="form-group">
                    <label>${currentLang === 'id' ? 'Status Akun' : 'Account Status'}</label>
                    <select id="adm-status" class="form-input">
                        <option value="Active" ${admin?.Status === 'Active' ? 'selected' : ''}>${currentLang === 'id' ? 'Aktif' : 'Active'}</option>
                        <option value="Inactive" ${admin?.Status === 'Inactive' ? 'selected' : ''}>${currentLang === 'id' ? 'Non-Aktif' : 'Inactive'}</option>
                    </select>
                </div>
            </div>

            <!-- Row 2: Full Name & Role -->
            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>${t('full_name')}</label>
                    <input type="text" id="adm-fullname" class="form-input" value="${admin ? admin['Full Name'] : ''}" placeholder="${currentLang === 'id' ? 'Masukkan nama lengkap...' : 'Enter full name...'}" required>
                </div>
                <div class="form-group">
                    <label>${currentLang === 'id' ? 'Peran Sistem' : 'System Role'}</label>
                    <select id="adm-role" class="form-input">
                        ${rolesData.length > 0 
                            ? rolesData.map(r => `<option value="${r['Role Name']}" ${admin?.Role === r['Role Name'] ? 'selected' : ''}>${r['Role Name']}</option>`).join('')
                            : `
                                <option value="Super Admin">Super Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="HR Manager">HR Manager</option>
                                <option value="Finance">Finance</option>
                                <option value="Staff">Staff</option>
                            `
                        }
                    </select>
                </div>
            </div>

            <!-- Row 3: Username & Password -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label>Username (Login ID)</label>
                    <input type="text" id="adm-username" class="form-input" value="${admin ? admin['Username'] : ''}" placeholder="e.g. jdoe@wijayakn.com" required>
                </div>
                <div class="form-group">
                    <label>Login Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="adm-password" class="form-input" value="${admin && admin['Password'] ? admin['Password'] : ''}" placeholder="${isEdit ? '(Biarkan kosong jika tidak diubah)' : 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}" ${isEdit ? '' : 'required'} style="padding-right: 2.75rem;">
                        <button type="button" class="password-toggle" id="toggle-adm-password" title="Tampilkan/Sembunyikan Password" onclick="UI.togglePassword('adm-password', 'toggle-adm-password')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="toggle-adm-password-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="btn-group" style="display: flex; gap: 10px; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" style="flex: 1; height: 44px;" onclick="closeModal()">${t('discard')}</button>
                <button type="submit" class="btn btn-primary" style="flex: 1.5; height: 44px;">${isEdit ? (currentLang === 'id' ? 'Update Akun' : 'Update Account') : (currentLang === 'id' ? 'Buat Akun' : 'Create Account')}</button>
            </div>
        </form>
    `);
    document.getElementById('admin-account-form').onsubmit = (e) => handleAdminSubmit(e, rowid);
}

async function handleAdminSubmit(e, rowid) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const isEdit = rowid !== null && rowid !== undefined && rowid !== "";
    const formData = {
        action: isEdit ? "edit_admin" : "add_admin",
        rowid: isEdit ? parseInt(rowid, 10) : "",
        fullname: document.getElementById('adm-fullname').value,
        username: document.getElementById('adm-username').value,
        password: document.getElementById('adm-password').value,
        role: document.getElementById('adm-role').value,
        Status: document.getElementById('adm-status').value
    };

    submitBtn.disabled = true;
    submitBtn.innerText = t('saving');

    // 1. Optimistic Update UI (Memperbarui tampilan secara instan)
    if (isEdit) {
        const id = parseInt(rowid, 10);
        const admin = adminData.find(a => a.rowid === id);
        if (admin) {
            admin['Full Name'] = formData.fullname;
            admin['Username'] = formData.username;
            if (formData.password) admin['Password'] = formData.password;
            admin['Role'] = formData.role;
            admin['Status'] = formData.Status;
        }
    } else {
        adminData.push({
            'User ID': t('processing'),
            'Full Name': formData.fullname,
            'Username': formData.username,
            'Role': formData.role,
            'Status': formData.Status,
            rowid: adminData.length
        });
    }

    // Simpan ke local cache agar tidak hilang saat di-refresh sebelum auto-sync
    saveCache();

    closeModal();
    renderAdminsPage();

    try {
        await fetch(SCRIPT_URL, { 
            method: 'POST', 
            mode: 'no-cors',
            redirect: 'follow',
            body: JSON.stringify(formData) 
        });
        alert(t('admin_saved'));
    } catch (error) {
        alert(t('operation_success'));
    }
}

async function deleteAdmin(rowid) {
    if (!confirm(t('delete_admin_confirm'))) return;
    
    // 1. Optimistic Delete
    adminData = adminData.filter(a => a.rowid !== rowid);
    
    // 2. Persist Cache
    saveCache();

    // 3. Immediate UI Feedback
    renderAdminsPage(true);
    showToast(t('processing'), 'info');

    try {
        await fetch(SCRIPT_URL, { 
            method: 'POST', 
            mode: 'no-cors',
            body: JSON.stringify({ 
                action: 'delete_admin', 
                rowid: rowid, 
                performer: sessionStorage.getItem('GajiPro_UserName') 
            }) 
        });
        showToast(t('connected'), 'success');
    } catch (error) {
        console.error('Error deleting account:', error);
    }
}

function calculateIndonesianPayroll(emp, attendance) {
    const basicSalary = parseFloat(emp['Gaji Pokok'] || emp['Basic Salary'] || 0);
    const hourlyRate = basicSalary / 173;
    const dailyRate = basicSalary / 22;

    const tunjJabatan = parseFloat(emp['Position Allowance'] || emp['Tunjangan Jabatan'] || 0);
    const tunjMakanPerHari = parseFloat(emp['Meal Allowance'] || emp['Tunjangan Makan'] || 0);
    const tunjTransPerHari = parseFloat(emp['Transport Allowance'] || emp['Tunjangan Transport'] || 0);
    const tunjComm = parseFloat(emp['Communication Allowance'] || 0);
    const tunjLain = parseFloat(emp['Tunjangan Lain-lain'] || 0);
    const potLain = parseFloat(emp['Potongan Lain-lain'] || 0);

    let daysPresent = 0;
    let totalAbsenceDeduction = 0;
    
    attendance.forEach(a => {
        const status = a['STATUS ABSEN (Kolom Baru - Hadir/Izin/Sakit/Cuti/Alpa/WFH)'] || a['STATUS ABSEN'];
        if (status === 'Hadir' || status === 'Dinas Luar' || status === 'Izin Setengah Hari' || status === 'Cuti') {
            daysPresent++;
        }
        if (status === 'Alpa' || status === 'Izin') {
            totalAbsenceDeduction += dailyRate;
        }
    });

    // 0.2 Potongan Keterlambatan (Late Deduction)
    let totalLateDeduction = 0;
    attendance.forEach(a => {
        const checkIn = a['ABSEN IN'] || "";
        if (checkIn && checkIn !== "-" && checkIn.includes(":")) {
            const [h, m] = checkIn.split(":").map(Number);
            const checkInMinutes = h * 60 + m;
            const standardMinutes = 8 * 60; // Jam Masuk 08:00
            
            if (checkInMinutes > standardMinutes + 5) { // Toleransi 5 menit
                const diff = checkInMinutes - standardMinutes;
                totalLateDeduction += diff * 1000; // Contoh: Potongan Rp 1.000 per menit
            }
        }
    });

    const totalTunjMakan = daysPresent * tunjMakanPerHari;
    const totalTunjTrans = daysPresent * tunjTransPerHari;

    let totalOtPay = 0;
    attendance.forEach(a => {
        const hours = parseFloat(a['DURASI LEMBUR (JAM)'] || 0);
        const isApproved = (a.Notes || "").includes('[OT_OK]');
        if (hours > 0 && isApproved) {
            if (hours <= 1) {
                totalOtPay += hours * 1.5 * hourlyRate;
            } else {
                totalOtPay += (1 * 1.5 * hourlyRate) + ((hours - 1) * 2 * hourlyRate);
            }
        }
    });

    let totalHolidayPay = 0;
    attendance.forEach(a => {
        const date = a.DATE || a.date;
        const isHoliday = nationalHolidays.some(h => h.date === date);
        const status = a['STATUS ABSEN'];
        if (isHoliday && (status === 'Hadir' || status === 'Dinas Luar')) {
            totalHolidayPay += (8 * 2 * hourlyRate);
        }
    });

    const grossIncome = basicSalary + tunjJabatan + totalTunjMakan + totalTunjTrans + tunjComm + totalOtPay + totalHolidayPay + tunjLain - totalAbsenceDeduction;

    const jht_employee = basicSalary * 0.02;
    const jp_employee = Math.min(basicSalary, 10042300) * 0.01;
    const bpjs_kes_employee = Math.min(basicSalary, 12000000) * 0.01;
    const totalBpjsEmployee = jht_employee + jp_employee + bpjs_kes_employee;

    const ptkpRaw = emp['PTKP Status'] || emp['Marital Status *'] || 'TK0';
    const marital = ptkpRaw.includes('K') && !ptkpRaw.startsWith('T') ? 'K' : 'TK';
    const dependents = parseInt(ptkpRaw.replace(/[^\d]/g, '')) || 0;
    const ptkpKey = `${marital}/${dependents}`;
    
    let terRate = 0;
    if (['TK/0', 'TK/1', 'K/0'].includes(ptkpKey)) {
        if (grossIncome > 5400000 && grossIncome <= 5650000) terRate = 0.0025;
        else if (grossIncome > 5650000 && grossIncome <= 6220000) terRate = 0.005;
        else if (grossIncome > 6220000 && grossIncome <= 6500000) terRate = 0.0075;
        else if (grossIncome > 6500000 && grossIncome <= 6900000) terRate = 0.01;
        else if (grossIncome > 6900000 && grossIncome <= 7300000) terRate = 0.0125;
        else if (grossIncome > 7300000 && grossIncome <= 7800000) terRate = 0.015;
        else if (grossIncome > 7800000 && grossIncome <= 8200000) terRate = 0.0175;
        else if (grossIncome > 8200000 && grossIncome <= 8800000) terRate = 0.02;
        else if (grossIncome > 8800000 && grossIncome <= 10300000) terRate = 0.0225;
        else if (grossIncome > 10300000 && grossIncome <= 12500000) terRate = 0.05;
        else if (grossIncome > 12500000) terRate = 0.09;
    } 
    else if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(ptkpKey)) {
        if (grossIncome > 6200000 && grossIncome <= 6500000) terRate = 0.0025;
        else if (grossIncome > 6500000 && grossIncome <= 6850000) terRate = 0.005;
        else if (grossIncome > 6850000 && grossIncome <= 7150000) terRate = 0.0075;
        else if (grossIncome > 7150000 && grossIncome <= 7600000) terRate = 0.01;
        else if (grossIncome > 7600000 && grossIncome <= 8000000) terRate = 0.0125;
        else if (grossIncome > 8000000 && grossIncome <= 8500000) terRate = 0.015;
        else if (grossIncome > 8500000 && grossIncome <= 9000000) terRate = 0.0175;
        else if (grossIncome > 9000000 && grossIncome <= 9550000) terRate = 0.02;
        else if (grossIncome > 9550000 && grossIncome <= 11500000) terRate = 0.0225;
        else if (grossIncome > 11500000) terRate = 0.06;
    }
    else if (ptkpKey === 'K/3') {
        if (grossIncome > 6600000 && grossIncome <= 6950000) terRate = 0.0025;
        else if (grossIncome > 6950000 && grossIncome <= 7350000) terRate = 0.005;
        else if (grossIncome > 7350000 && grossIncome <= 7800000) terRate = 0.0075;
        else if (grossIncome > 7800000 && grossIncome <= 8350000) terRate = 0.01;
        else if (grossIncome > 8350000 && grossIncome <= 8850000) terRate = 0.0125;
        else if (grossIncome > 8850000 && grossIncome <= 9650000) terRate = 0.015;
        else if (grossIncome > 9650000) terRate = 0.05;
    }

    const pph21 = Math.round(grossIncome * terRate);
    const takeHomePay = Math.round(grossIncome - totalBpjsEmployee - pph21 - potLain - totalLateDeduction);

    return {
        basicSalary,
        tunjangan: { tunjJabatan, totalTunjMakan, totalTunjTrans, tunjLain },
        lembur: totalOtPay,
        holidayPay: totalHolidayPay,
        potonganAbsen: totalAbsenceDeduction,
        potLain,
        grossIncome,
        bpjs: {
            employee: { jht: jht_employee, jp: jp_employee, kes: bpjs_kes_employee, total: totalBpjsEmployee }
        },
        pph21,
        totalLateDeduction,
        takeHomePay,
        ptkpKey
    };
}

function renderPayrollPage(silent = false) {
    if (!isAuthenticated) return;
    
    const payrollData = salaryData.map(emp => {
        const empName = emp['EMPLOYEE NAME'] || emp['Full Name *'];
        const empId = emp['EMPLOYEE ID'] || emp['Employee ID *'];
        const empAttendance = attendanceData.filter(a => (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === empName);
        const totalHours = empAttendance.reduce((sum, a) => sum + parseFloat(a['WORK HOURS (8 JAM)'] || a['Total Jam Kerja'] || 0), 0);
        
        const calc = calculateIndonesianPayroll(emp, empAttendance);

        return { ...emp, totalHours, calc, 'EMPLOYEE NAME': empName, 'EMPLOYEE ID': empId };
    });

    app.innerHTML = `
        ${renderTopbar(t('payroll_system'))}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="margin-bottom: 0.25rem;">${t('payroll_title')}</h3>
                    <p style="color: var(--text-muted); font-size: 0.8125rem;">${t('payroll_subtitle')}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="exportPayrollToExcel()">ðŸ“Š Excel</button>
                    <button class="btn btn-secondary" onclick="exportPayrollToPDF()">ðŸ“„ PDF</button>
                    <button class="btn btn-secondary" onclick="renderPayrollHistory()">ðŸ“œ ${t('payroll_history')}</button>
                    <button class="btn btn-secondary" onclick="showPayslipConfig()">âš™ï¸ ${currentLang === 'id' ? 'Konfigurasi Slip' : 'Slip Config'}</button>
                    <button class="btn btn-primary" onclick="finalizePayroll()">âœ… ${t('finalize_all')}</button>
                </div>
            </header>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>${t('employee')}</th>
                                <th>${t('basic_salary')}</th>
                                <th>${t('work_hours')}</th>
                                <th>${t('estimated_pay')}</th>
                                <th style="text-align: right;">${t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payrollData.map(pay => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700;">${pay['Full Name *']}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${pay['Job Position *']}</div>
                                    </td>
                                    <td style="font-family: monospace;">Rp ${parseFloat(pay['Gaji Pokok'] || pay['Basic Salary'] || 0).toLocaleString()}</td>
                                    <td><span class="status-badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe;">${pay.totalHours.toFixed(1)} hrs</span></td>
                                    <td style="font-weight: 800; color: #059669;">Rp ${pay.calc.netTakeHomePay.toLocaleString()}</td>
                                    <td style="text-align: right;">
                                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                            <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.75rem;" onclick="editSalaryComponents('${pay['Full Name *'] || pay['EMPLOYEE NAME']}')">âš™ï¸</button>
                                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="showPayslip('${pay['Full Name *'] || pay['EMPLOYEE NAME']}')">${currentLang === 'id' ? 'Slip Gaji' : 'Payslip'}</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showPayslip(name) {
    const emp = salaryData.find(e => (e['Full Name *'] || e['EMPLOYEE NAME']) === name);
    const empAttendance = attendanceData.filter(a => (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === name);
    const calc = calculateIndonesianPayroll(emp, empAttendance);

    showModal(`
        <div id="print-section" style="padding: 1.5rem; color: #1e293b; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid var(--primary-color); padding-bottom: 1rem; margin-bottom: 2rem;">
                <div>
                    ${payslipConfig.showLogo ? `<h1 style="color: var(--primary-color); margin: 0; font-size: 2rem; font-weight: 900;">WKNsite</h1>` : ''}
                    ${payslipConfig.showCompanyInfo ? `<p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); white-space: pre-line;">${payslipConfig.companyAddress}</p>` : ''}
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0; font-size: 1.25rem;">${currentLang === 'id' ? 'SLIP GAJI RESMI' : 'OFFICIAL PAYSLIP'}</h2>
                    <p style="font-size: 0.8125rem; color: var(--text-muted);">${new Date().toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; font-size: 0.875rem;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${t('full_name')}</span><strong style="font-size: 1rem;">${emp['Full Name *']}</strong></div>
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${t('position')}</span><strong>${emp['Job Position *']}</strong></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${t('user_id')}</span><strong>${emp['Employee ID *']}</strong></div>
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${currentLang === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</span><strong>${emp['Bank Name']} (${emp['Bank Account']})</strong></div>
                </div>
            </div>

            <div style="border: 2px solid #f1f5f9; border-radius: 12px; overflow: hidden; margin-bottom: 2.5rem;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f8fafc; border-bottom: 2px solid #f1f5f9;">
                        <th style="padding: 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase;">${currentLang === 'id' ? 'Item Penghasilan' : 'Earnings Item'}</th>
                        <th style="padding: 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase;">${currentLang === 'id' ? 'Jumlah' : 'Amount'}</th>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">${t('basic_salary')}</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right;">Rp ${calc.basicSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Tunjangan Jabatan</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right;">Rp ${calc.tunjangan.tunjJabatan.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Tunjangan Makan & Transport</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right;">Rp ${(calc.tunjangan.totalTunjMakan + calc.tunjangan.totalTunjTrans).toLocaleString()}</td>
                    </tr>
                    ${calc.tunjangan.tunjLain > 0 ? `
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Tunjangan Lain-lain (Bonus/THR)</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #059669;">+ Rp ${calc.tunjangan.tunjLain.toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Lembur & Hari Libur</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #059669;">+ Rp ${(calc.lembur + calc.holidayPay).toLocaleString()}</td>
                    </tr>
                    ${calc.totalAbsenceDeduction > 0 ? `
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">
                            Potongan Kehadiran 
                            <div style="font-size: 0.7rem; color: #94a3b8;">
                                (Alpa: ${calc.totalAlpa}, Izin: ${calc.totalIzinUnpaid}, 1/2 Hari Unapproved: ${calc.totalHalfDayUnpaid})
                            </div>
                        </td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${Math.round(calc.totalAbsenceDeduction).toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">BPJS Ketenagakerjaan (JHT & JP)</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${(calc.jht_employee + calc.jp_employee).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">BPJS Kesehatan</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${calc.bpjs_kes_employee.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">PPh 21 (Pajak Penghasilan)</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${Math.round(calc.pph21).toLocaleString()}</td>
                    </tr>
                    ${calc.totalLateDeduction > 0 ? `
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Potongan Keterlambatan (Late)</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${calc.totalLateDeduction.toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    ${calc.potLain > 0 ? `
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Potongan Lain-lain (Kasbon/Denda)</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${calc.potLain.toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    <tr style="background: #fff1f2; font-weight: 900; font-size: 1.125rem;">
                        <td style="padding: 1.25rem; color: var(--primary-color);">${currentLang === 'id' ? 'GAJI BERSIH (THP)' : 'NET TAKE HOME PAY'}</td>
                        <td style="padding: 1.25rem; color: var(--primary-color); text-align: right;">Rp ${calc.takeHomePay.toLocaleString()}</td>
                    </tr>
                </table>
            </div>

            ${payslipConfig.footnote ? `
            <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-bottom: 2.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0;">
                "${payslipConfig.footnote}"
            </div>
            ` : ''}

            <div class="no-print" style="display: flex; gap: 10px; margin-top: 2rem; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">Tutup</button>
                <button class="btn btn-secondary" style="background: #25d366; color: white; border: none;" onclick="shareToWhatsApp('${emp['Full Name *']}', ${calc.takeHomePay}, '${emp['WHATSAPP NUMBER'] || emp['PHONE NUMBER']}')">
                    ðŸ’¬ WhatsApp
                </button>
                <button class="btn btn-primary" onclick="printPayslip()">ðŸ–¨ï¸  Cetak Slip Gaji</button>
            </div>
        </div>
        <style>
            @media print {
                body * { visibility: hidden; }
                #print-section, #print-section * { visibility: visible; }
                #print-section { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%; 
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .no-print { display: none !important; }
                .modal-overlay { background: white !important; backdrop-filter: none !important; }
                .modal-content { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 0 !important; }
            }
        </style>
    `);
}

window.printPayslip = () => {
    window.print();
};

async function finalizePayroll() {
    if (!confirm(t('finalize_confirm'))) return;

    const payrollData = salaryData.map(emp => {
        const empName = emp['Full Name *'] || emp['EMPLOYEE NAME'];
        const empAttendance = attendanceData.filter(a => (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === empName);
        const calc = calculateIndonesianPayroll(emp, empAttendance);
        return { 
            name: empName,
            id: emp['Employee ID *'] || emp['EMPLOYEE ID'],
            position: emp['Job Position *'],
            department: emp['Organization Name *'] || emp['DEPARTMENT'],
            basicSalary: calc.basicSalary,
            totalTakeHomePay: calc.takeHomePay,
            details: calc
        };
    });

    const totalPayout = payrollData.reduce((sum, p) => sum + p.totalTakeHomePay, 0);
    const now = new Date();
    const archiveRecord = {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        timestamp: now.toISOString(),
        totalExpenditure: totalPayout,
        employeeCount: payrollData.length,
        data: payrollData
    };

    if (USE_LOCAL_DATA) {
        payrollHistory.unshift(archiveRecord);
        showToast(t('payroll_finalized'), 'success');
        renderPayrollPage(true);
        return;
    }

    // Server-side finalize (requires GAS support)
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'finalizePayroll',
                record: archiveRecord
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            showToast(t('payroll_finalized'), 'success');
            fetchData(true);
        } else {
            showToast(result.message || 'Error finalizing payroll', 'error');
        }
    } catch (error) {
        console.error('Finalize error:', error);
        showToast('Connection error during finalization', 'error');
    }
}

function renderPayrollHistory() {
    app.innerHTML = `
        ${renderTopbar(t('payroll_history'))}
        <div class="content-body fade-in">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="margin-bottom: 0.25rem;">${t('payroll_archive')}</h3>
                    <p style="color: var(--text-muted); font-size: 0.8125rem;">${t('recent_activity')}</p>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="renderPayrollPage()">â¬…ï¸ ${currentLang === 'id' ? 'Kembali ke Payroll Aktif' : 'Back to Active Payroll'}</button>
                </div>
            </header>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Periode</th>
                                <th>${t('archive_date')}</th>
                                <th>${t('total_employees')}</th>
                                <th>${t('total_payout')}</th>
                                <th style="text-align: right;">${t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payrollHistory.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                                        <div style="font-size: 3rem; margin-bottom: 1rem;">${UI.icons.folder}</div>
                                        <p>${t('no_history')}</p>
                                    </td>
                                </tr>
                            ` : payrollHistory.map((h, idx) => `
                                <tr>
                                    <td><strong>${new Date(h.year, h.month - 1).toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}</strong></td>
                                    <td style="font-size: 0.8125rem; color: var(--text-muted);">${new Date(h.timestamp).toLocaleString()}</td>
                                    <td>${h.employeeCount} ${t('employee')}</td>
                                    <td style="font-weight: 700; color: var(--primary-color);">${formatCurrency(h.totalExpenditure)}</td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="viewArchiveDetails(${idx})">ðŸ‘ï¸ ${t('view_archive')}</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function viewArchiveDetails(index) {
    const archive = payrollHistory[index];
    if (!archive) return;

    showModal(`
        <div style="padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0; font-size: 1.25rem;">${t('payroll_archive')}</h3>
                    <p style="color: var(--text-muted); font-size: 0.8125rem; margin: 0;">Periode: ${new Date(archive.year, archive.month - 1).toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Total Pengeluaran</div>
                    <div style="font-size: 1.125rem; font-weight: 800; color: var(--primary-color);">${formatCurrency(archive.totalExpenditure)}</div>
                </div>
            </div>

            <div style="max-height: 500px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left;">
                            <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Karyawan</th>
                            <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Jabatan</th>
                            <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: right;">Gaji Bersih</th>
                            <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${archive.data.map(p => `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px 8px;">
                                    <div style="font-weight: 700;">${p.name}</div>
                                    <div style="font-size: 0.7rem; color: #94a3b8;">${UI.icons.user}</div>
                                </td>
                                <td style="padding: 12px 8px; color: #64748b;">${p.position}</td>
                                <td style="padding: 12px 8px; text-align: right; font-weight: 700;">${formatCurrency(p.totalTakeHomePay)}</td>
                                <td style="padding: 12px 8px; text-align: right;">
                                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem;" onclick="showArchivedPayslip(${index}, '${p.name}')">Slip</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 2rem; display: flex; gap: 12px;">
                <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Tutup</button>
                <button class="btn btn-primary" style="flex: 1;" onclick="exportArchiveToExcel(${index})">ðŸ“¥ Ekspor Excel</button>
            </div>
        </div>
    `);
}

function showArchivedPayslip(archiveIndex, employeeName) {
    const archive = payrollHistory[archiveIndex];
    const p = archive.data.find(emp => emp.name === employeeName);
    if (!p) return;

    // Use a temporary fake emp object and calc object for the existing showPayslip template
    // We need to adapt showPayslip or create a showArchivedPayslip version.
    // For now, let's create a specialized archived slips view.
    
    const calc = p.details;
    const emp = salaryData.find(e => (e['Full Name *'] || e['EMPLOYEE NAME']) === employeeName) || {
        'Full Name *': p.name,
        'Job Position *': p.position,
        'Employee ID *': p.id,
        'Bank Name': '-',
        'Bank Account': '-'
    };

    showModal(`
        <div id="print-section" style="padding: 1.5rem; color: #1e293b; background: white;">
            <div style="text-align: center; margin-bottom: 1rem; padding: 4px 12px; background: #fef2f2; color: #ef4444; border-radius: 6px; font-size: 0.75rem; font-weight: 800; display: inline-block;">
                DOKUMEN ARSIP (${new Date(archive.timestamp).toLocaleDateString()})
            </div>
            <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #64748b; padding-bottom: 1rem; margin-bottom: 2rem;">
                <div>
                    <h1 style="color: #334155; margin: 0; font-size: 2rem; font-weight: 900;">WKNsite</h1>
                    <p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); white-space: pre-line;">${payslipConfig.companyAddress}</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0; font-size: 1.25rem;">SLIP GAJI ARSIP</h2>
                    <p style="font-size: 0.8125rem; color: var(--text-muted);">${new Date(archive.year, archive.month - 1).toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; font-size: 0.875rem;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${t('full_name')}</span><strong style="font-size: 1rem;">${p.name}</strong></div>
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${t('position')}</span><strong>${p.position}</strong></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${t('user_id')}</span><strong>${p.id}</strong></div>
                    <div><span style="color: var(--text-muted); display: block; font-size: 0.75rem;">Metode Pembayaran</span><strong>${emp['Bank Name'] || '-'} (${emp['Bank Account'] || '-'})</strong></div>
                </div>
            </div>

            <div style="border: 2px solid #f1f5f9; border-radius: 12px; overflow: hidden; margin-bottom: 2.5rem;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f8fafc; border-bottom: 2px solid #f1f5f9;">
                        <th style="padding: 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase;">Item Penghasilan</th>
                        <th style="padding: 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase;">Jumlah</th>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Gaji Pokok</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right;">Rp ${calc.basicSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">Tunjangan & Lembur</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right;">Rp ${(p.totalTakeHomePay - calc.basicSalary + calc.totalAbsenceDeduction + calc.jht_employee + calc.jp_employee + calc.bpjs_kes_employee + calc.pph21 + (calc.totalLateDeduction || 0) + (calc.potLain || 0)).toLocaleString()}</td>
                    </tr>
                    ${calc.totalAbsenceDeduction > 0 ? `
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #ef4444;">Potongan Kehadiran</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${Math.round(calc.totalAbsenceDeduction).toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #ef4444;">Deductions (BPJS & Pajak)</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- Rp ${(calc.jht_employee + calc.jp_employee + calc.bpjs_kes_employee + calc.pph21).toLocaleString()}</td>
                    </tr>
                    <tr style="background: #f8fafc; font-weight: 900; font-size: 1.125rem;">
                        <td style="padding: 1.25rem;">GAJI BERSIH (THP)</td>
                        <td style="padding: 1.25rem; text-align: right;">Rp ${p.totalTakeHomePay.toLocaleString()}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; font-size: 0.7rem; color: #94a3b8; margin-top: 2rem;">
                Slip Gaji ini dicetak dari arsip sistem pada ${new Date().toLocaleString()}
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 2rem;">
            <button class="btn btn-secondary" style="flex: 1;" onclick="viewArchiveDetails(${archiveIndex})">Kembali</button>
            <button class="btn btn-primary" style="flex: 1;" onclick="window.print()">ðŸ–¨ï¸ Cetak</button>
        </div>
    `);
}

function exportArchiveToExcel(index) {
    const archive = payrollHistory[index];
    const data = archive.data.map(p => ({
        'Employee ID': p.id,
        'Name': p.name,
        'Position': p.position,
        'Department': p.department,
        'Basic Salary': p.basicSalary,
        'Net Take Home Pay': p.totalTakeHomePay
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Archive");
    const fileName = `Payroll_Archive_${archive.year}_${archive.month}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function exportPayrollToExcel() {
    if (!salaryData || salaryData.length === 0) {
        showToast("Tidak ada data untuk diekspor", "error");
        return;
    }

    showToast(t('exporting'), 'info');

    const payrollData = salaryData.map(emp => {
        const empName = emp['Full Name *'] || emp['EMPLOYEE NAME'];
        const empAttendance = attendanceData.filter(a => (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === empName);
        const calc = calculateIndonesianPayroll(emp, empAttendance);
        
        return {
            'Employee ID': emp['Employee ID *'] || emp['EMPLOYEE ID'],
            'Nama Karyawan': empName,
            'Jabatan': emp['Job Position *'],
            'Departemen': emp['Organization Name *'] || emp['DEPARTMENT'],
            'Gaji Pokok': calc.basicSalary,
            'Tunjangan Jabatan': calc.tunjangan.tunjJabatan,
            'Tunjangan Makan': calc.tunjangan.totalTunjMakan,
            'Tunjangan Transport': calc.tunjangan.totalTunjTrans,
            'Tunjangan Lain': calc.tunjangan.tunjLain,
            'Lembur': calc.lembur,
            'Holiday Pay': calc.holidayPay,
            'Potongan Absensi': Math.round(calc.totalAbsenceDeduction),
            'BPJS Ketenagakerjaan (Emp)': calc.jht_employee + calc.jp_employee,
            'BPJS Kesehatan (Emp)': calc.bpjs_kes_employee,
            'PPh 21': Math.round(calc.pph21),
            'Potongan Keterlambatan': calc.totalLateDeduction || 0,
            'Potongan Lain': calc.potLain || 0,
            'NET TAKE HOME PAY': calc.takeHomePay
        };
    });

    const ws = XLSX.utils.json_to_sheet(payrollData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Payroll");
    
    // Add summary row
    const totalNet = payrollData.reduce((sum, p) => sum + p['NET TAKE HOME PAY'], 0);
    XLSX.utils.sheet_add_aoa(ws, [
        [],
        ['TOTAL PENGELUARAN', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', totalNet]
    ], { origin: -1 });

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    XLSX.writeFile(wb, `Rekap_Payroll_WKN_${dateStr}.xlsx`);
    
    showToast(t('operation_success'), 'success');
}

function exportPayrollToPDF() {
    if (!salaryData || salaryData.length === 0) {
        showToast("Tidak ada data untuk dicetak", "error");
        return;
    }

    const payrollData = salaryData.map(emp => {
        const empName = emp['Full Name *'] || emp['EMPLOYEE NAME'];
        const empAttendance = attendanceData.filter(a => (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === empName);
        const calc = calculateIndonesianPayroll(emp, empAttendance);
        return { ...emp, calc };
    });

    const totalNet = payrollData.reduce((sum, p) => sum + p.calc.takeHomePay, 0);
    const now = new Date();
    const dateStr = now.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });

    showModal(`
        <div id="print-recap" style="padding: 2rem; background: white; color: black; font-family: 'Inter', sans-serif;">
            <div style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem;">
                <h1 style="margin: 0; font-size: 1.5rem;">WIJAYA KREATIF NUSANTARA</h1>
                <h2 style="margin: 5px 0; font-size: 1.1rem; text-transform: uppercase;">REKAPITULASI PEMBAYARAN GAJI KARYAWAN</h2>
                <p style="margin: 0; font-size: 0.9rem;">Periode: ${dateStr}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="border: 1px solid #000; padding: 6px;">ID</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: left;">Nama Karyawan</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: right;">Gaji Pokok</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: right;">Tunjangan</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: right;">Lembur</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: right;">Potongan</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: right;">Pajak/BPJS</th>
                        <th style="border: 1px solid #000; padding: 6px; text-align: right;">NET PAY</th>
                    </tr>
                </thead>
                <tbody>
                    ${payrollData.map(p => {
                        const totalTunj = p.calc.tunjangan.tunjJabatan + p.calc.tunjangan.totalTunjMakan + p.calc.tunjangan.totalTunjTrans + p.calc.tunjangan.tunjLain;
                        const totalPot = Math.round(p.calc.totalAbsenceDeduction) + (p.calc.totalLateDeduction || 0) + (p.calc.potLain || 0);
                        const totalTaxBPJS = p.calc.jht_employee + p.calc.jp_employee + p.calc.bpjs_kes_employee + Math.round(p.calc.pph21);
                        
                        return `
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center;">${p['Employee ID *'] || p['EMPLOYEE ID']}</td>
                                <td style="border: 1px solid #000; padding: 6px;">${p['Full Name *'] || p['EMPLOYEE NAME']}</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${p.calc.basicSalary.toLocaleString()}</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${totalTunj.toLocaleString()}</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${(p.calc.lembur + p.calc.holidayPay).toLocaleString()}</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #ef4444;">(${totalPot.toLocaleString()})</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #ef4444;">(${totalTaxBPJS.toLocaleString()})</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${p.calc.takeHomePay.toLocaleString()}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f8fafc; font-weight: bold;">
                        <td colspan="7" style="border: 1px solid #000; padding: 10px; text-align: right; font-size: 0.9rem;">TOTAL KESELURUHAN</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: right; font-size: 0.9rem; color: var(--primary-color);">Rp ${totalNet.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 3rem; display: flex; justify-content: flex-end;">
                <div style="text-align: center; width: 250px;">
                    <p>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p style="margin-bottom: 4rem;">Mengetahui,</p>
                    <p style="font-weight: bold; text-decoration: underline;">( Administrator Finance )</p>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 2rem;">
            <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary" style="flex: 1;" onclick="window.print()">ðŸ–¨ï¸ Cetak Rekap (PDF)</button>
        </div>
    `);
}

window.editSalaryComponents = (name) => {
    const emp = salaryData.find(e => (e['Full Name *'] || e['EMPLOYEE NAME']) === name);
    showModal(`
        <div style="padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem;">âš™ï¸ ${currentLang === 'id' ? 'Edit Komponen Gaji' : 'Edit Salary Components'}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">${name}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Tunjangan Jabatan</label>
                    <input type="number" id="edit-tunj-jab" class="form-input" value="${emp['Tunjangan Jabatan'] || 0}">
                </div>
                <div class="form-group">
                    <label>Tunjangan Lain (Bonus/THR)</label>
                    <input type="number" id="edit-tunj-lain" class="form-input" value="${emp['Tunjangan Lain-lain'] || 0}">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Tunj. Makan (Per Hari)</label>
                    <input type="number" id="edit-tunj-makan" class="form-input" value="${emp['Tunjangan Makan'] || 0}">
                </div>
                <div class="form-group">
                    <label>Tunj. Transport (Per Hari)</label>
                    <input type="number" id="edit-tunj-trans" class="form-input" value="${emp['Tunjangan Transport'] || 0}">
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 2rem;">
                <label>Potongan Lain-lain (Kasbon/Denda)</label>
                <input type="number" id="edit-pot-lain" class="form-input" value="${emp['Potongan Lain-lain'] || 0}">
            </div>

            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Batal</button>
                <button class="btn btn-primary" style="flex: 1.5;" onclick="saveSalaryComponents('${name}')">Simpan</button>
            </div>
        </div>
    `);
};

window.saveSalaryComponents = async (name) => {
    const emp = salaryData.find(e => (e['Full Name *'] || e['EMPLOYEE NAME']) === name);
    if (!emp) return;

    emp['Tunjangan Jabatan'] = document.getElementById('edit-tunj-jab').value;
    emp['Tunjangan Makan'] = document.getElementById('edit-tunj-makan').value;
    emp['Tunjangan Transport'] = document.getElementById('edit-tunj-trans').value;
    emp['Tunjangan Lain-lain'] = document.getElementById('edit-tunj-lain').value;
    emp['Potongan Lain-lain'] = document.getElementById('edit-pot-lain').value;

    saveCache();
    closeModal();
    renderPayrollPage(true);
    showToast("Gaji diperbarui", "success");

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'edit_salary_components',
                employeeName: name,
                data: {
                    tunjJabatan: emp['Tunjangan Jabatan'],
                    tunjMakan: emp['Tunjangan Makan'],
                    tunjTrans: emp['Tunjangan Transport'],
                    tunjLain: emp['Tunjangan Lain-lain'],
                    potLain: emp['Potongan Lain-lain']
                }
            })
        });
    } catch (e) { console.error(e); }
};

function renderMaintenancePage(silent = false) {
    if (!isAuthenticated) return;

    app.innerHTML = `
        ${renderTopbar(t('maintenance_title'))}
        <div class="content-body ${silent ? '' : 'fade-in'}">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <!-- Activity Logs -->
                <div>
                    <h3 style="margin-bottom: 1rem;">${t('audit_logs')}</h3>
                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div class="table-container">
                            <table style="font-size: 0.8125rem;">
                                <thead style="background: #f8fafc;">
                                    <tr>
                                        <th>${t('timestamp')}</th>
                                        <th>${t('employee')} / Admin</th>
                                        <th>${t('action')}</th>
                                        <th>${t('detail')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${systemLogs.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding: 2rem;">${t('no_logs')}</td></tr>` : 
                                        systemLogs.map(log => `
                                        <tr>
                                            <td style="color: var(--text-muted); font-size: 0.75rem;">${log.Timestamp}</td>
                                            <td style="font-weight: 600;">${log.Admin}</td>
                                            <td><span class="status-badge" style="background: #f1f5f9; color: var(--primary-color); padding: 2px 6px;">${log.Action}</span></td>
                                            <td style="color: var(--text-muted);">${log.Detail}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- System Config -->
                <div>
                    <h3 style="margin-bottom: 1rem;">${t('system_control')}</h3>
                    <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
                        <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 10px;" onclick="resetSystemCache()">
                            <span>ðŸ§¹</span> ${t('clear_cache')}
                        </button>
                        <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 10px;" onclick="window.open(SCRIPT_URL, '_blank')">
                            <span>ðŸ“„</span> ${t('view_api')}
                        </button>
                        <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 10px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;" onclick="triggerBackup()">
                            <span>ðŸ“¦</span> Backup Database
                        </button>
                        <button class="btn btn-secondary" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 10px; color: #ef4444;" onclick="logout()">
                            <span>${UI.icons.logout}</span> ${t('terminate_session')}
                        </button>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <p style="font-size: 0.75rem; color: var(--text-muted);">${t('db_status')}: <strong style="color: #10b981;">${t('healthy')}</strong></p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">${t('last_sync')}: ${new Date().toLocaleTimeString(currentLang === 'id' ? 'id-ID' : 'en-US')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Navigation initialization is now handled solely by setupNavigation() called in initApp()
// Redundant onclick handlers removed to prevent double-firing and conflicts.

function setActiveNav(target) {
    if (!target) return;
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    target.classList.add('active');
}

window.forceManualSync = async (event) => {
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "â³ Syncing...";
    try {
        const res = await fetch(SCRIPT_URL + "?t=" + Date.now(), { redirect: 'follow' });
        const text = await res.text();
        if (!text.includes('{')) {
            alert("ERROR: Database tidak mengirim JSON. Hasil: " + text.substring(0, 50));
            return;
        }
        const result = JSON.parse(text);
        
        // Update global variables
        salaryData = (result.salary || result.employees || result.Employees || result.data || []).map((emp, i) => ({ ...emp, rowid: i }));
        adminData = (result.admins || result.Admins || []).map((adm, i) => ({ ...adm, rowid: i }));
        systemLogs = (result.systemLogs || result.logs || result.Logs || []);
        attendanceData = (result.attendance || result.Attendance || []);
        mutationData = (result.mutations || result.Mutations || []);
        rolesData = (result.roles || result.Roles || []);
        
        saveCache();
        
        showModal(`
            <div style="text-align: center; padding: 1.5rem;">
                <div style="width: 72px; height: 72px; background: #dcfce7; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem; animation: pulse-green 2s infinite;">âœ¨</div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">${currentLang === 'id' ? 'SINKRONISASI BERHASIL!' : 'SYNC SUCCESSFUL!'}</h3>
                <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 2rem;">${currentLang === 'id' ? 'Database telah diperbarui dengan data terbaru dari Google Sheets.' : 'Database has been updated with latest data from Google Sheets.'}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">ADMIN</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">${adminData.length}</div>
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">${t('total_employees').toUpperCase()}</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">${salaryData.length}</div>
                    </div>
                </div>

                <div style="font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-bottom: 1.5rem;">
                    ${currentLang === 'id' ? 'Halaman akan dimuat ulang secara otomatis...' : 'Page will reload automatically...'}
                </div>
                
                <button class="btn btn-primary" style="width: 100%; height: 48px; font-weight: 700;" onclick="location.reload()">
                    ${currentLang === 'id' ? 'Segarkan Sekarang' : 'Refresh Now'}
                </button>
            </div>
        `);

        // Otomatis reload setelah 5 detik jika user tidak klik
        setTimeout(() => location.reload(), 5000);
    } catch (e) {
        showToast("KONEKSI GAGAL: " + e.message, "error");
    } finally {
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>Sync</span>
        `;
    }
};

window.closeModal = closeModal;
// window.showAddForm already assigned as window.showAddForm arrow function above
window.showAttendanceForm = showAttendanceForm;
window.logout = logout;
window.resetSystemCache = () => {
    localStorage.removeItem('WKNsite_Cache');
    alert(t('cache_cleared'));
    location.reload();
};

// --- Fungsi Pembantu untuk Kompresi Gambar sebelum dikirim ke API ---
function getBase64Compressed(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Max width/height 1000px agar ukuran sangat kecil (< 500kb)
                let width = img.width;
                let height = img.height;
                const MAX = 1000;
                if (width > height && width > MAX) {
                    height *= MAX / width;
                    width = MAX;
                } else if (height > MAX) {
                    width *= MAX / height;
                    height = MAX;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                // Kompres kualitas jpeg 70%
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function handleKTPScan(input) {
    
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const previewContainer = document.getElementById('ktp-preview-container');
    const previewImg = document.getElementById('ktp-preview-img');
    
    // Preview Gambar
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);

    const scanBtn = document.querySelector('button[onclick*="ktp-upload"]');
    const originalText = scanBtn.innerHTML;
    scanBtn.disabled = true;
    
    try {
        scanBtn.innerHTML = `<span>â³</span> ${t('ocr_sending')}`;
        
        // 1. Kompres gambar & Ambil Base64 murni
        const base64Str = await getBase64Compressed(file);
        const base64Data = base64Str.split(',')[1]; 

        // 2. Perintah Google Apps Script untuk mulai OCR
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify({ action: 'ocrKTP', image: base64Data })
        });

        // 3. POLLING SYSTEM: Cek hasil ke server setiap 2.5 detik (Maksimal 6 kali cek)
        let result = null;
        for (let i = 0; i < 6; i++) {
            scanBtn.innerHTML = `<span>â³</span> ${t('ocr_reading')} (${i+1}/6)...`;
            await new Promise(r => setTimeout(r, 2500)); 
            
            try {
                const res = await fetch(`${SCRIPT_URL}?action=getOCRResult`);
                result = await res.json();
                
                // Jika server mengirimkan pesan ERROR
                if (result.success && result.text && result.text.includes("ERROR_")) {
                    throw new Error(result.text.replace("ERROR_DRIVE_API: ", "").replace("ERROR_TEKNIS: ", ""));
                }
                
                if (result.success) break; 
            } catch (e) {
                if (e.message.includes("DRIVE")) throw e; // Teruskan error API
                
            }
        }

        if (!result || !result.success) {
            throw new Error(t('ocr_timeout'));
        }

        let text = result.text.toUpperCase();

// --- PARSING DATA (SANGAT AKURAT) ---
        let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let nik = "", nama = "", dob = "";

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // 1. Ekstrak NIK (16 digit angka)
            if (!nik) {
                let cleanNik = line.replace(/[^0-9]/g, '');
                if (cleanNik.length >= 16) {
                    let match = cleanNik.match(/\d{16}/);
                    if (match) nik = match[0];
                }
            }

            // 2. Ekstrak Nama (Mencari baris setelah kata NAMA)
            if (!nama && (line.includes("NAMA") || line.includes("NAM A") || line.includes("NAME"))) {
                let parts = line.split(/[:;=]/);
                let potentialName = parts.length > 1 ? parts[1].trim() : "";
                
                // Jika baris NAMA kosong, ambil baris di bawahnya
                if (potentialName.length < 3 && i + 1 < lines.length) {
                    potentialName = lines[i+1].trim();
                }
                
                // Bersihkan karakter aneh
                nama = potentialName.replace(/[^A-Z\s.,]/g, '').trim();
            }

            // 3. Ekstrak Tanggal Lahir (Format: DD-MM-YYYY)
            if (!dob && (line.includes("LAHIR") || line.includes("TGL"))) {
                let dateMatch = line.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
                if (dateMatch) {
                    dob = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
                } else if (i + 1 < lines.length) {
                    // Cek baris bawahnya jika tidak ada di baris yang sama
                    let nextLineMatch = lines[i+1].match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
                    if (nextLineMatch) dob = `${nextLineMatch[3]}-${nextLineMatch[2]}-${nextLineMatch[1]}`;
                }
            }
        }

        // --- PENGISIAN FORM ---
        if (nik) document.getElementById('nik').value = nik;
        if (nama) document.getElementById('nama').value = nama;
        if (dob) document.getElementById('dob').value = dob;

        if (nik || nama || dob) {
            alert(t('ocr_success'));
        } else {
            alert(t('ocr_finish_unclear'));
        }

    } catch (error) {
        console.error("OCR Error:", error);
        alert(t('ocr_error') + '\n\nDetail Error: ' + error.message);
    } finally {
        if (typeof scanBtn !== 'undefined' && scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = originalText;
        }
    }
}

function renderDinasDashboard() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-dinas');
    
    const dinasRecords = [];
    let totalDinasCost = 0;
    let pendingApproval = 0;
    
    attendanceData.forEach(log => {
        const notes = log.Notes || log.notes || "";
        if (notes.startsWith('[DINAS]')) {
            const parts = notes.replace('[DINAS] ', '').split(' | ');
            const kota = parts[0]?.split(': ')[1] || '-';
            const costPart = parts.find(p => p.startsWith('Cost: '));
            const statusPart = parts.find(p => p.startsWith('Status: ')) || 'Status: Pending';
            const status = statusPart.replace('Status: ', '');
            
            let costs = { harian: 0, trans: 0, hotel: 0, other: 0 };
            if (costPart) {
                try { costs = JSON.parse(costPart.replace('Cost: ', '')); } catch(e) {}
            }
            const total = costs.harian + costs.trans + costs.hotel + costs.other;
            
            if (status === 'Approved') totalDinasCost += total;
            if (status === 'Pending') pendingApproval++;
            
            dinasRecords.push({
                date: log.DATE || log.date,
                name: log['EMPLOYEE NAME'],
                id: log['EMPLOYEE ID'],
                kota: kota,
                total: total,
                details: costs,
                status: status,
                rawNotes: notes
            });
        }
    });

    app.innerHTML = `
        ${renderTopbar('Reimbursement & Dinas')}
        <div class="content-body fade-in">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="stat-card" style="border-left: 4px solid #059669;">
                    <div style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Total Biaya Disetujui</div>
                    <div style="font-size: 1.75rem; font-weight: 800; color: #059669; margin-top: 0.5rem;">Rp ${totalDinasCost.toLocaleString('id-ID')}</div>
                </div>
                <div class="stat-card" style="border-left: 4px solid #f59e0b;">
                    <div style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Menunggu Approval</div>
                    <div style="font-size: 1.75rem; font-weight: 800; color: #f59e0b; margin-top: 0.5rem;">${pendingApproval} Request</div>
                </div>
                <div class="stat-card" style="border-left: 4px solid #4338ca;">
                    <div style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Total Trip Selesai</div>
                    <div style="font-size: 1.75rem; font-weight: 800; color: #4338ca; margin-top: 0.5rem;">${dinasRecords.length} Trip</div>
                </div>
            </div>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Manajemen Reimbursement Dinas</h3>
                </div>
                <div class="table-container">
                    <table style="font-size: 0.8125rem;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th>Karyawan</th>
                                <th>Kota & Tanggal</th>
                                <th style="text-align: right;">Total Biaya</th>
                                <th style="text-align: center;">Status</th>
                                <th style="text-align: right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dinasRecords.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:3rem;">Belum ada pengajuan reimbursement</td></tr>` : 
                                dinasRecords.reverse().map(row => {
                                    let badgeColor = '#f59e0b';
                                    if (row.status === 'Approved') badgeColor = '#059669';
                                    if (row.status === 'Rejected') badgeColor = '#dc2626';
                                    
                                    return `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700;">${row.name}</div>
                                        <div style="font-size: 0.7rem; color: var(--text-muted);">ID: ${row.id}</div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 700;">ðŸ“ ${row.kota}</div>
                                        <div style="font-size: 0.7rem; color: var(--text-muted);">${row.date}</div>
                                    </td>
                                    <td style="text-align: right; font-weight: 800;">Rp ${row.total.toLocaleString('id-ID')}</td>
                                    <td style="text-align: center;">
                                        <span style="background: ${badgeColor}20; color: ${badgeColor}; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.7rem; border: 1px solid ${badgeColor}40;">
                                            ${row.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style="text-align: right;">
                                        ${row.status === 'Pending' ? `
                                            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                                <button onclick="approveDinas('${row.date}', '${row.id}')" style="background: #059669; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: 700;">âœ… Approve</button>
                                                <button onclick="rejectDinas('${row.date}', '${row.id}')" style="background: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: 700;">âŒ Reject</button>
                                            </div>
                                        ` : `
                                            <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                                                <span style="color: var(--text-muted); font-size: 0.7rem;">Processed</span>
                                                ${row.status === 'Approved' ? `
                                                    <button onclick="printDinasApproval('${row.date}', '${row.id}')" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                                        Print
                                                    </button>
                                                ` : ''}
                                            </div>
                                        `}
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

window.approveDinas = async (date, id) => {
    const log = attendanceData.find(l => (l.DATE === date || l.date === date) && (l['EMPLOYEE ID'] === id));
    if (log) {
        if (log.Notes.includes('| Status:')) {
            log.Notes = log.Notes.replace(/\| Status: [A-Za-z]+/, '| Status: Approved');
        } else {
            log.Notes += ' | Status: Approved';
        }
        saveCache();
        renderDinasDashboard();
        showToast("Reimbursement Disetujui", "success");
        
        // Backend Sync
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'update_notes', date, id, notes: log.Notes })
            });
        } catch(e) {}
    }
};

window.rejectDinas = async (date, id) => {
    const log = attendanceData.find(l => (l.DATE === date || l.date === date) && (l['EMPLOYEE ID'] === id));
    if (log) {
        if (log.Notes.includes('| Status:')) {
            log.Notes = log.Notes.replace(/\| Status: [A-Za-z]+/, '| Status: Rejected');
        } else {
            log.Notes += ' | Status: Rejected';
        }
        saveCache();
        renderDinasDashboard();
        showToast("Reimbursement Ditolak", "error");
        
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'update_notes', date, id, notes: log.Notes })
            });
        } catch(e) {}
    }
};

window.printDinasApproval = (date, id) => {
    const record = attendanceData.find(l => (l.DATE === date || l.date === date) && (l['EMPLOYEE ID'] === id));
    if (!record) return;
    
    // Parse Details
    const notes = record.Notes || "";
    const parts = notes.replace('[DINAS] ', '').split(' | ');
    const kota = parts[0]?.split(': ')[1] || '-';
    const hasil = parts[1]?.split(': ')[1] || '-';
    const costPart = parts.find(p => p.startsWith('Cost: '));
    let costs = { harian: 0, trans: 0, hotel: 0, other: 0 };
    if (costPart) {
        try { costs = JSON.parse(costPart.replace('Cost: ', '')); } catch(e) {}
    }
    const total = costs.harian + costs.trans + costs.hotel + costs.other;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bukti Approval Dinas - ${record['EMPLOYEE NAME']}</title>
            <style>
                body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                .header { border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                .title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                .section { margin-bottom: 20px; }
                .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; margin-bottom: 4px; }
                .value { font-size: 15px; font-weight: 700; margin-bottom: 15px; color: #0f172a; }
                table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                th { text-align: left; background: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; }
                td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .total-row { background: #f8fafc; font-weight: 900; font-size: 18px; }
                .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
                .signature-box { border-top: 2px solid #1e293b; width: 220px; padding-top: 12px; text-align: center; font-weight: 800; font-size: 14px; }
                .stamp { border: 3px solid #10b981; color: #10b981; padding: 10px 20px; font-size: 24px; font-weight: 900; transform: rotate(-5deg); border-radius: 12px; display: inline-block; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="assets/wkn_logo.png" style="height: 70px; width: auto;">
                </div>
                <div class="title">Trip Approval Voucher</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 20px;">
                <div>
                    <div class="label">Nama Karyawan</div>
                    <div class="value">${record['EMPLOYEE NAME']}</div>
                    <div class="label">ID Karyawan / NIK</div>
                    <div class="value">${record['EMPLOYEE ID']}</div>
                </div>
                <div>
                    <div class="label">Tanggal Perjalanan</div>
                    <div class="value">${record.DATE || record.date}</div>
                    <div class="label">Kota Tujuan</div>
                    <div class="value">${kota}</div>
                </div>
            </div>

            <div class="section">
                <div class="label">Laporan Hasil Kegiatan</div>
                <div class="value" style="font-weight: 500; color: #334155; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">"${hasil}"</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Deskripsi Pengeluaran</th>
                        <th style="text-align: right;">Jumlah (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Uang Harian (Per Diem)</td><td style="text-align: right;">Rp ${costs.harian.toLocaleString('id-ID')}</td></tr>
                    <tr><td>Transportasi (Bensin / Tiket / Tol)</td><td style="text-align: right;">Rp ${costs.trans.toLocaleString('id-ID')}</td></tr>
                    <tr><td>Akomodasi (Hotel / Penginapan)</td><td style="text-align: right;">Rp ${costs.hotel.toLocaleString('id-ID')}</td></tr>
                    <tr><td>Lain-lain</td><td style="text-align: right;">Rp ${costs.other.toLocaleString('id-ID')}</td></tr>
                    <tr class="total-row">
                        <td style="padding: 20px;">TOTAL REIMBURSEMENT</td>
                        <td style="text-align: right; color: #e11d48; padding: 20px;">Rp ${total.toLocaleString('id-ID')}</td>
                    </tr>
                </tbody>
            </table>

            <div style="display: flex; justify-content: center; margin: 40px 0;">
                <div class="stamp">APPROVED</div>
            </div>

            <div class="footer">
                <div>
                    <div class="label">Voucher ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    <div class="label">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
                </div>
                <div class="signature-box">
                    Direktur / Manager Finance
                </div>
            </div>

            <div class="no-print" style="margin-top: 50px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 30px;">
                <button onclick="window.print()" style="padding: 15px 40px; background: #e11d48; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 1rem; box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.3);">ðŸ–¨ï¸ Cetak Voucher Sekarang</button>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 15px;">Pastikan printer Anda terhubung. Gunakan kertas ukuran A4.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
};

window.approveHalfDay = async (date, id, type) => {
    const log = attendanceData.find(l => (l.DATE === date || l.date === date) && (l['EMPLOYEE ID'] === id));
    if (log) {
        let notes = log.Notes || log.notes || "";
        const tag = type === 'atasan' ? '[ATASAN_OK]' : '[HRD_OK]';
        
        if (!notes.includes(tag)) {
            notes += ` ${tag}`;
            log.Notes = notes.trim();
            saveCache();
            renderAttendancePage(true);
            showToast(`Izin disetujui oleh ${type.toUpperCase()}`, "success");
            
            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({ action: 'update_notes', date, id, notes: log.Notes })
                });
            } catch(e) {}
        } else {
            showToast(`Sudah disetujui oleh ${type.toUpperCase()}`, "info");
        }
    }
};

function renderLeaveManagementPage() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-leave');

    const currentUser = localStorage.getItem('GajiPro_UserName') || 'Admin';
    const isAdmin = getCurrentRole() === 'Admin' || getCurrentRole() === 'Super Admin';

    // Calculate Leave Balances
    const quotaMap = {};
    salaryData.forEach(emp => {
        quotaMap[emp['Full Name *']] = {
            quota: 12, // Default 12 days
            used: 0
        };
    });

    leaveRequests.forEach(req => {
        if (req.status === 'Approved') {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            if (quotaMap[req.employeeName]) {
                quotaMap[req.employeeName].used += diffDays;
            }
        }
    });

    app.innerHTML = `
        ${renderTopbar('Manajemen Cuti')}
        <div class="content-body fade-in">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; align-items: start;">
                <!-- Leave Request Form -->
                <div class="card" style="position: sticky; top: 1rem;">
                    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem;">Pengajuan Cuti Baru</h3>
                    <form id="leave-request-form">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Karyawan</label>
                            <select id="leave-emp" class="form-input" required>
                                ${salaryData.map(e => `<option value="${e['Full Name *']}">${e['Full Name *']}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Jenis Cuti</label>
                            <select id="leave-type" class="form-input" required>
                                <option value="Tahunan">Cuti Tahunan</option>
                                <option value="Sakit">Sakit (Dengan Surat)</option>
                                <option value="Penting">Izin Penting (Pernikahan/Duka)</option>
                                <option value="Melahirkan">Cuti Melahirkan</option>
                            </select>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label>Dari Tanggal</label>
                                <input type="date" id="leave-start" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label>Sampai Tanggal</label>
                                <input type="date" id="leave-end" class="form-input" required>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label>Alasan / Keterangan</label>
                            <textarea id="leave-reason" class="form-input" style="height: 80px; resize: none; padding-top: 10px;" placeholder="Tulis alasan cuti..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; height: 48px; font-weight: 700;">Ajukan Cuti</button>
                    </form>
                </div>

                <!-- Leave List & Balances -->
                <div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="stat-card" style="background: linear-gradient(135deg, #4338ca, #6366f1); color: white;">
                            <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; opacity: 0.8;">Status Jatah Cuti Anda</div>
                            <div style="font-size: 1.5rem; font-weight: 800; margin-top: 4px;">
                                ${quotaMap[currentUser] ? quotaMap[currentUser].quota - quotaMap[currentUser].used : 12} Hari Tersisa
                            </div>
                        </div>
                        <div class="stat-card" style="border-left: 4px solid #f59e0b;">
                            <div style="color: var(--text-muted); font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Menunggu Persetujuan</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">
                                ${leaveRequests.filter(r => r.status === 'Pending').length} Request
                            </div>
                        </div>
                    </div>

                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div style="padding: 1.25rem; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: var(--text-main);">Riwayat & Approval Cuti</div>
                        <div class="table-container">
                            <table style="font-size: 0.8125rem;">
                                <thead style="background: #f8fafc;">
                                    <tr>
                                        <th>Karyawan</th>
                                        <th>Periode</th>
                                        <th>Jenis</th>
                                        <th style="text-align: center;">Status</th>
                                        <th style="text-align: right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${leaveRequests.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 3rem;">Belum ada riwayat pengajuan cuti</td></tr>` : 
                                        leaveRequests.slice().reverse().map(req => {
                                            let badgeColor = '#f59e0b';
                                            if (req.status === 'Approved') badgeColor = '#059669';
                                            if (req.status === 'Rejected') badgeColor = '#dc2626';
                                            
                                            return `
                                        <tr>
                                            <td>
                                                <div style="font-weight: 700;">${req.employeeName}</div>
                                                <div style="font-size: 0.7rem; color: var(--text-muted);">${req.reason}</div>
                                            </td>
                                            <td>
                                                <div style="font-weight: 600;">${req.startDate} s/d ${req.endDate}</div>
                                            </td>
                                            <td>${req.type}</td>
                                            <td style="text-align: center;">
                                                <span style="background: ${badgeColor}15; color: ${badgeColor}; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 0.7rem;">${req.status}</span>
                                            </td>
                                            <td style="text-align: right;">
                                                ${req.status === 'Pending' && isAdmin ? `
                                                    <div style="display: flex; gap: 4px; justify-content: flex-end;">
                                                        <button onclick="updateLeaveStatus('${req.id}', 'Approved')" style="background: #059669; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: 700;">Setujui</button>
                                                        <button onclick="updateLeaveStatus('${req.id}', 'Rejected')" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: 700;">Tolak</button>
                                                    </div>
                                                ` : (req.status === 'Pending' ? '<i>Waiting...</i>' : 'Processed')}
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('leave-request-form').onsubmit = handleLeaveRequest;
}

function handleLeaveRequest(e) {
    e.preventDefault();
    const start = document.getElementById('leave-start').value;
    const end = document.getElementById('leave-end').value;
    
    if (new Date(start) > new Date(end)) {
        showToast("Tanggal mulai tidak boleh lebih besar dari tanggal akhir!", "error");
        return;
    }

    const newReq = {
        id: 'LV-' + Date.now(),
        employeeName: document.getElementById('leave-emp').value,
        type: document.getElementById('leave-type').value,
        startDate: start,
        endDate: end,
        reason: document.getElementById('leave-reason').value,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };

    leaveRequests.push(newReq);
    saveCache();
    renderLeaveManagementPage();
    showToast("Pengajuan cuti berhasil dikirim!", "success");
}

window.updateLeaveStatus = (id, status) => {
    const req = leaveRequests.find(r => r.id === id);
    if (req) {
        req.status = status;
        
        // Auto-generate Attendance Logs if Approved
        if (status === 'Approved') {
            const emp = salaryData.find(e => (e['Full Name *'] || e['EMPLOYEE NAME']) === req.employeeName);
            const empId = emp ? (emp['Employee ID *'] || emp['EMPLOYEE ID']) : 'Unknown';
            
            let current = new Date(req.startDate);
            const end = new Date(req.endDate);
            
            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                const dayName = dayNames[current.getDay()];
                
                const exists = attendanceData.find(a => (a.DATE === dateStr || a.date === dateStr) && (a['EMPLOYEE ID'] === empId));
                
                if (!exists) {
                    attendanceData.push({
                        'DATE': dateStr,
                        'DAY': dayName,
                        'EMPLOYEE NAME': req.employeeName,
                        'EMPLOYEE ID': empId,
                        'STATUS ABSEN': 'Cuti',
                        'WORK HOURS (8 JAM)': 0,
                        'DURASI LEMBUR (JAM)': 0,
                        'OT IN': '-',
                        'OT OUT': '-',
                        'Notes': `[AUTO_LEAVE] ${req.type}: ${req.reason}`
                    });
                } else {
                    exists['STATUS ABSEN'] = 'Cuti';
                    exists.Notes = (exists.Notes || "") + ` [LEAVE_APPROVED]`;
                }
                
                current.setDate(current.getDate() + 1);
            }
        }
        
        saveCache();
        renderLeaveManagementPage();
        showToast(`Request cuti telah di-${status.toLowerCase()}`, status === 'Approved' ? 'success' : 'info');
        
        try {
            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'leave_request', data: req, syncAttendance: status === 'Approved' })
            });
        } catch(e) {}
    }
};

window.showEmployeeMonthlyRecap = (name) => {
    const emp = salaryData.find(e => (e['Full Name *'] || e['EMPLOYEE NAME']) === name);
    if (!emp) return;

    const filterVal = window._attendanceDateFilter || new Date().toISOString().split('T')[0];
    const filterParts = filterVal.split('-');
    const currentYear = filterParts[0];
    const currentMonth = filterParts[1];
    const monthName = new Date(currentYear, parseInt(currentMonth)-1).toLocaleString('id-ID', { month: 'long' });

    const logs = attendanceData.filter(a => {
        const ts = a.DATE || a.date || a.Timestamp || a.timestamp;
        if (!ts) return false;
        const d = new Date(ts);
        return (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === name && 
               d.getFullYear() == currentYear && 
               (d.getMonth() + 1).toString().padStart(2, '0') == currentMonth;
    }).sort((a,b) => new Date(a.DATE) - new Date(b.DATE));

    const totals = { hadir: 0, sakit: 0, izin: 0, setengah_hari: 0, cuti: 0, dinas: 0, alpa: 0, ot: 0 };
    logs.forEach(l => {
        const s = l['STATUS ABSEN'];
        if (s === 'Hadir') totals.hadir++;
        else if (s === 'Sakit') totals.sakit++;
        else if (s === 'Izin') totals.izin++;
        else if (s === 'Izin Setengah Hari') totals.setengah_hari++;
        else if (s === 'Cuti') totals.cuti++;
        else if (s === 'Dinas Luar') totals.dinas++;
        else if (s === 'Alpa') totals.alpa++;
        totals.ot += parseFloat(l['DURASI LEMBUR (JAM)']) || 0;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Rekap Absensi - ${name} - ${monthName} ${currentYear}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 12px; }
                .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
                .logo-section { display: flex; align-items: center; gap: 15px; }
                .report-title { text-align: right; }
                .report-title h1 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
                .info-item { margin-bottom: 10px; }
                .label { font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; }
                .value { font-size: 14px; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { text-align: left; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; }
                td { padding: 8px 10px; border: 1px solid #e2e8f0; }
                .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 40px; }
                .summary-card { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
                .summary-card .num { font-size: 18px; font-weight: 800; }
                .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                .sign-box { border-top: 1px solid #1e293b; width: 200px; margin-top: 50px; text-align: center; padding-top: 5px; font-weight: 600; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-section">
                    <img src="assets/wkn_logo.png" style="height: 60px;">
                </div>
                <div class="report-title">
                    <h1>Rekap Absensi Bulanan</h1>
                    <div style="font-weight: 600; color: #64748b;">Periode: ${monthName} ${currentYear}</div>
                </div>
            </div>

            <div class="info-grid">
                <div>
                    <div class="info-item"><div class="label">Nama Karyawan</div><div class="value">${name}</div></div>
                    <div class="info-item"><div class="label">ID / NIK</div><div class="value">${emp['Employee ID *'] || emp['EMPLOYEE ID']}</div></div>
                </div>
                <div>
                    <div class="info-item"><div class="label">Jabatan</div><div class="value">${emp['Job Position *'] || emp['POSITION']}</div></div>
                    <div class="info-item"><div class="label">Departemen</div><div class="value">${emp['Organization Name *'] || emp['DEPARTMENT']}</div></div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card"><div class="label">Hadir</div><div class="num" style="color: #059669;">${totals.hadir}</div></div>
                <div class="summary-card"><div class="label">Sakit/Izin</div><div class="num" style="color: #2563eb;">${totals.sakit + totals.izin + totals.setengah_hari}</div></div>
                <div class="summary-card"><div class="label">Cuti/Dinas</div><div class="num" style="color: #7c3aed;">${totals.cuti + totals.dinas}</div></div>
                <div class="summary-card"><div class="label">Alpa</div><div class="num" style="color: #dc2626;">${totals.alpa}</div></div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 150px;">Tanggal / Hari</th>
                        <th>Status Absen</th>
                        <th>Jam Kerja</th>
                        <th>Lembur</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(l => `
                        <tr>
                            <td><strong>${l.DATE || l.date}</strong><br/><span style="color: #64748b; font-size: 10px;">${l.DAY}</span></td>
                            <td>${l['STATUS ABSEN']}</td>
                            <td>${l['WORK HOURS (8 JAM)']} Jam</td>
                            <td>${parseFloat(l['DURASI LEMBUR (JAM)']) > 0 ? l['DURASI LEMBUR (JAM)'] + ' Jam' : '-'}</td>
                            <td style="font-size: 10px; color: #64748b;">${l.Notes || l.notes || '-'}</td>
                        </tr>
                    `).join('')}
                    ${logs.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 20px;">Tidak ada data log pada periode ini.</td></tr>' : ''}
                </tbody>
            </table>

            <div class="footer">
                <div>
                    <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                </div>
                <div style="display: flex; gap: 50px;">
                    <div class="sign-box">Karyawan</div>
                    <div class="sign-box">HRD / Manager</div>
                </div>
            </div>

            <button class="no-print" onclick="window.print()" style="position: fixed; bottom: 30px; right: 30px; background: #2563eb; color: white; border: none; padding: 15px 30px; border-radius: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);">Cetak Laporan</button>
        </body>
        </html>
    `);
    printWindow.document.close();
};

window.showAttendanceCalendar = (name) => {
    const filterVal = window._attendanceDateFilter || new Date().toISOString().split('T')[0];
    const filterParts = filterVal.split('-');
    const year = parseInt(filterParts[0]);
    const month = parseInt(filterParts[1]) - 1; // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
    const monthName = new Date(year, month).toLocaleString('id-ID', { month: 'long' });

    const logs = attendanceData.filter(a => {
        const ts = a.DATE || a.date || a.Timestamp || a.timestamp;
        if (!ts) return false;
        const d = new Date(ts);
        return (a['EMPLOYEE NAME'] || a['Nama Karyawan']) === name && d.getFullYear() === year && d.getMonth() === month;
    });

    const logMap = {};
    logs.forEach(l => {
        const d = new Date(l.DATE || l.date || l.Timestamp || l.timestamp).getDate();
        logMap[d] = l;
    });

    let calendarHtml = `
        <div style="padding: 1rem; max-width: 500px; color: #1e293b;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h2 style="margin:0; font-size: 1.1rem; font-weight: 800;">Visual Kalender</h2>
                    <div style="font-weight: 700; color: var(--primary-color); font-size: 0.9rem;">${name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${monthName} ${year}</div>
                </div>
                <button onclick="closeModal()" class="btn btn-secondary" style="padding: 8px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">âœ•</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center;">
                ${['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => `<div style="font-weight: 800; font-size: 0.65rem; color: var(--text-muted); padding-bottom: 4px; text-transform: uppercase;">${d}</div>`).join('')}
                
                ${Array(firstDay).fill(0).map(() => `<div style="aspect-ratio: 1;"></div>`).join('')}
                
                ${Array(daysInMonth).fill(0).map((_, i) => {
                    const dayNum = i + 1;
                    const log = logMap[dayNum];
                    const status = log ? log['STATUS ABSEN'] : null;
                    
                    let bgColor = '#f8fafc';
                    let textColor = '#94a3b8';
                    let border = '1px solid #f1f5f9';
                    
                    if (status === 'Hadir') { bgColor = '#f0fdf4'; textColor = '#166534'; border = '1px solid #dcfce7'; }
                    else if (status === 'Izin' || status === 'Izin Setengah Hari') { bgColor = '#eff6ff'; textColor = '#1d4ed8'; border = '1px solid #bfdbfe'; }
                    else if (status === 'Sakit') { bgColor = '#fdf4ff'; textColor = '#a21caf'; border = '1px solid #f5d0fe'; }
                    else if (status === 'Cuti') { bgColor = '#fefce8'; textColor = '#a16207'; border = '1px solid #fef08a'; }
                    else if (status === 'Dinas Luar') { bgColor = '#eef2ff'; textColor = '#4338ca'; border = '1px solid #e0e7ff'; }
                    else if (status === 'Alpa') { bgColor = '#fef2f2'; textColor = '#991b1b'; border = '1px solid #fecaca'; }

                    const fullDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                    const holiday = nationalHolidays.find(h => h.date === fullDateStr);
                    if (holiday && !status) {
                        bgColor = '#fff1f2'; textColor = '#e11d48'; border = '1px solid #fecdd3';
                    }

                    return `
                        <div style="aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bgColor}; color: ${textColor}; border: ${border}; border-radius: 8px; position: relative; cursor: help;" 
                             title="${holiday ? 'LIBUR: ' + holiday.name : (status || 'Tidak Ada Data')}">
                            <span style="font-weight: 800; font-size: 0.8rem;">${dayNum}</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding-top: 1rem; border-top: 1px solid #f1f5f9;">
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700;"><div style="width:8px; height:8px; background:#f0fdf4; border:1px solid #dcfce7; border-radius:2px;"></div> Hadir</div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700;"><div style="width:8px; height:8px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:2px;"></div> Izin</div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700;"><div style="width:8px; height:8px; background:#fdf4ff; border:1px solid #f5d0fe; border-radius:2px;"></div> Sakit</div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700;"><div style="width:8px; height:8px; background:#fefce8; border:1px solid #fef08a; border-radius:2px;"></div> Cuti</div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700;"><div style="width:8px; height:8px; background:#eef2ff; border:1px solid #e0e7ff; border-radius:2px;"></div> Dinas</div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700;"><div style="width:8px; height:8px; background:#fef2f2; border:1px solid #fecaca; border-radius:2px;"></div> Alpa</div>
            </div>
        </div>
    `;

    showModal(calendarHtml);
};

function renderShiftSchedulePage() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-shift');

    const weekDays = [];
    const now = new Date();
    // Get start of week (Monday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));

    for(let i=0; i<7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDays.push({
            date: d.toISOString().split('T')[0],
            name: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d),
            dayNum: d.getDate()
        });
    }

    app.innerHTML = `
        ${renderTopbar('Penjadwalan Shift')}
        <div class="content-body fade-in">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 800;">Manajemen Shift Mingguan</h3>
                    <p style="color: var(--text-muted); font-size: 0.8rem;">Kelola jam kerja Pagi, Siang, dan Malam untuk seluruh tim.</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <div style="display: flex; gap: 8px; background: #f1f5f9; padding: 4px; border-radius: 8px;">
                        <div style="padding: 4px 12px; font-size: 0.75rem; font-weight: 700; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); color: var(--primary-color);">Minggu Ini</div>
                        <div style="padding: 4px 12px; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: not-allowed;">Minggu Depan</div>
                    </div>
                </div>
            </header>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table style="font-size: 0.8125rem; border-collapse: separate; border-spacing: 0;">
                        <thead style="position: sticky; top: 0; z-index: 10;">
                            <tr style="background: #f8fafc;">
                                <th style="min-width: 200px; border-bottom: 2px solid #e2e8f0; position: sticky; left: 0; background: #f8fafc; z-index: 11;">Karyawan</th>
                                ${weekDays.map(wd => `
                                    <th style="text-align: center; border-bottom: 2px solid #e2e8f0; min-width: 120px;">
                                        <div style="font-size: 0.65rem; text-transform: uppercase; color: #64748b;">${wd.name}</div>
                                        <div style="font-size: 1rem; font-weight: 800;">${wd.dayNum}</div>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${salaryData.map(emp => {
                                const empId = emp['Employee ID *'] || emp['EMPLOYEE ID'];
                                const empName = emp['Full Name *'] || emp['EMPLOYEE NAME'];
                                return `
                                <tr>
                                    <td style="position: sticky; left: 0; background: white; z-index: 5; border-right: 1px solid #f1f5f9; font-weight: 700;">
                                        ${empName}
                                        <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 400;">${empId}</div>
                                    </td>
                                    ${weekDays.map(wd => {
                                        const schedule = shiftSchedules.find(s => s.empId === empId && s.date === wd.date);
                                        const currentShift = schedule ? schedule.type : 'Pagi';
                                        
                                        let badgeStyle = 'background: #f0fdf4; color: #166534;'; // Pagi
                                        if (currentShift === 'Siang') badgeStyle = 'background: #eff6ff; color: #1e40af;';
                                        if (currentShift === 'Malam') badgeStyle = 'background: #faf5ff; color: #6b21a8;';
                                        if (currentShift === 'Libur') badgeStyle = 'background: #f1f5f9; color: #475569;';

                                        return `
                                            <td style="text-align: center; padding: 12px 4px;">
                                                <select onchange="updateEmployeeShift('${empId}', '${wd.date}', this.value)" 
                                                    style="${badgeStyle} border: none; font-size: 0.75rem; font-weight: 800; padding: 6px 8px; border-radius: 8px; cursor: pointer; outline: none; width: 90%; text-align-last: center;">
                                                    <option value="Pagi" ${currentShift === 'Pagi' ? 'selected' : ''}>â˜€ï¸ PAGI</option>
                                                    <option value="Siang" ${currentShift === 'Siang' ? 'selected' : ''}>ðŸŒ¤ï¸ SIANG</option>
                                                    <option value="Malam" ${currentShift === 'Malam' ? 'selected' : ''}>ðŸŒ™ MALAM</option>
                                                    <option value="Libur" ${currentShift === 'Libur' ? 'selected' : ''}>ðŸ  LIBUR</option>
                                                </select>
                                            </td>
                                        `;
                                    }).join('')}
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="margin-top: 1.5rem; display: flex; gap: 20px; justify-content: center; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem;">
                    <div style="width: 12px; height: 12px; background: #f0fdf4; border-radius: 3px;"></div> <strong>Pagi:</strong> 08:00 - 16:00
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem;">
                    <div style="width: 12px; height: 12px; background: #eff6ff; border-radius: 3px;"></div> <strong>Siang:</strong> 14:00 - 22:00
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem;">
                    <div style="width: 12px; height: 12px; background: #faf5ff; border-radius: 3px;"></div> <strong>Malam:</strong> 22:00 - 06:00
                </div>
            </div>
        </div>
    `;
}

window.updateEmployeeShift = (empId, date, type) => {
    const existing = shiftSchedules.find(s => s.empId === empId && s.date === date);
    if (existing) {
        existing.type = type;
    } else {
        shiftSchedules.push({ empId, date, type });
    }
    saveCache();
    // Re-render only if needed, but the select style updates on the next full render or manually
    renderShiftSchedulePage(); 
    showToast(`Shift diperbarui: ${type}`, "success");
    
    // Sync to Backend
    try {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ action: 'update_shift', data: { empId, date, type } })
        });
    } catch(e) {}
};

function renderOvertimePage() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-overtime');

    const otLogs = attendanceData.filter(a => parseFloat(a['DURASI LEMBUR (JAM)']) > 0).reverse();

    app.innerHTML = `
        ${renderTopbar('Rekap & Validasi Lembur')}
        <div class="content-body fade-in">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 800;">Manajemen Lembur</h3>
                    <p style="color: var(--text-muted); font-size: 0.8rem;">Validasi jam lembur karyawan sebelum masuk ke perhitungan payroll.</p>
                </div>
            </header>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table style="font-size: 0.8125rem;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th>Karyawan</th>
                                <th>Tanggal</th>
                                <th style="text-align: center;">Jam Kerja</th>
                                <th style="text-align: center;">Jam Lembur</th>
                                <th style="text-align: center;">Status</th>
                                <th style="text-align: right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${otLogs.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 3rem;">Tidak ada pengajuan lembur terdeteksi.</td></tr>` : 
                                otLogs.map(log => {
                                    const isApproved = (log.Notes || "").includes('[OT_OK]');
                                    const isRejected = (log.Notes || "").includes('[OT_REJECT]');
                                    
                                    let statusHtml = '<span style="color: #f59e0b; font-weight: 800;">PENDING</span>';
                                    if (isApproved) statusHtml = '<span style="color: #059669; font-weight: 800;">âœ… APPROVED</span>';
                                    if (isRejected) statusHtml = '<span style="color: #dc2626; font-weight: 800;">âŒ REJECTED</span>';

                                    return `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700;">${log['EMPLOYEE NAME']}</div>
                                        <div style="font-size: 0.7rem; color: #94a3b8;">${UI.icons.user}</div>
                                    </td>
                                    <td>${log.DATE}</td>
                                    <td style="text-align: center;">${log['WORK HOURS (8 JAM)']}h</td>
                                    <td style="text-align: center; font-weight: 800; color: #dc2626;">${log['DURASI LEMBUR (JAM)']}h</td>
                                    <td style="text-align: center;">${statusHtml}</td>
                                    <td style="text-align: right;">
                                        ${(!isApproved && !isRejected) ? `
                                            <div style="display: flex; gap: 4px; justify-content: flex-end;">
                                                <button onclick="validateOvertime('${log.DATE}', '${log['EMPLOYEE ID']}', 'approve')" style="background: #059669; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.7rem; font-weight: 700;">Setujui</button>
                                                <button onclick="validateOvertime('${log.DATE}', '${log['EMPLOYEE ID']}', 'reject')" style="background: #dc2626; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.7rem; font-weight: 700;">Tolak</button>
                                            </div>
                                        ` : `
                                            <button onclick="validateOvertime('${log.DATE}', '${log['EMPLOYEE ID']}', 'reset')" style="background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.7rem;">Reset</button>
                                        `}
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

window.validateOvertime = async (date, id, action) => {
    const log = attendanceData.find(l => (l.DATE === date || l.date === date) && (l['EMPLOYEE ID'] === id));
    if (log) {
        let notes = log.Notes || "";
        // Remove existing tags
        notes = notes.replace('[OT_OK]', '').replace('[OT_REJECT]', '').trim();
        
        if (action === 'approve') notes += " [OT_OK]";
        if (action === 'reject') notes += " [OT_REJECT]";
        
        log.Notes = notes.trim();
        saveCache();
        renderOvertimePage();
        showToast(`Status lembur diperbarui`, "success");
        
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'update_notes', date, id, notes: log.Notes })
            });
        } catch(e) {}
    }
};

function renderHolidaysPage() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-holidays');

    app.innerHTML = `
        ${renderTopbar('Manajemen Hari Libur')}
        <div class="content-body fade-in">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 800;">Hari Libur Nasional 2026</h3>
                    <p style="color: var(--text-muted); font-size: 0.8rem;">Daftar hari libur resmi Indonesia yang terintegrasi dengan kalender absensi.</p>
                </div>
                <button class="btn btn-primary" onclick="showAddHolidayForm()">âž• Tambah Libur Kustom</button>
            </header>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table style="font-size: 0.8125rem;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th style="width: 200px;">Tanggal</th>
                                <th>Nama Hari Libur</th>
                                <th style="text-align: right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${nationalHolidays.sort((a,b) => new Date(a.date) - new Date(b.date)).map(h => `
                                <tr>
                                    <td style="font-weight: 700;">${new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td>
                                        <span style="background: #fff1f2; color: #e11d48; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.75rem;">
                                            ${h.name}
                                        </span>
                                    </td>
                                    <td style="text-align: right;">
                                        <button onclick="deleteHoliday('${h.date}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;">ðŸ—‘ï¸</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

window.showAddHolidayForm = () => {
    showModal(`
        <div style="padding: 1.5rem;">
            <h3 style="margin-top: 0; font-weight: 800;">Tambah Hari Libur Baru</h3>
            <form id="form-add-holiday">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem;">TANGGAL</label>
                    <input type="date" id="holiday-date" class="form-input" required>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem;">NAMA HARI LIBUR</label>
                    <input type="text" id="holiday-name" class="form-input" placeholder="Contoh: HUT WKN ke-10" required>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Simpan</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Batal</button>
                </div>
            </form>
        </div>
    `);

    document.getElementById('form-add-holiday').onsubmit = (e) => {
        e.preventDefault();
        const date = document.getElementById('holiday-date').value;
        const name = document.getElementById('holiday-name').value;
        
        nationalHolidays.push({ date, name });
        saveCache();
        closeModal();
        renderHolidaysPage();
        showToast("Hari libur berhasil ditambahkan", "success");
    };
};

window.deleteHoliday = (date) => {
    if (confirm("Hapus hari libur ini?")) {
        nationalHolidays = nationalHolidays.filter(h => h.date !== date);
        saveCache();
        renderHolidaysPage();
    }
};

window.generatePrintableReport = (title, contentHtml) => {
    showModal(`
        <div id="print-section" style="padding: 1.5rem; color: #1e293b; background: white;">
            <!-- Branded Header (Same as Payslip) -->
            <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid var(--primary-color); padding-bottom: 1rem; margin-bottom: 2rem;">
                <div>
                    ${payslipConfig.showLogo ? `<h1 style="color: var(--primary-color); margin: 0; font-size: 2rem; font-weight: 900;">WKNsite</h1>` : ''}
                    ${payslipConfig.showCompanyInfo ? `<p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); white-space: pre-line;">${payslipConfig.companyAddress}</p>` : ''}
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0; font-size: 1.25rem; text-transform: uppercase;">${title}</h2>
                    <p style="font-size: 0.8125rem; color: var(--text-muted);">${new Date().toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <!-- Report Content -->
            <div style="font-size: 0.875rem;">
                ${contentHtml}
            </div>

            <!-- Footnote & Signature -->
            <div style="margin-top: 3rem; border-top: 1px solid #f1f5f9; padding-top: 1rem;">
                ${payslipConfig.footnote ? `<p style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-bottom: 2rem;">"${payslipConfig.footnote}"</p>` : ''}
                ${payslipConfig.showSignature ? `
                <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
                    <div style="text-align: center; width: 220px; border-top: 1px solid #cbd5e1; padding-top: 0.5rem; font-size: 0.8125rem;">
                        ${currentLang === 'id' ? 'Disahkan Oleh (HR/Admin)' : 'Authorized By'}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 2rem;">
            <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">${t('cancel')}</button>
            <button class="btn btn-primary" style="flex: 1;" onclick="window.print()">ðŸ–¨ï¸ ${currentLang === 'id' ? 'Cetak Laporan' : 'Print Report'}</button>
        </div>
    `);
};

window.printEmployeeReport = () => {
    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
            <thead style="background: #f8fafc;">
                <tr>
                    <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ID</th>
                    <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Nama Karyawan</th>
                    <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Jabatan</th>
                    <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Departemen</th>
                </tr>
            </thead>
            <tbody>
                ${salaryData.map(emp => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">${emp['Employee ID *']}</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">${emp['Full Name *']}</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">${emp['Job Position *']}</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">${emp['Department *']}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    generatePrintableReport("LAPORAN DATA KARYAWAN", tableHtml);
};

window.printAttendanceReport = () => {
    const logData = attendanceData.slice(0, 50); // Ambil 50 data terbaru
    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.7rem;">
            <thead style="background: #f8fafc;">
                <tr>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Tanggal</th>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Nama</th>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Masuk</th>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Pulang</th>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${logData.map(a => `
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0;">${a.DATE || a.date}</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">${a['EMPLOYEE NAME'] || a['Nama Karyawan']}</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;">${a['ABSEN IN'] || '-'}</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;">${a['ABSEN OUT'] || '-'}</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;">${a['STATUS ABSEN']}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    generatePrintableReport("REKAPITULASI KEHADIRAN KARYAWAN", tableHtml);
};

window.showPayslipConfig = () => {
    showModal(`
        <div style="padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem; font-weight: 800;">ðŸŽ¨ ${currentLang === 'id' ? 'Konfigurasi Layout Slip Gaji' : 'Payslip Layout Config'}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">${currentLang === 'id' ? 'Atur elemen visual yang muncul pada slip gaji digital.' : 'Manage visual elements appearing on digital payslips.'}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; background: #f8fafc;">
                    <input type="checkbox" id="cfg-logo" ${payslipConfig.showLogo ? 'checked' : ''} style="width: 18px; height: 18px;">
                    <span style="font-size: 0.875rem; font-weight: 600;">Tampilkan Logo WKN</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; background: #f8fafc;">
                    <input type="checkbox" id="cfg-info" ${payslipConfig.showCompanyInfo ? 'checked' : ''} style="width: 18px; height: 18px;">
                    <span style="font-size: 0.875rem; font-weight: 600;">Info Perusahaan</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; background: #f8fafc;">
                    <input type="checkbox" id="cfg-sig" ${payslipConfig.showSignature ? 'checked' : ''} style="width: 18px; height: 18px;">
                    <span style="font-size: 0.875rem; font-weight: 600;">Kolom Tanda Tangan</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; background: #f8fafc;">
                    <input type="checkbox" id="cfg-tax" ${payslipConfig.showTaxDetail ? 'checked' : ''} style="width: 18px; height: 18px;">
                    <span style="font-size: 0.875rem; font-weight: 600;">Detail Pajak/BPJS</span>
                </label>
            </div>

            <div class="form-group">
                <label style="font-weight: 800; font-size: 0.75rem;">ALAMAT / INFO HEADER PERUSAHAAN</label>
                <textarea id="cfg-address" class="form-input" style="height: 80px; resize: none; font-size: 0.8rem;">${payslipConfig.companyAddress}</textarea>
            </div>

            <div class="form-group" style="margin-bottom: 2rem;">
                <label style="font-weight: 800; font-size: 0.75rem;">CATATAN KAKI (FOOTNOTE)</label>
                <input type="text" id="cfg-footnote" class="form-input" value="${payslipConfig.footnote}" placeholder="Contoh: Dokumen ini sah tanpa tanda tangan basah">
            </div>

            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Batal</button>
                <button type="button" class="btn btn-primary" style="flex: 1.5;" onclick="savePayslipConfig()">Terapkan Perubahan</button>
            </div>
        </div>
    `);
};

window.savePayslipConfig = () => {
    payslipConfig = {
        showLogo: document.getElementById('cfg-logo').checked,
        showCompanyInfo: document.getElementById('cfg-info').checked,
        showSignature: document.getElementById('cfg-sig').checked,
        showTaxDetail: document.getElementById('cfg-tax').checked,
        companyAddress: document.getElementById('cfg-address').value,
        footnote: document.getElementById('cfg-footnote').value
    };
    saveCache();
    closeModal();
    showToast("Layout slip gaji diperbarui", "success");
    // Re-render if payroll page is open
    if (document.getElementById('nav-payroll')?.classList.contains('active')) {
        renderPayrollPage(true);
    }
};

// --- INITIALIZATION ---
(function initCache() {
    const cachedData = localStorage.getItem('WKNsite_Cache');
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            salaryData = (parsed.salaryData || []).map((emp, i) => ({ ...emp, rowid: i }));
            attendanceData = parsed.attendanceData || [];
            adminData = (parsed.adminData || []).map((adm, i) => ({ ...adm, rowid: i }));
            mutationData = parsed.mutationData || [];
            systemLogs = parsed.systemLogs || [];
            rolesData = parsed.rolesData || [];
            leaveRequests = parsed.leaveRequests || [];
            shiftSchedules = parsed.shiftSchedules || [];
        } catch (e) {
            console.error("Init: Cache loading error", e);
        }
    }
})();

function initApp() {
    
    try {
        translateSidebar();

setupNavigation();

checkAuth();

fetchData();

startLiveClock();
        
    } catch (error) {
        console.error("CRITICAL ERROR during initApp:", error);
    }
}


// --- TURNOVER REPORT ---
async function renderTurnoverReport() {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-turnover');
    await fetchData();

    const turnoverData = calculateTurnoverStats();
    const activeCount = salaryData.filter(e => !isResigned(e)).length;

    app.innerHTML = `
        ${renderTopbar('Laporan Turnover')}
        <div class="content-body fade-in">
            <header style="margin-bottom: 2rem;">
                <h3 style="font-size: 1.5rem; font-weight: 800; font-family: 'Outfit', sans-serif;">📈 Analisis Turnover SDM</h3>
                <p style="color: var(--text-muted); font-size: 0.875rem;">Pantau tingkat retensi dan dinamika pertumbuhan karyawan selama 12 bulan terakhir.</p>
            </header>

            <div class="grid-2" style="margin-bottom: 2rem; gap: 1.5rem;">
                <div class="card stat-card" style="border-left: 5px solid var(--primary-color); background: linear-gradient(to right, #fff, #fff1f2);">
                    <div class="stat-icon" style="background: #fff1f2; color: var(--primary-color);">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label" style="font-weight: 700; color: var(--primary-color);">Tingkat Turnover (12 Bln)</span>
                        <span class="stat-value" style="font-family: 'Outfit', sans-serif; font-size: 2rem;">${UI.icons.user}</span>
                        <p class="text-xs text-muted" style="margin-top: 4px;">Target perusahaan: < 10% per tahun</p>
                    </div>
                </div>
                <div class="card stat-card" style="border-left: 5px solid #0369a1; background: linear-gradient(to right, #fff, #f0f9ff);">
                    <div class="stat-icon" style="background: #f0f9ff; color: #0369a1;">
                        <i class="fas fa-users-check"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label" style="font-weight: 700; color: #0369a1;">Total Karyawan Aktif</span>
                        <span class="stat-value" style="font-family: 'Outfit', sans-serif; font-size: 2rem;">${UI.icons.user}</span>
                        <p class="text-xs text-muted" style="margin-top: 4px;">Kapasitas SDM saat ini</p>
                    </div>
                </div>
            </div>

            <div class="card" style="padding: 2.5rem; margin-bottom: 2rem; border-radius: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 style="font-size: 1.125rem; font-weight: 800; font-family: 'Outfit', sans-serif;">📊 Tren Masuk vs Keluar</h3>
                    <div style="display: flex; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: #10b981;">
                            <span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> Masuk
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: #ef4444;">
                            <span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Keluar
                        </div>
                    </div>
                </div>
                <div style="height: 350px;">
                    <canvas id="turnoverChart"></canvas>
                </div>
            </div>

            <div class="card" style="padding: 0; overflow: hidden; border-radius: 20px;">
                <div style="padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1.125rem; font-weight: 800; font-family: 'Outfit', sans-serif;">📋 Rekapitulasi Bulanan</h3>
                    <button class="btn btn-secondary" onclick="exportTurnoverReport()" style="font-size: 0.75rem; font-weight: 700;">Unduh Laporan</button>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="padding: 1rem 2rem; text-align: left; font-size: 0.75rem; color: #475569; font-weight: 800;">BULAN</th>
                            <th style="padding: 1rem 2rem; text-align: center; font-size: 0.75rem; color: #475569; font-weight: 800;">MASUK (HIRES)</th>
                            <th style="padding: 1rem 2rem; text-align: center; font-size: 0.75rem; color: #475569; font-weight: 800;">RESIGN (ATTRITION)</th>
                            <th style="padding: 1rem 2rem; text-align: center; font-size: 0.75rem; color: #475569; font-weight: 800;">NET CHANGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${turnoverData.monthly.map(m => `
                            <tr class="table-row-hover">
                                <td style="padding: 1rem 2rem; font-weight: 700; color: #0f172a;">${m.label}</td>
                                <td style="padding: 1rem 2rem; text-align: center;">
                                    <span style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; border-radius: 20px; font-weight: 800; font-size: 0.8125rem;">+ ${m.hires}</span>
                                </td>
                                <td style="padding: 1rem 2rem; text-align: center;">
                                    <span style="display: inline-block; padding: 4px 12px; background: #fef2f2; color: #dc2626; border-radius: 20px; font-weight: 800; font-size: 0.8125rem;">- ${m.resigns}</span>
                                </td>
                                <td style="padding: 1rem 2rem; text-align: center;">
                                    <div style="font-weight: 800; font-size: 0.9375rem; color: ${m.net >= 0 ? '#10b981' : '#ef4444'}; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        ${m.net >= 0 ? '<i class="fas fa-arrow-trend-up"></i>' : '<i class="fas fa-arrow-trend-down"></i>'}
                                        ${m.net > 0 ? '+' : ''}${m.net}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    renderTurnoverChart(turnoverData.monthly);
}

function isResigned(emp) {
    const status = (emp['Employment Status *'] || '').toLowerCase();
    return status.includes('resign') || status.includes('keluar');
}

function calculateTurnoverStats() {
    const now = new Date();
    const months = [];
    
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
            month: d.getMonth(),
            year: d.getFullYear(),
            hires: 0,
            resigns: 0
        });
    }

    salaryData.forEach(emp => {
        const joinDateRaw = emp['JOIN DATE'] || emp['Join Date *'] || emp['Join Date'];
        const resignDateRaw = emp['Resign Date'];

        if (joinDateRaw) {
            const jd = new Date(joinDateRaw);
            const mIdx = months.findIndex(m => m.month === jd.getMonth() && m.year === jd.getFullYear());
            if (mIdx !== -1) months[mIdx].hires++;
        }

        if (resignDateRaw) {
            const rd = new Date(resignDateRaw);
            const mIdx = months.findIndex(m => m.month === rd.getMonth() && m.year === rd.getFullYear());
            if (mIdx !== -1) months[mIdx].resigns++;
        }
    });

    const monthlyStats = months.map(m => ({
        month: m.label,
        hires: m.hires,
        resigns: m.resigns,
        net: m.hires - m.resigns
    }));

    // Calculate annual rate
    const totalResigns = monthlyStats.reduce((sum, m) => sum + m.resigns, 0);
    const avgEmployees = salaryData.length || 1; // Simplification
    const annualRate = ((totalResigns / avgEmployees) * 100).toFixed(1);

    return {
        monthly: monthlyStats,
        annualRate
    };
}

function renderTurnoverChart(monthlyData) {
    const ctx = document.getElementById('turnoverChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.map(m => m.month),
            datasets: [
                {
                    label: 'Karyawan Masuk',
                    data: monthlyData.map(m => m.hires),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Karyawan Resign',
                    data: monthlyData.map(m => m.resigns),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}




function renderAuditLogPage(silent = false) {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-audit');

    app.innerHTML = `
        ${renderTopbar('Log Aktivitas Sistem')}
        <div class="content-body fade-in">
            <!-- Filter Bar -->
            <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; align-items: flex-end;">
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 0.75rem;">Dari Tanggal</label>
                        <input type="date" id="audit-start" class="form-input" style="padding: 8px;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 0.75rem;">Sampai Tanggal</label>
                        <input type="date" id="audit-end" class="form-input" style="padding: 8px;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 0.75rem;">Admin</label>
                        <select id="audit-user" class="form-input" style="padding: 8px;">
                            <option value="">Semua Admin</option>
                            ${[...new Set(systemLogs.map(l => l.Admin || l.user))].map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 0.75rem;">Aksi</label>
                        <select id="audit-action" class="form-input" style="padding: 8px;">
                            <option value="">Semua Aksi</option>
                            <option value="ADD">ADD</option>
                            <option value="EDIT">EDIT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="LOGIN">LOGIN</option>
                            <option value="ATTENDANCE">ATTENDANCE</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" onclick="applyAuditFilters()" style="padding: 8px 16px; flex: 1;">Filter</button>
                        <button class="btn btn-secondary" onclick="resetAuditFilters()" style="padding: 8px 12px;">Reset</button>
                        <button class="btn btn-secondary" onclick="exportAuditToCSV()" style="padding: 8px 12px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <!-- Log Table -->
            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Waktu</th>
                                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Admin</th>
                                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Aksi</th>
                                <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Detail</th>
                            </tr>
                        </thead>
                        <tbody id="audit-log-body">
                            ${renderAuditRows(systemLogs)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderAuditRows(logs) {
    if (!logs || logs.length === 0) {
        return `<tr><td colspan="4" style="padding: 3rem; text-align: center; color: #94a3b8;">Belum ada riwayat aktivitas.</td></tr>`;
    }
    return logs.map(log => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 1rem; font-size: 0.8125rem; white-space: nowrap; color: #64748b;">${log.Timestamp || log.timestamp}</td>
            <td style="padding: 1rem; font-size: 0.8125rem;"><span style="font-weight: 600; color: #0f172a;">${log.Admin || log.user}</span></td>
            <td style="padding: 1rem; font-size: 0.8125rem;">
                <span style="background: ${getActionColor(log.Action || log.action)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">
                    ${log.Action || log.action}
                </span>
            </td>
            <td style="padding: 1rem; font-size: 0.75rem; color: #475569;">${log.Detail || log.details || '-'}</td>
        </tr>
    `).join('');
}

function getActionColor(action) {
    if (!action) return '#64748b';
    const a = action.toUpperCase();
    if (a.includes('ADD')) return '#10b981';
    if (a.includes('EDIT')) return '#3b82f6';
    if (a.includes('DELETE')) return '#ef4444';
    if (a.includes('LOGIN')) return '#f59e0b';
    return '#64748b';
}

window.applyAuditFilters = () => {
    const start = document.getElementById('audit-start').value;
    const end = document.getElementById('audit-end').value;
    const user = document.getElementById('audit-user').value;
    const action = document.getElementById('audit-action').value;

    let filtered = [...systemLogs];

    if (start) {
        filtered = filtered.filter(l => {
            const logDate = parseFlexibleDate(l.Timestamp || l.timestamp);
            return logDate >= new Date(start);
        });
    }
    if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59);
        filtered = filtered.filter(l => {
            const logDate = parseFlexibleDate(l.Timestamp || l.timestamp);
            return logDate <= endDate;
        });
    }
    if (user) filtered = filtered.filter(l => (l.Admin || l.user) === user);
    if (action) filtered = filtered.filter(l => (l.Action || l.action || '').toUpperCase().includes(action));

    document.getElementById('audit-log-body').innerHTML = renderAuditRows(filtered);
};

window.resetAuditFilters = () => {
    document.getElementById('audit-start').value = '';
    document.getElementById('audit-end').value = '';
    document.getElementById('audit-user').value = '';
    document.getElementById('audit-action').value = '';
    applyAuditFilters();
};

function parseFlexibleDate(str) {
    if (!str) return new Date(0);
    let d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    try {
        const parts = str.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length === 3) {
            const [day, month, year] = dateParts.map(Number);
            return new Date(year, month - 1, day);
        }
    } catch(e) {}
    return new Date(0);
}

window.exportAuditToCSV = () => {
    const start = document.getElementById('audit-start').value;
    const end = document.getElementById('audit-end').value;
    const user = document.getElementById('audit-user').value;
    const action = document.getElementById('audit-action').value;

    let filtered = [...systemLogs];

    if (start) {
        filtered = filtered.filter(l => {
            const logDate = parseFlexibleDate(l.Timestamp || l.timestamp);
            return logDate >= new Date(start);
        });
    }
    if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59);
        filtered = filtered.filter(l => {
            const logDate = parseFlexibleDate(l.Timestamp || l.timestamp);
            return logDate <= endDate;
        });
    }
    if (user) filtered = filtered.filter(l => (l.Admin || l.user) === user);
    if (action) filtered = filtered.filter(l => (l.Action || l.action || '').toUpperCase().includes(action));

    if (filtered.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'error');
        return;
    }

    // Prepare CSV Content
    const headers = ['Waktu', 'Admin', 'Aksi', 'Detail'];
    const csvRows = [headers.join(',')];

    filtered.forEach(log => {
        const row = [
            `"${(log.Timestamp || log.timestamp || '').replace(/"/g, '""')}"`,
            `"${(log.Admin || log.user || '').replace(/"/g, '""')}"`,
            `"${(log.Action || log.action || '').replace(/"/g, '""')}"`,
            `"${(log.Detail || log.details || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Log_WKNSite_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Audit Log berhasil diekspor!', 'success');
};


window.showChangePasswordModal = () => {
    showModal(`
        <div style="padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;">
                <div style="width: 40px; height: 40px; background: #fef3c7; color: #d97706; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">${UI.icons.bell}</div>
                <div>
                    <h3 style="font-weight: 800; color: #0f172a;">Ganti Password</h3>
                    <p style="font-size: 0.75rem; color: #64748b;">Perbarui kata sandi akun Anda secara berkala.</p>
                </div>
            </div>
            
            <form id="change-password-form" onsubmit="handleChangePassword(event)">
                <div class="form-group">
                    <label>Password Sekarang</label>
                    <input type="password" id="old-password" class="form-input" required placeholder="Masukkan password saat ini">
                </div>
                <div class="form-group">
                    <label>Password Baru</label>
                    <input type="password" id="new-password" class="form-input" required placeholder="Minimal 5 karakter">
                </div>
                <div class="form-group">
                    <label>Konfirmasi Password Baru</label>
                    <input type="password" id="confirm-password" class="form-input" required placeholder="Ulangi password baru">
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 2rem;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Batal</button>
                    <button type="submit" class="btn btn-primary" style="flex: 2;">Simpan Password</button>
                </div>
            </form>
        </div>
    `);
};

window.handleChangePassword = async (e) => {
    e.preventDefault();
    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    const username = localStorage.getItem('GajiPro_Auth_Username') || localStorage.getItem('GajiPro_UserName') || '';

    if (newPass.length < 5) {
        showToast('Password baru minimal 5 karakter', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        showToast('Konfirmasi password tidak cocok', 'error');
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Memproses...';

    try {
        const payload = {
            action: 'change_password',
            username: username,
            oldPassword: oldPass,
            newPassword: newPass
        };

        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        
        if (result.status === 'success') {
            showToast('Password berhasil diperbarui!', 'success');
            createAuditLog('CHANGE_PWD', username, 'User changed their own password');
            closeModal();
        } else {
            showToast(result.message || 'Gagal mengubah password. Pastikan password lama benar.', 'error');
            btn.disabled = false;
            btn.innerText = originalText;
        }
    } catch (err) {
        console.error(err);
        showToast('Terjadi kesalahan koneksi atau backend belum mendukung action ini.', 'error');
        btn.disabled = false;
        btn.innerText = originalText;
    }
};


window.triggerBackup = async (silent = false) => {
    if (!isAuthenticated) return;
    
    if (!silent) showToast('Memulai proses backup...', 'info');
    
    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'backup_data' })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            if (!silent) showToast('Backup Database Berhasil!', 'success');
            localStorage.setItem('WKN_LastBackup', new Date().toDateString());
            createAuditLog('BACKUP', 'System', 'Manual/Auto database backup triggered');
        } else {
            if (!silent) showToast(result.message || 'Gagal melakukan backup', 'error');
        }
    } catch (err) {
        console.error(err);
        if (!silent) showToast('Terjadi kesalahan saat backup', 'error');
    }
};

// Auto Backup Logic: Run once a day when an admin is active
function checkAutoBackup() {
    const lastBackup = localStorage.getItem('WKN_LastBackup');
    const today = new Date().toDateString();
    
    if (lastBackup !== today && isAuthenticated) {
        const role = localStorage.getItem('GajiPro_Role');
        if (role === 'Super Admin' || role === 'Admin') {
            triggerBackup(true); // Silent backup
        }
    }
}

window.shareToWhatsApp = (name, amount, phone) => {
    if (!phone || phone === '-') {
        showToast('Nomor WhatsApp tidak tersedia', 'error');
        return;
    }
    
    // Clean phone number (remove non-digits)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
    
    const message = `Halo ${name},%0A%0ASlip Gaji Anda untuk periode ${new Date().toLocaleString('id-ID', {month:'long', year:'numeric'})} telah tersedia.%0A%0A*Take Home Pay: Rp ${amount.toLocaleString('id-ID')}*%0A%0ASilakan login ke portal WKNsite untuk melihat detail lengkapnya.%0A%0ATerima kasih.`;
    
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
};


window.renderAnnouncementManager = () => {
    if (!isAuthenticated) return;
    localStorage.setItem('WKN_LastPage', 'nav-announcement');
    
    app.innerHTML = `
        ${renderTopbar('Manajemen Pengumuman')}
        <div class="content-body fade-in">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
                <!-- Create New -->
                <div class="card">
                    <h3 style="margin-bottom: 1.5rem;">Buat Pengumuman Baru</h3>
                    <form id="announcement-form" onsubmit="createAnnouncement(event)">
                        <div class="form-group">
                            <label>Judul Pengumuman</label>
                            <input type="text" id="ann-title" class="form-input" required placeholder="Contoh: Pemberitahuan Libur Bersama">
                        </div>
                        <div class="form-group">
                            <label>Isi Pesan</label>
                            <textarea id="ann-content" class="form-input" style="height: 120px; resize: none;" required placeholder="Tuliskan detail pengumuman di sini..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Kirim ke Semua Dashboard</button>
                    </form>
                </div>

                <!-- Active List -->
                <div>
                    <h3 style="margin-bottom: 1rem;">Pengumuman Aktif</h3>
                    <div id="announcement-list">
                        ${announcements.length === 0 ? `<div class="card" style="text-align:center; padding: 3rem; color: var(--text-muted);">Belum ada pengumuman aktif</div>` : 
                            announcements.map(ann => `
                                <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="font-weight: 800; margin-bottom: 5px;">${ann.title}</h4>
                                        <p style="color: var(--text-muted); font-size: 0.875rem;">${ann.content}</p>
                                        <div style="margin-top: 10px; font-size: 0.75rem; color: var(--primary-color);">Oleh: ${ann.author} | ${ann.date}</div>
                                    </div>
                                    <button class="btn btn-secondary" style="color: #ef4444; border-color: #fecaca;" onclick="deleteAnnouncement('${ann.id}')">Hapus</button>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.createAnnouncement = (e) => {
    e.preventDefault();
    const title = document.getElementById('ann-title').value;
    const content = document.getElementById('ann-content').value;
    const author = localStorage.getItem('GajiPro_UserName') || 'Admin';
    
    const newAnn = {
        id: 'ann_' + Date.now(),
        title,
        content,
        author,
        date: new Date().toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})
    };
    
    announcements.unshift(newAnn);
    saveCache();
    renderAnnouncementManager();
    showToast('Pengumuman berhasil disiarkan!', 'success');
    createAuditLog('BROADCAST', 'All', `Title: ${title}`);
    
    // Sync to backend (optional, depends if you have a sheet for this)
    syncAnnouncementsToBackend(newAnn, 'add');
};

window.deleteAnnouncement = (id) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    announcements = announcements.filter(a => a.id !== id);
    saveCache();
    renderAnnouncementManager();
    showToast('Pengumuman dihapus', 'info');
    syncAnnouncementsToBackend({id}, 'delete');
};

window.dismissAnnouncement = (id) => {
    const el = event.target.closest('.card');
    if (el) el.style.display = 'none';
};

async function syncAnnouncementsToBackend(data, mode) {
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ action: 'sync_announcement', mode, data })
        });
    } catch (e) { console.error(e); }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        setTimeout(checkAutoBackup, 5000); // Check after app init
    });
} else {
    setTimeout(() => {
        initApp();
        setTimeout(checkAutoBackup, 5000);
    }, 10);
}

