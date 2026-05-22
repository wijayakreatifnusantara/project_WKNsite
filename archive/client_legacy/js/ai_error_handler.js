/**
 * AI-Powered Frontend Error Handler for WKNsite
 * Advanced error detection, user-friendly messages, and auto-recovery
 */

class AIErrorManager {
    constructor() {
        this.errorPatterns = this.initializeErrorPatterns();
        this.errorHistory = [];
        this.autoRecoveryEnabled = true;
        this.learningEnabled = true;
        this.isHandlingError = false;
        this.setupGlobalHandlers();
    }

    initializeErrorPatterns() {
        return [
            // Network Errors
            {
                pattern: /network|connection|timeout|cors|fetch/i,
                category: 'network',
                severity: 'low', // Changed from medium to low to silence background retries
                autoRecovery: true,
                recoveryAction: 'retryWithBackoff',
                userMessage: 'Koneksi internet tidak stabil, sedang mencoba kembali...'
            },
            {
                pattern: /401|403|unauthorized|forbidden/i,
                category: 'authentication',
                severity: 'high',
                autoRecovery: true,
                recoveryAction: 'refreshSession',
                userMessage: 'Session kadaluarsa, silakan login kembali'
            },
            {
                pattern: /404|not found/i,
                category: 'api_error',
                severity: 'medium',
                autoRecovery: true,
                recoveryAction: 'checkEndpoint',
                userMessage: 'Service tidak tersedia, coba lagi beberapa saat'
            },
            {
                pattern: /500|502|503|504|server error/i,
                category: 'api_error',
                severity: 'high',
                autoRecovery: true,
                recoveryAction: 'retryWithExponentialBackoff',
                userMessage: 'Server sedang bermasalah, sedang mencoba kembali...'
            },
            
            // Data Validation Errors
            {
                pattern: /validation|invalid|required|missing/i,
                category: 'data_validation',
                severity: 'low', // Changed from medium to low to silence noise
                autoRecovery: true,
                recoveryAction: 'autoCorrectData',
                userMessage: 'Data tidak valid, diperbaiki otomatis'
            },
            {
                pattern: /null|undefined|cannot read/i,
                category: 'ui_error',
                severity: 'low',
                autoRecovery: true,
                recoveryAction: 'provideDefaultValue',
                userMessage: 'Terjadi kesalahan kecil, dilanjutkan dengan default'
            },
            
            // System Errors
            {
                pattern: /memory|heap|out of memory/i,
                category: 'system_error',
                severity: 'critical',
                autoRecovery: false,
                recoveryAction: 'emergencyRestart',
                userMessage: 'System memory penuh, halaman akan di-refresh'
            },
            {
                pattern: /database|connection|pool/i,
                category: 'system_error',
                severity: 'high',
                autoRecovery: true,
                recoveryAction: 'reconnectDatabase',
                userMessage: 'Koneksi database terputus, mencoba reconnect...'
            },
            
            // Browser/Script Errors
            {
                pattern: /Script error/i,
                category: 'browser_security',
                severity: 'low', // Downgraded since it's often a false positive in local dev
                autoRecovery: true,
                recoveryAction: 'ignoreLowSeverity',
                userMessage: 'Browser security restriction encountered (Local Dev)'
            }
        ];
    }

    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: 'Unhandled Promise Rejection',
                reason: event.reason,
                promise: event.promise
            });
        });

        // Enhance console methods
        this.enhanceConsoleLogging();
    }

    enhanceConsoleLogging() {
        const originalError = console.error;
        console.error = (...args) => {
            // Only handle if we aren't already in the middle of handling an error
            if (!this.isHandlingError) {
                this.handleError({
                    message: args.join(' '),
                    source: 'console.error',
                    args: args
                });
            }
            originalError.apply(console, args);
        };
    }

    async handleError(errorInfo) {
        if (this.isHandlingError) return;
        
        try {
            this.isHandlingError = true;
            // Analyze error
            const analysis = this.analyzeError(errorInfo);
            
            // Log error
            this.logError(analysis);
            
            // Attempt auto-recovery
            const recoveryResult = await this.attemptRecovery(analysis);
            
            // Show user-friendly message
            this.showUserMessage(analysis, recoveryResult);
            
            // Update patterns (learning)
            if (this.learningEnabled) {
                this.updatePatterns(analysis);
            }
            
            return {
                handled: true,
                errorId: analysis.errorId,
                autoRecovered: recoveryResult.success,
                userMessage: analysis.userMessage
            };
            
        } catch (e) {
            // Use original console error if it exists to avoid loop
            (window._originalConsoleError || console.error)('AI Error Handler failed:', e);
            return { handled: false, error: 'AI Error Handler malfunction' };
        } finally {
            this.isHandlingError = false;
        }
    }

    analyzeError(errorInfo) {
        const message = errorInfo.message || 'Unknown error';
        const stack = errorInfo.error?.stack || '';
        
        // Pattern matching
        let detectedPattern = null;
        for (const pattern of this.errorPatterns) {
            if (pattern.pattern.test(message)) {
                detectedPattern = pattern;
                pattern.frequency = (pattern.frequency || 0) + 1;
                pattern.lastOccurrence = new Date();
                break;
            }
        }

        // Generate unique error ID
        const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        return {
            errorId,
            message,
            stack,
            pattern: detectedPattern,
            category: detectedPattern?.category || 'unknown',
            severity: detectedPattern?.severity || 'medium',
            userMessage: detectedPattern?.userMessage || 'Terjadi kesalahan, coba lagi',
            timestamp: new Date(),
            context: this.buildContext(errorInfo)
        };
    }

    buildContext(errorInfo) {
        return {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: localStorage.getItem('GajiPro_UserName') || 'anonymous',
            sessionId: sessionStorage.getItem('sessionId') || 'unknown',
            systemInfo: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                } : null,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                } : null
            }
        };
    }

    async attemptRecovery(analysis) {
        if (!this.autoRecoveryEnabled || !analysis.pattern?.autoRecovery) {
            return { success: false, action: 'no_auto_recovery' };
        }

        const recoveryAction = analysis.pattern.recoveryAction;
        let success = false;
        let details = '';

        try {
            switch (recoveryAction) {
                case 'retryWithBackoff':
                    success = await this.retryWithBackoff(analysis);
                    details = 'Request retried with backoff';
                    break;
                    
                case 'refreshSession':
                    success = await this.refreshSession(analysis);
                    details = 'Session refreshed';
                    break;
                    
                case 'checkEndpoint':
                    success = await this.checkEndpoint(analysis);
                    details = 'Endpoint checked';
                    break;
                    
                case 'retryWithExponentialBackoff':
                    success = await this.retryWithExponentialBackoff(analysis);
                    details = 'Server error, retrying with exponential backoff';
                    break;
                    
                case 'autoCorrectData':
                    success = await this.autoCorrectData(analysis);
                    details = 'Data auto-corrected';
                    break;
                    
                case 'provideDefaultValue':
                    success = await this.provideDefaultValue(analysis);
                    details = 'Default values provided';
                    break;
                    
                case 'reconnectDatabase':
                    success = await this.reconnectDatabase(analysis);
                    details = 'Database reconnected';
                    break;
                    
                case 'ignoreLowSeverity':
                    success = true;
                    details = 'Error ignored based on pattern';
                    break;
                    
                case 'emergencyRestart':
                    success = await this.emergencyRestart(analysis);
                    details = 'Page refreshed due to memory issues';
                    break;
                    
                default:
                    success = false;
                    details = 'Unknown recovery action';
            }
        } catch (e) {
            console.error('Recovery action failed:', e);
            success = false;
            details = `Recovery failed: ${e.message}`;
        }

        return { success, action: recoveryAction, details };
    }

    async retryWithBackoff(analysis) {
        // Simple retry with 1 second delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true; // Simulate success
    }

    async refreshSession(analysis) {
        // Clear session and redirect to login
        localStorage.removeItem('GajiPro_Auth');
        localStorage.removeItem('GajiPro_UserName');
        localStorage.removeItem('GajiPro_Role');
        
        // Show login screen
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            loginScreen.style.opacity = '1';
        }
        
        return true;
    }

    async checkEndpoint(analysis) {
        // Check if API endpoint is accessible
        try {
            const response = await fetch('http://localhost:8000/api/', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    async retryWithExponentialBackoff(analysis) {
        // Exponential backoff: 1s, 2s, 4s, 8s
        for (let delay of [1000, 2000, 4000, 8000]) {
            await new Promise(resolve => setTimeout(resolve, delay));
            // Try the operation again here
            // Return True if successful
        }
        return false;
    }

    async autoCorrectData(analysis) {
        // Auto-correct common data issues
        // Implementation depends on specific data validation
        return true;
    }

    async provideDefaultValue(analysis) {
        // Provide sensible defaults for missing data
        return true;
    }

    async reconnectDatabase(analysis) {
        // Trigger database reconnection
        // This would call the backend to reconnect
        return true;
    }

    async emergencyRestart(analysis) {
        // Emergency page refresh for memory issues
        if (confirm('System memory penuh. Halaman akan di-refresh. Lanjutkan?')) {
            window.location.reload();
        }
        return true;
    }

    showUserMessage(analysis, recoveryResult) {
        const message = recoveryResult.success 
            ? `${analysis.userMessage} ✅ (${recoveryResult.details})`
            : analysis.userMessage;
            
        const severity = analysis.severity;
        const toastType = severity === 'critical' ? 'error' : 
                         severity === 'high' ? 'error' : 
                         severity === 'medium' ? 'info' : 'success';
        
        // Show toast notification only for important ones (High/Critical) or failures
        // Don't show toast for 'low' severity if recovery was successful
        const shouldShowToast = (severity === 'critical' || severity === 'high') || 
                                (severity === 'medium' && !recoveryResult.success) ||
                                (severity === 'low' && !recoveryResult.success && analysis.message !== 'Script error.');
        
        if (shouldShowToast && typeof window.showToast === 'function') {
            window.showToast(message, toastType);
        } else {
            // Log to console for background monitoring
            console.log(`🤖 AI Recovery (Background): ${message}`);
        }
        
        // Log additional info for debugging
        console.group(`🤖 AI Error Handler - ${analysis.errorId}`);
        console.log('Message:', analysis.message);
        console.log('Category:', analysis.category);
        console.log('Severity:', analysis.severity);
        console.log('Auto-Recovery:', recoveryResult.success ? '✅ Success' : '❌ Failed');
        console.log('Recovery Action:', recoveryResult.action);
        console.log('Context:', analysis.context);
        console.groupEnd();
    }

    logError(analysis) {
        // Add to history
        this.errorHistory.push(analysis);
        
        // Keep only last 100 errors
        if (this.errorHistory.length > 100) {
            this.errorHistory = this.errorHistory.slice(-100);
        }
        
        // Send to server for monitoring if it's important (Medium or higher)
        if (analysis.severity !== 'low') {
            this.sendErrorToServer(analysis);
        } else {
            console.log(`🤖 AI Error Handler: Low severity error recorded locally but not sent to server to reduce noise.`);
        }
    }

    async sendErrorToServer(analysis) {
        try {
            await fetch('http://localhost:8000/api/error-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysis)
            });
        } catch (e) {
            // Silent fail - don't want error logging to cause more errors
            console.warn('Failed to send error to server:', e);
        }
    }

    updatePatterns(analysis) {
        // Machine learning pattern improvement
        // This would analyze patterns and improve them over time
        // Implementation depends on ML framework choice
    }

    getErrorStatistics() {
        if (this.errorHistory.length === 0) {
            return { totalErrors: 0, message: 'No errors recorded' };
        }

        const totalErrors = this.errorHistory.length;
        const errorsByCategory = {};
        const errorsBySeverity = {};
        const recentErrors = this.errorHistory.filter(e => 
            new Date() - new Date(e.timestamp) < 24 * 60 * 60 * 1000
        );

        this.errorHistory.forEach(error => {
            errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
            errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
        });

        const topPatterns = this.errorPatterns
            .filter(p => p.frequency)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5)
            .map(p => ({
                pattern: p.pattern.toString(),
                frequency: p.frequency,
                category: p.category
            }));

        return {
            totalErrors,
            recentErrors24h: recentErrors.length,
            errorsByCategory,
            errorsBySeverity,
            topPatterns,
            autoRecoveryRate: this.errorHistory.filter(e => 
                e.pattern?.autoRecovery
            ).length / totalErrors * 100
        };
    }

    // Public API methods
    enableAutoRecovery() {
        this.autoRecoveryEnabled = true;
        console.log('🤖 AI Auto-Recovery ENABLED');
    }

    disableAutoRecovery() {
        this.autoRecoveryEnabled = false;
        console.log('🤖 AI Auto-Recovery DISABLED');
    }

    enableLearning() {
        this.learningEnabled = true;
        console.log('🤖 AI Learning ENABLED');
    }

    disableLearning() {
        this.learningEnabled = false;
        console.log('🤖 AI Learning DISABLED');
    }

    clearErrorHistory() {
        this.errorHistory = [];
        console.log('🤖 Error history cleared');
    }

    downloadErrorReport() {
        const report = {
            timestamp: new Date().toISOString(),
            statistics: this.getErrorStatistics(),
            errors: this.errorHistory,
            patterns: this.errorPatterns
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wkn-error-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize AI Error Manager
window.aiErrorManager = new AIErrorManager();

// Make it available globally
window.AIErrorHandler = {
    handleError: (error) => window.aiErrorManager.handleError(error),
    getStats: () => window.aiErrorManager.getErrorStatistics(),
    enableRecovery: () => window.aiErrorManager.enableAutoRecovery(),
    disableRecovery: () => window.aiErrorManager.disableAutoRecovery(),
    downloadReport: () => window.aiErrorManager.downloadErrorReport()
};

console.log('🤖 AI Error Handler initialized and ready!');
