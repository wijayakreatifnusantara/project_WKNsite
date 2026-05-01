/**
 * AI Database Connection Monitor - Frontend
 * Real-time database connection monitoring and auto-repair interface
 */

class AIDatabaseMonitor {
    constructor() {
        this.apiBase = 'http://localhost:8000/api/diagnostics';
        this.monitoringActive = false;
        this.lastCheck = null;
        this.autoRepairEnabled = true;
        this.refreshInterval = null;
        
        this.initializeUI();
        this.startPeriodicChecks();
    }

    initializeUI() {
        // Create monitoring panel if not exists
        if (!document.getElementById('ai-db-monitor-panel')) {
            this.createMonitorPanel();
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleMonitorPanel();
            }
        });
    }

    createMonitorPanel() {
        const panel = document.createElement('div');
        panel.id = 'ai-db-monitor-panel';
        panel.innerHTML = `
            <div class="ai-monitor-container">
                <div class="ai-monitor-header">
                    <h3>🤖 AI Database Monitor</h3>
                    <button class="close-btn" onclick="aiDbMonitor.toggleMonitorPanel()">×</button>
                </div>
                
                <div class="ai-monitor-content">
                    <div class="status-section">
                        <div class="status-indicator" id="db-status">
                            <div class="status-dot"></div>
                            <span class="status-text">Checking...</span>
                        </div>
                        <div class="health-score" id="health-score">
                            <span class="score-label">Health Score:</span>
                            <span class="score-value">--</span>
                        </div>
                    </div>
                    
                    <div class="controls-section">
                        <button class="btn btn-primary" onclick="aiDbMonitor.runDiagnostics()">
                            🔍 Run Diagnostics
                        </button>
                        <button class="btn btn-success" id="start-monitoring-btn" onclick="aiDbMonitor.startMonitoring()">
                            ▶️ Start Monitoring
                        </button>
                        <button class="btn btn-warning" id="stop-monitoring-btn" onclick="aiDbMonitor.stopMonitoring()" style="display:none;">
                            ⏹️ Stop Monitoring
                        </button>
                        <button class="btn btn-info" onclick="aiDbMonitor.toggleAutoRepair()">
                            🔧 Auto-Repair: <span id="auto-repair-status">ON</span>
                        </button>
                    </div>
                    
                    <div class="details-section">
                        <div class="last-check" id="last-check">
                            Last check: Never
                        </div>
                        <div class="issues-list" id="issues-list">
                            <!-- Issues will be listed here -->
                        </div>
                    </div>
                    
                    <div class="history-section">
                        <h4>Recent Checks</h4>
                        <div class="history-list" id="history-list">
                            <!-- History will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .ai-monitor-container {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: none;
                overflow: hidden;
            }
            
            .ai-monitor-container.active {
                display: block;
            }
            
            .ai-monitor-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .ai-monitor-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .close-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .ai-monitor-content {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .status-section {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .status-indicator {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 10px;
                background: #ffc107;
                animation: pulse 2s infinite;
            }
            
            .status-dot.healthy { background: #28a745; }
            .status-dot.degraded { background: #ffc107; }
            .status-dot.critical { background: #dc3545; }
            .status-dot.offline { background: #6c757d; }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .health-score {
                font-size: 14px;
                color: #666;
            }
            
            .score-value {
                font-weight: bold;
                color: #28a745;
            }
            
            .controls-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .controls-section button {
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-primary { background: #007bff; color: white; }
            .btn-success { background: #28a745; color: white; }
            .btn-warning { background: #ffc107; color: #212529; }
            .btn-info { background: #17a2b8; color: white; }
            
            .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            
            .details-section {
                margin-bottom: 20px;
            }
            
            .last-check {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
            }
            
            .issues-list {
                font-size: 12px;
            }
            
            .issue-item {
                padding: 8px;
                margin: 5px 0;
                border-radius: 4px;
                background: #fff3cd;
                border-left: 4px solid #ffc107;
            }
            
            .issue-item.critical {
                background: #f8d7da;
                border-left-color: #dc3545;
            }
            
            .issue-item.resolved {
                background: #d4edda;
                border-left-color: #28a745;
            }
            
            .history-section h4 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #333;
            }
            
            .history-list {
                max-height: 150px;
                overflow-y: auto;
            }
            
            .history-item {
                padding: 8px;
                margin: 5px 0;
                border-radius: 4px;
                background: #f8f9fa;
                font-size: 11px;
                border-left: 3px solid #dee2e6;
            }
            
            .history-item.healthy { border-left-color: #28a745; }
            .history-item.degraded { border-left-color: #ffc107; }
            .history-item.critical { border-left-color: #dc3545; }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
    }

    toggleMonitorPanel() {
        const panel = document.getElementById('ai-db-monitor-panel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    async runDiagnostics() {
        this.updateStatus('checking', 'Running diagnostics...');
        
        try {
            const response = await fetch(`${this.apiBase}/run`);
            const result = await response.json();
            
            if (result.status === 'success') {
                this.handleDiagnosticsResult(result.data);
            } else {
                this.showError('Diagnostics failed');
            }
        } catch (error) {
            this.showError(`Connection error: ${error.message}`);
        }
    }

    handleDiagnosticsResult(data) {
        const { connection_status, message, details, auto_repaired, repair_success } = data;
        
        // Update status indicator
        this.updateStatus(connection_status, message);
        
        // Update health score
        this.updateHealthScore(data);
        
        // Update last check time
        this.updateLastCheck();
        
        // Display issues
        this.displayIssues(data);
        
        // Show repair notification
        if (auto_repaired) {
            this.showNotification(`Auto-repair ${repair_success ? 'succeeded' : 'failed'}`, repair_success ? 'success' : 'warning');
        }
        
        // Update history
        this.addToHistory(data);
    }

    updateStatus(status, message) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot && statusText) {
            statusDot.className = `status-dot ${status}`;
            statusText.textContent = message;
        }
    }

    updateHealthScore(data) {
        // Calculate health score based on status
        const scores = {
            healthy: 100,
            degraded: 70,
            critical: 30,
            offline: 0
        };
        
        const score = scores[data.connection_status] || 50;
        const scoreValue = document.querySelector('.score-value');
        
        if (scoreValue) {
            scoreValue.textContent = score;
            scoreValue.style.color = score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545';
        }
    }

    updateLastCheck() {
        const lastCheckEl = document.getElementById('last-check');
        if (lastCheckEl) {
            const now = new Date();
            lastCheckEl.textContent = `Last check: ${now.toLocaleTimeString()}`;
        }
        this.lastCheck = new Date();
    }

    displayIssues(data) {
        const issuesList = document.getElementById('issues-list');
        if (!issuesList) return;
        
        issuesList.innerHTML = '';
        
        if (data.connection_status === 'healthy') {
            issuesList.innerHTML = '<div class="issue-item resolved">✅ All systems operational</div>';
            return;
        }
        
        // Display current issue
        if (data.issue_type) {
            const issueEl = document.createElement('div');
            issueEl.className = `issue-item ${data.connection_status}`;
            issueEl.innerHTML = `
                <strong>Issue:</strong> ${data.issue_type.replace('_', ' ').toUpperCase()}<br>
                <strong>Message:</strong> ${data.message}<br>
                ${data.auto_repaired ? `<strong>Auto-repair:</strong> ${data.repair_success ? '✅ Success' : '❌ Failed'}` : ''}
            `;
            issuesList.appendChild(issueEl);
        }
    }

    addToHistory(data) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${data.connection_status}`;
        
        const time = new Date().toLocaleTimeString();
        const statusIcon = data.connection_status === 'healthy' ? '✅' : 
                          data.connection_status === 'degraded' ? '⚠️' : '❌';
        
        historyItem.innerHTML = `
            ${statusIcon} ${time} - ${data.connection_status.toUpperCase()}
            ${data.auto_repaired ? ' (Auto-repaired)' : ''}
        `;
        
        // Add to top of list
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Keep only last 10 items
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    async startMonitoring() {
        try {
            const response = await fetch(`${this.apiBase}/monitoring/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interval: 30 })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.monitoringActive = true;
                this.updateMonitoringButtons(true);
                this.showNotification('Monitoring started', 'success');
            } else {
                this.showNotification('Failed to start monitoring', 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async stopMonitoring() {
        try {
            const response = await fetch(`${this.apiBase}/monitoring/stop`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.monitoringActive = false;
                this.updateMonitoringButtons(false);
                this.showNotification('Monitoring stopped', 'info');
            } else {
                this.showNotification('Failed to stop monitoring', 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    updateMonitoringButtons(isActive) {
        const startBtn = document.getElementById('start-monitoring-btn');
        const stopBtn = document.getElementById('stop-monitoring-btn');
        
        if (startBtn && stopBtn) {
            startBtn.style.display = isActive ? 'none' : 'block';
            stopBtn.style.display = isActive ? 'block' : 'none';
        }
    }

    async toggleAutoRepair() {
        try {
            const endpoint = this.autoRepairEnabled ? '/auto-repair/disable' : '/auto-repair/enable';
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.autoRepairEnabled = !this.autoRepairEnabled;
                const statusEl = document.getElementById('auto-repair-status');
                if (statusEl) {
                    statusEl.textContent = this.autoRepairEnabled ? 'ON' : 'OFF';
                }
                this.showNotification(`Auto-repair ${this.autoRepairEnabled ? 'enabled' : 'disabled'}`, 'info');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    startPeriodicChecks() {
        // Auto-check every 2 minutes when panel is closed
        this.refreshInterval = setInterval(async () => {
            if (!document.getElementById('ai-db-monitor-panel').classList.contains('active')) {
                await this.runDiagnostics();
            }
        }, 120000);
    }

    showNotification(message, type = 'info') {
        // Use existing toast system if available
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            // Fallback notification
            console.log(`AI DB Monitor: ${message}`);
        }
    }

    showError(message) {
        this.updateStatus('critical', message);
        this.showNotification(message, 'error');
    }
}

// Initialize AI Database Monitor
const aiDbMonitor = new AIDatabaseMonitor();

// Global access
window.aiDbMonitor = aiDbMonitor;

// Auto-run diagnostics on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        aiDbMonitor.runDiagnostics();
    }, 2000);
});

console.log('🤖 AI Database Monitor initialized - Press Ctrl+Shift+D to toggle');
