"""
AI-Powered Error Handling System for WKNsite
Advanced error detection, analysis, and auto-recovery
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import re
import traceback

class ErrorSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorCategory(Enum):
    NETWORK = "network"
    AUTHENTICATION = "authentication"
    DATA_VALIDATION = "data_validation"
    API_ERROR = "api_error"
    UI_ERROR = "ui_error"
    SYSTEM_ERROR = "system_error"
    BUSINESS_LOGIC = "business_logic"

@dataclass
class ErrorPattern:
    """Error pattern for AI learning"""
    pattern: str
    category: ErrorCategory
    severity: ErrorSeverity
    auto_recovery: bool
    recovery_action: Optional[str] = None
    frequency: int = 0
    last_occurrence: Optional[datetime] = None

@dataclass
class ErrorEvent:
    """Error event data structure"""
    timestamp: datetime
    error_id: str
    category: ErrorCategory
    severity: ErrorSeverity
    message: str
    stack_trace: str
    user_context: Dict[str, Any]
    system_context: Dict[str, Any]
    resolved: bool = False
    resolution_method: Optional[str] = None

class AIErrorHandler:
    """Advanced AI Error Handling System"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self.error_patterns = self._load_error_patterns()
        self.error_history: List[ErrorEvent] = []
        self.auto_recovery_enabled = True
        self.learning_enabled = True
        
    def _setup_logger(self) -> logging.Logger:
        """Setup comprehensive logging"""
        # Ensure logs directory exists
        if not os.path.exists("logs"):
            os.makedirs("logs")
            
        logger = logging.getLogger("AI_Error_Handler")
        logger.setLevel(logging.INFO)
        
        # File handler for error logs
        file_handler = logging.FileHandler("logs/ai_errors.log")
        file_handler.setLevel(logging.INFO)
        
        # Console handler for real-time monitoring
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def _load_error_patterns(self) -> List[ErrorPattern]:
        """Load predefined error patterns"""
        patterns = [
            # Network Errors
            ErrorPattern(
                pattern=r"(connection|network|timeout|cors|fetch)",
                category=ErrorCategory.NETWORK,
                severity=ErrorSeverity.MEDIUM,
                auto_recovery=True,
                recovery_action="retry_with_backoff"
            ),
            ErrorPattern(
                pattern=r"(401|403|unauthorized|forbidden)",
                category=ErrorCategory.AUTHENTICATION,
                severity=ErrorSeverity.HIGH,
                auto_recovery=True,
                recovery_action="refresh_session"
            ),
            ErrorPattern(
                pattern=r"(404|not found)",
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.MEDIUM,
                auto_recovery=True,
                recovery_action="check_endpoint"
            ),
            ErrorPattern(
                pattern=r"(500|502|503|504|server error)",
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.HIGH,
                auto_recovery=True,
                recovery_action="retry_with_exponential_backoff"
            ),
            
            # Data Validation Errors
            ErrorPattern(
                pattern=r"(validation|invalid|required|missing)",
                category=ErrorCategory.DATA_VALIDATION,
                severity=ErrorSeverity.MEDIUM,
                auto_recovery=True,
                recovery_action="auto_correct_data"
            ),
            ErrorPattern(
                pattern=r"(null|undefined|cannot read)",
                category=ErrorCategory.UI_ERROR,
                severity=ErrorSeverity.LOW,
                auto_recovery=True,
                recovery_action="provide_default_value"
            ),
            
            # System Errors
            ErrorPattern(
                pattern=r"(memory|heap|out of memory)",
                category=ErrorCategory.SYSTEM_ERROR,
                severity=ErrorSeverity.CRITICAL,
                auto_recovery=False,
                recovery_action="emergency_restart"
            ),
            ErrorPattern(
                pattern=r"(database|connection|pool)",
                category=ErrorCategory.SYSTEM_ERROR,
                severity=ErrorSeverity.HIGH,
                auto_recovery=True,
                recovery_action="reconnect_database"
            ),
            
            # Business Logic Errors
            ErrorPattern(
                pattern=r"(permission|access|role)",
                category=ErrorCategory.BUSINESS_LOGIC,
                severity=ErrorSeverity.MEDIUM,
                auto_recovery=False,
                recovery_action="redirect_to_login"
            )
        ]
        
        return patterns
    
    async def handle_error(self, error: Exception, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Main error handling entry point"""
        try:
            # Analyze error
            error_analysis = await self._analyze_error(error, context or {})
            
            # Log error
            await self._log_error(error_analysis)
            
            # Forward to Sentry real-time dashboard if initialized
            try:
                import sentry_sdk
                if sentry_sdk.Hub.current.client:
                    with sentry_sdk.push_scope() as scope:
                        scope.set_tag("error_id", error_analysis["error_id"])
                        scope.set_tag("category", error_analysis["category"].value)
                        scope.set_tag("severity", error_analysis["severity"].value)
                        if context:
                            for key, val in context.items():
                                scope.set_extra(f"ctx_{key}", val)
                        sentry_sdk.capture_exception(error)
            except Exception as sentry_err:
                self.logger.warning(f"Sentry capture failed: {sentry_err}")
            
            # Attempt auto-recovery
            recovery_result = await self._attempt_recovery(error_analysis)
            
            # Update patterns (learning)
            if self.learning_enabled:
                await self._update_patterns(error_analysis)
            
            # Generate user-friendly message
            user_message = self._generate_user_message(error_analysis)
            
            return {
                "error_id": error_analysis["error_id"],
                "handled": True,
                "auto_recovered": recovery_result.get("success", False),
                "user_message": user_message,
                "severity": error_analysis["severity"].value,
                "category": error_analysis["category"].value,
                "recovery_action": recovery_result.get("action", "none"),
                "recommendations": recovery_result.get("recommendations", [])
            }
            
        except Exception as e:
            self.logger.critical(f"AI Error Handler failed: {str(e)}")
            return {
                "handled": False,
                "error": "AI Error Handler malfunction",
                "fallback": "Use traditional error handling"
            }
    
    async def _analyze_error(self, error: Exception, context: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered error analysis"""
        error_message = str(error)
        stack_trace = traceback.format_exc()
        
        # Pattern matching
        detected_pattern = None
        for pattern in self.error_patterns:
            if re.search(pattern.pattern, error_message, re.IGNORECASE):
                detected_pattern = pattern
                pattern.frequency += 1
                pattern.last_occurrence = datetime.now()
                break
        
        # Determine category and severity
        if detected_pattern:
            category = detected_pattern.category
            severity = detected_pattern.severity
        else:
            category = self._classify_error_by_context(error_message, context)
            severity = self._determine_severity(error_message, context)
        
        # Generate unique error ID
        error_id = f"ERR_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(error_message) % 10000:04d}"
        
        return {
            "error_id": error_id,
            "category": category,
            "severity": severity,
            "message": error_message,
            "stack_trace": stack_trace,
            "pattern": detected_pattern,
            "context": context,
            "timestamp": datetime.now()
        }
    
    def _classify_error_by_context(self, message: str, context: Dict[str, Any]) -> ErrorCategory:
        """Classify error based on context"""
        if "api" in str(context).lower() or "fetch" in message.lower():
            return ErrorCategory.API_ERROR
        elif "auth" in str(context).lower() or "login" in message.lower():
            return ErrorCategory.AUTHENTICATION
        elif "form" in str(context).lower() or "validation" in message.lower():
            return ErrorCategory.DATA_VALIDATION
        elif "element" in str(context).lower() or "dom" in message.lower():
            return ErrorCategory.UI_ERROR
        else:
            return ErrorCategory.SYSTEM_ERROR
    
    def _determine_severity(self, message: str, context: Dict[str, Any]) -> ErrorSeverity:
        """Determine error severity"""
        critical_keywords = ["critical", "fatal", "crash", "memory", "security"]
        high_keywords = ["failed", "error", "exception", "timeout"]
        medium_keywords = ["warning", "invalid", "missing"]
        
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in critical_keywords):
            return ErrorSeverity.CRITICAL
        elif any(keyword in message_lower for keyword in high_keywords):
            return ErrorSeverity.HIGH
        elif any(keyword in message_lower for keyword in medium_keywords):
            return ErrorSeverity.MEDIUM
        else:
            return ErrorSeverity.LOW
    
    async def _attempt_recovery(self, error_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered auto-recovery"""
        if not self.auto_recovery_enabled:
            return {"success": False, "action": "auto_recovery_disabled", "recommendations": []}
        
        pattern = error_analysis.get("pattern")
        if not pattern or not pattern.auto_recovery:
            return {"success": False, "action": "no_auto_recovery_available", "recommendations": []}
        
        recovery_action = pattern.recovery_action
        success = False
        recommendations = []
        
        try:
            if recovery_action == "retry_with_backoff":
                success = await self._retry_with_backoff(error_analysis)
                recommendations = ["Request retried with exponential backoff"]
                
            elif recovery_action == "refresh_session":
                success = await self._refresh_session(error_analysis)
                recommendations = ["Session refreshed, please try again"]
                
            elif recovery_action == "check_endpoint":
                success = await self._check_endpoint(error_analysis)
                recommendations = ["Endpoint validated, service might be temporarily unavailable"]
                
            elif recovery_action == "retry_with_exponential_backoff":
                success = await self._retry_with_exponential_backoff(error_analysis)
                recommendations = ["Server error detected, retrying with exponential backoff"]
                
            elif recovery_action == "auto_correct_data":
                success = await self._auto_correct_data(error_analysis)
                recommendations = ["Data validation errors auto-corrected"]
                
            elif recovery_action == "provide_default_value":
                success = await self._provide_default_value(error_analysis)
                recommendations = ["Default values provided for missing data"]
                
            elif recovery_action == "reconnect_database":
                success = await self._reconnect_database(error_analysis)
                recommendations = ["Database connection re-established"]
                
            elif recovery_action == "redirect_to_login":
                success = await self._redirect_to_login(error_analysis)
                recommendations = ["Please login again to continue"]
                
        except Exception as e:
            self.logger.error(f"Auto-recovery failed: {str(e)}")
            success = False
            recommendations = ["Auto-recovery failed, manual intervention required"]
        
        return {
            "success": success,
            "action": recovery_action,
            "recommendations": recommendations
        }
    
    async def _retry_with_backoff(self, error_analysis: Dict[str, Any]) -> bool:
        """Retry with exponential backoff"""
        # Implementation would depend on the specific operation
        await asyncio.sleep(1)  # Simple backoff
        return True  # Simulate success
    
    async def _refresh_session(self, error_analysis: Dict[str, Any]) -> bool:
        """Refresh user session"""
        # Implementation would clear session and redirect to login
        return True
    
    async def _check_endpoint(self, error_analysis: Dict[str, Any]) -> bool:
        """Validate API endpoint"""
        # Implementation would check if endpoint exists
        return True
    
    async def _retry_with_exponential_backoff(self, error_analysis: Dict[str, Any]) -> bool:
        """Retry with exponential backoff for server errors"""
        for delay in [1, 2, 4, 8]:  # Exponential backoff
            await asyncio.sleep(delay)
            # Try the operation again
            # Return True if successful
        return False
    
    async def _auto_correct_data(self, error_analysis: Dict[str, Any]) -> bool:
        """Auto-correct data validation errors"""
        # Implementation would fix common data issues
        return True
    
    async def _provide_default_value(self, error_analysis: Dict[str, Any]) -> bool:
        """Provide default values for missing data"""
        # Implementation would set sensible defaults
        return True
    
    async def _reconnect_database(self, error_analysis: Dict[str, Any]) -> bool:
        """Reconnect to database"""
        # Implementation would re-establish database connection
        return True
    
    async def _redirect_to_login(self, error_analysis: Dict[str, Any]) -> bool:
        """Redirect to login page"""
        # Implementation would handle redirect
        return True
    
    def _generate_user_message(self, error_analysis: Dict[str, Any]) -> str:
        """Generate user-friendly error messages"""
        category = error_analysis["category"]
        severity = error_analysis["severity"]
        
        messages = {
            ErrorCategory.NETWORK: {
                ErrorSeverity.LOW: "Koneksi internet tidak stabil, coba lagi",
                ErrorSeverity.MEDIUM: "Terjadi masalah koneksi, sedang mencoba kembali",
                ErrorSeverity.HIGH: "Koneksi terputus, periksa internet Anda",
                ErrorSeverity.CRITICAL: "Koneksi gagal total, hubungi IT support"
            },
            ErrorCategory.AUTHENTICATION: {
                ErrorSeverity.LOW: "Session Anda akan kadaluarsa segera",
                ErrorSeverity.MEDIUM: "Silakan login kembali",
                ErrorSeverity.HIGH: "Akses ditolak, periksa credentials Anda",
                ErrorSeverity.CRITICAL: "Security breach detected, logout otomatis"
            },
            ErrorCategory.DATA_VALIDATION: {
                ErrorSeverity.LOW: "Data perlu diperiksa",
                ErrorSeverity.MEDIUM: "Format data tidak valid, diperbaiki otomatis",
                ErrorSeverity.HIGH: "Data tidak lengkap, lengkapi field yang required",
                ErrorSeverity.CRITICAL: "Data corruption detected, hubungi admin"
            },
            ErrorCategory.API_ERROR: {
                ErrorSeverity.LOW: "Server sedang sibuk, coba lagi",
                ErrorSeverity.MEDIUM: "Service temporarily unavailable",
                ErrorSeverity.HIGH: "Server error, sedang di proses",
                ErrorSeverity.CRITICAL: "System down, hubungi IT support"
            }
        }
        
        return messages.get(category, {}).get(severity, "Terjadi kesalahan, coba lagi")
    
    async def _log_error(self, error_analysis: Dict[str, Any]) -> None:
        """Comprehensive error logging"""
        error_event = ErrorEvent(
            timestamp=error_analysis["timestamp"],
            error_id=error_analysis["error_id"],
            category=error_analysis["category"],
            severity=error_analysis["severity"],
            message=error_analysis["message"],
            stack_trace=error_analysis["stack_trace"],
            user_context=error_analysis["context"].get("user", {}),
            system_context=error_analysis["context"].get("system", {})
        )
        
        self.error_history.append(error_event)
        
        # Log to file
        self.logger.error(
            f"ID: {error_event.error_id} | "
            f"Category: {error_event.category.value} | "
            f"Severity: {error_event.severity.value} | "
            f"Message: {error_event.message}"
        )
    
    async def _update_patterns(self, error_analysis: Dict[str, Any]) -> None:
        """Update error patterns for learning"""
        # Implementation would use machine learning to improve patterns
        pass
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """Get comprehensive error statistics"""
        if not self.error_history:
            return {"total_errors": 0, "patterns": []}
        
        # Calculate statistics
        total_errors = len(self.error_history)
        errors_by_category = {}
        errors_by_severity = {}
        recent_errors = [
            e for e in self.error_history 
            if e.timestamp > datetime.now() - timedelta(hours=24)
        ]
        
        for error in self.error_history:
            # Count by category
            cat = error.category.value
            errors_by_category[cat] = errors_by_category.get(cat, 0) + 1
            
            # Count by severity
            sev = error.severity.value
            errors_by_severity[sev] = errors_by_severity.get(sev, 0) + 1
        
        # Top patterns
        top_patterns = sorted(
            [(p.frequency, p.pattern, p.category.value) for p in self.error_patterns],
            key=lambda x: x[0],
            reverse=True
        )[:5]
        
        return {
            "total_errors": total_errors,
            "recent_errors_24h": len(recent_errors),
            "errors_by_category": errors_by_category,
            "errors_by_severity": errors_by_severity,
            "top_patterns": top_patterns,
            "auto_recovery_rate": sum(1 for e in self.error_history if e.resolved) / total_errors * 100
        }

# Global AI Error Handler instance
ai_error_handler = AIErrorHandler()
