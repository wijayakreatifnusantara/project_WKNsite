"""
AI Database Connection Diagnostics & Auto-Repair System
Intelligent monitoring and automatic fixing of database connectivity issues
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import time
from pathlib import Path

class ConnectionStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"
    OFFLINE = "offline"
    UNKNOWN = "unknown"

class IssueType(Enum):
    NETWORK = "network"
    AUTHENTICATION = "authentication"
    PERMISSION = "permission"
    QUOTA_EXCEEDED = "quota_exceeded"
    SERVICE_UNAVAILABLE = "service_unavailable"
    INVALID_CREDENTIALS = "invalid_credentials"
    SHEET_NOT_FOUND = "sheet_not_found"
    RATE_LIMITED = "rate_limited"
    TIMEOUT = "timeout"
    UNKNOWN = "unknown"

@dataclass
class DiagnosticResult:
    """Database connection diagnostic result"""
    timestamp: datetime
    status: ConnectionStatus
    issue_type: Optional[IssueType]
    message: str
    details: Dict[str, Any]
    auto_repaired: bool = False
    repair_method: Optional[str] = None
    repair_success: bool = False

class AIDatabaseDiagnostics:
    """AI-powered database connection diagnostics and auto-repair"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self.diagnostics_history: List[DiagnosticResult] = []
        self.credentials_path = "marine-cable-494919-u9-bc542c0991b5.json"
        self.sheets_base_url = "https://sheets.googleapis.com/v4/spreadsheets"
        self.auto_repair_enabled = True
        self.monitoring_active = False
        
        # Connection thresholds
        self.timeout_threshold = 10.0  # seconds
        self.retry_attempts = 3
        self.rate_limit_delay = 1.0  # seconds
        
    def _setup_logger(self) -> logging.Logger:
        """Setup comprehensive logging for diagnostics"""
        logger = logging.getLogger("AI_DB_Diagnostics")
        logger.setLevel(logging.INFO)
        
        # Create logs directory
        Path("logs").mkdir(exist_ok=True)
        
        # File handler
        file_handler = logging.FileHandler("logs/db_diagnostics.log")
        file_handler.setLevel(logging.INFO)
        
        # Console handler
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
    
    async def run_comprehensive_diagnostics(self) -> DiagnosticResult:
        """Run complete database connection diagnostics"""
        start_time = time.time()
        
        try:
            self.logger.info("🔍 Starting comprehensive database diagnostics...")
            
            # Step 1: Check credentials file
            credentials_check = await self._check_credentials_file()
            if not credentials_check.success:
                return DiagnosticResult(
                    timestamp=datetime.now(),
                    status=ConnectionStatus.CRITICAL,
                    issue_type=IssueType.INVALID_CREDENTIALS,
                    message=credentials_check.message,
                    details=credentials_check.details
                )
            
            # Step 2: Test basic connectivity
            connectivity_test = await self._test_basic_connectivity()
            if not connectivity_test.success:
                return await self._handle_connectivity_failure(connectivity_test)
            
            # Step 3: Test Google Sheets API
            sheets_test = await self._test_sheets_api()
            if not sheets_test.success:
                return await self._handle_sheets_failure(sheets_test)
            
            # Step 4: Test specific sheets
            sheets_data_test = await self._test_sheets_data_access()
            if not sheets_data_test.success:
                return await self._handle_sheets_data_failure(sheets_data_test)
            
            # Step 5: Performance test
            performance_test = await self._test_performance()
            
            execution_time = time.time() - start_time
            
            # All tests passed
            result = DiagnosticResult(
                timestamp=datetime.now(),
                status=ConnectionStatus.HEALTHY,
                issue_type=None,
                message="All database connections are healthy",
                details={
                    "execution_time": execution_time,
                    "credentials_check": credentials_check.details,
                    "connectivity_test": connectivity_test.details,
                    "sheets_test": sheets_test.details,
                    "sheets_data_test": sheets_data_test.details,
                    "performance_test": performance_test.details
                }
            )
            
            self.logger.info(f"✅ Diagnostics completed in {execution_time:.2f}s - Status: HEALTHY")
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Diagnostics failed: {str(e)}")
            return DiagnosticResult(
                timestamp=datetime.now(),
                status=ConnectionStatus.CRITICAL,
                issue_type=IssueType.UNKNOWN,
                message=f"Diagnostics system error: {str(e)}",
                details={"error": str(e), "execution_time": time.time() - start_time}
            )
    
    async def _check_credentials_file(self) -> Dict[str, Any]:
        """Check if credentials file exists and is valid"""
        try:
            import json
            
            if not Path(self.credentials_path).exists():
                return {
                    "success": False,
                    "message": "Credentials file not found",
                    "details": {"file_path": self.credentials_path, "exists": False}
                }
            
            with open(self.credentials_path, 'r') as f:
                credentials = json.load(f)
            
            # Validate required fields
            required_fields = ["type", "project_id", "private_key", "client_email"]
            missing_fields = [field for field in required_fields if field not in credentials]
            
            if missing_fields:
                return {
                    "success": False,
                    "message": f"Invalid credentials file - missing fields: {missing_fields}",
                    "details": {"missing_fields": missing_fields, "file_path": self.credentials_path}
                }
            
            return {
                "success": True,
                "message": "Credentials file valid",
                "details": {
                    "file_path": self.credentials_path,
                    "project_id": credentials.get("project_id"),
                    "client_email": credentials.get("client_email"),
                    "file_size": Path(self.credentials_path).stat().st_size
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error reading credentials file: {str(e)}",
                "details": {"error": str(e), "file_path": self.credentials_path}
            }
    
    async def _test_basic_connectivity(self) -> Dict[str, Any]:
        """Test basic network connectivity to Google APIs"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                # Test Google API availability
                async with session.get("https://www.googleapis.com/") as response:
                    if response.status == 200:
                        return {
                            "success": True,
                            "message": "Google APIs reachable",
                            "details": {
                                "status_code": response.status,
                                "response_time": response.headers.get("Date"),
                                "server": response.headers.get("Server")
                            }
                        }
                    else:
                        return {
                            "success": False,
                            "message": f"Google APIs returned status {response.status}",
                            "details": {"status_code": response.status}
                        }
                        
        except asyncio.TimeoutError:
            return {
                "success": False,
                "message": "Connection timeout to Google APIs",
                "details": {"timeout": 10, "error_type": "timeout"}
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Network connectivity error: {str(e)}",
                "details": {"error": str(e), "error_type": "network"}
            }
    
    async def _test_sheets_api(self) -> Dict[str, Any]:
        """Test Google Sheets API access"""
        try:
            # This would require OAuth2 token, for now we'll test the API endpoint
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                # Test Sheets API endpoint
                test_url = f"{self.sheets_base_url}"
                headers = {"User-Agent": "WKNsite-Diagnostics/1.0"}
                
                async with session.get(test_url, headers=headers) as response:
                    # We expect 401 without proper auth, but that means the API is reachable
                    if response.status in [401, 403]:
                        return {
                            "success": True,
                            "message": "Sheets API reachable (authentication required)",
                            "details": {
                                "status_code": response.status,
                                "api_endpoint": self.sheets_base_url,
                                "auth_required": True
                            }
                        }
                    elif response.status == 200:
                        return {
                            "success": True,
                            "message": "Sheets API accessible",
                            "details": {"status_code": response.status}
                        }
                    else:
                        return {
                            "success": False,
                            "message": f"Sheets API returned unexpected status: {response.status}",
                            "details": {"status_code": response.status}
                        }
                        
        except Exception as e:
            return {
                "success": False,
                "message": f"Sheets API test failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _test_sheets_data_access(self) -> Dict[str, Any]:
        """Test actual data access to Google Sheets"""
        try:
            # For now, we'll test the MCP client
            from utils.supabase_client import supabase_client
            
            # Test getting employees data
            start_time = time.time()
            employees = await supabase_client.get_employees()
            execution_time = time.time() - start_time
            
            if isinstance(employees, list):
                return {
                    "success": True,
                    "message": f"Successfully accessed sheets data ({len(employees)} employees)",
                    "details": {
                        "employee_count": len(employees),
                        "execution_time": execution_time,
                        "data_sample": employees[:2] if employees else []
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Invalid data format from sheets",
                    "details": {"data_type": type(employees).__name__}
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Sheets data access failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _test_performance(self) -> Dict[str, Any]:
        """Test database performance with multiple operations"""
        try:
            from utils.supabase_client import supabase_client
            
            operations = []
            
            # Test 1: Get employees
            start_time = time.time()
            employees = await supabase_client.get_employees()
            operations.append({
                "operation": "get_employees",
                "execution_time": time.time() - start_time,
                "success": isinstance(employees, list)
            })
            
            # Test 2: Get admins
            start_time = time.time()
            admins = await supabase_client.get_admins()
            operations.append({
                "operation": "get_admins",
                "execution_time": time.time() - start_time,
                "success": isinstance(admins, list)
            })
            
            # Test 3: Get dashboard stats
            start_time = time.time()
            stats = await supabase_client.get_dashboard_stats()
            operations.append({
                "operation": "get_dashboard_stats",
                "execution_time": time.time() - start_time,
                "success": isinstance(stats, dict)
            })
            
            # Calculate performance metrics
            avg_time = sum(op["execution_time"] for op in operations) / len(operations)
            success_rate = sum(1 for op in operations if op["success"]) / len(operations)
            
            performance_score = "excellent" if avg_time < 1.0 else "good" if avg_time < 2.0 else "poor"
            
            return {
                "success": success_rate > 0.8,
                "message": f"Performance test completed - Score: {performance_score}",
                "details": {
                    "average_response_time": avg_time,
                    "success_rate": success_rate,
                    "operations": operations,
                    "performance_score": performance_score
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Performance test failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _handle_connectivity_failure(self, test_result: Dict[str, Any]) -> DiagnosticResult:
        """Handle connectivity failures with auto-repair"""
        if self.auto_repair_enabled:
            repair_result = await self._auto_repair_connectivity(test_result)
            
            return DiagnosticResult(
                timestamp=datetime.now(),
                status=ConnectionStatus.DEGRADED,
                issue_type=IssueType.NETWORK,
                message=f"Connectivity issue: {test_result['message']}",
                details=test_result["details"],
                auto_repaired=True,
                repair_method="network_retry",
                repair_success=repair_result
            )
        
        return DiagnosticResult(
            timestamp=datetime.now(),
            status=ConnectionStatus.CRITICAL,
            issue_type=IssueType.NETWORK,
            message=f"Connectivity failure: {test_result['message']}",
            details=test_result["details"]
        )
    
    async def _handle_sheets_failure(self, test_result: Dict[str, Any]) -> DiagnosticResult:
        """Handle Sheets API failures with auto-repair"""
        if self.auto_repair_enabled:
            repair_result = await self._auto_repair_sheets(test_result)
            
            return DiagnosticResult(
                timestamp=datetime.now(),
                status=ConnectionStatus.DEGRADED,
                issue_type=IssueType.SERVICE_UNAVAILABLE,
                message=f"Sheets API issue: {test_result['message']}",
                details=test_result["details"],
                auto_repaired=True,
                repair_method="sheets_retry",
                repair_success=repair_result
            )
        
        return DiagnosticResult(
            timestamp=datetime.now(),
            status=ConnectionStatus.CRITICAL,
            issue_type=IssueType.SERVICE_UNAVAILABLE,
            message=f"Sheets API failure: {test_result['message']}",
            details=test_result["details"]
        )
    
    async def _handle_sheets_data_failure(self, test_result: Dict[str, Any]) -> DiagnosticResult:
        """Handle Sheets data access failures with auto-repair"""
        if self.auto_repair_enabled:
            repair_result = await self._auto_repair_sheets_data(test_result)
            
            return DiagnosticResult(
                timestamp=datetime.now(),
                status=ConnectionStatus.DEGRADED,
                issue_type=IssueType.PERMISSION,
                message=f"Sheets data access issue: {test_result['message']}",
                details=test_result["details"],
                auto_repaired=True,
                repair_method="data_access_retry",
                repair_success=repair_result
            )
        
        return DiagnosticResult(
            timestamp=datetime.now(),
            status=ConnectionStatus.CRITICAL,
            issue_type=IssueType.PERMISSION,
            message=f"Sheets data access failure: {test_result['message']}",
            details=test_result["details"]
        )
    
    async def _auto_repair_connectivity(self, test_result: Dict[str, Any]) -> bool:
        """Auto-repair connectivity issues"""
        self.logger.info("🔧 Attempting auto-repair for connectivity issues...")
        
        try:
            # Retry with exponential backoff
            for attempt in range(self.retry_attempts):
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                
                connectivity_test = await self._test_basic_connectivity()
                if connectivity_test["success"]:
                    self.logger.info(f"✅ Connectivity repaired on attempt {attempt + 1}")
                    return True
            
            self.logger.warning("❌ Auto-repair failed for connectivity")
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Auto-repair error: {str(e)}")
            return False
    
    async def _auto_repair_sheets(self, test_result: Dict[str, Any]) -> bool:
        """Auto-repair Sheets API issues"""
        self.logger.info("🔧 Attempting auto-repair for Sheets API issues...")
        
        try:
            # Wait and retry
            await asyncio.sleep(2)
            
            sheets_test = await self._test_sheets_api()
            if sheets_test["success"]:
                self.logger.info("✅ Sheets API repaired")
                return True
            
            self.logger.warning("❌ Auto-repair failed for Sheets API")
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Auto-repair error: {str(e)}")
            return False
    
    async def _auto_repair_sheets_data(self, test_result: Dict[str, Any]) -> bool:
        """Auto-repair Sheets data access issues"""
        self.logger.info("🔧 Attempting auto-repair for Sheets data access...")
        
        try:
            # Wait and retry
            await asyncio.sleep(3)
            
            data_test = await self._test_sheets_data_access()
            if data_test["success"]:
                self.logger.info("✅ Sheets data access repaired")
                return True
            
            self.logger.warning("❌ Auto-repair failed for Sheets data access")
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Auto-repair error: {str(e)}")
            return False
    
    async def start_continuous_monitoring(self, interval: int = 60):
        """Start continuous database monitoring"""
        self.monitoring_active = True
        self.logger.info(f"🔄 Starting continuous monitoring (interval: {interval}s)")
        
        while self.monitoring_active:
            try:
                result = await self.run_comprehensive_diagnostics()
                self.diagnostics_history.append(result)
                
                # Keep only last 100 results
                if len(self.diagnostics_history) > 100:
                    self.diagnostics_history = self.diagnostics_history[-100:]
                
                # Alert if critical issues
                if result.status in [ConnectionStatus.CRITICAL, ConnectionStatus.OFFLINE]:
                    await self._send_alert(result)
                
                await asyncio.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Monitoring error: {str(e)}")
                await asyncio.sleep(interval)
    
    def stop_monitoring(self):
        """Stop continuous monitoring"""
        self.monitoring_active = False
        self.logger.info("⏹️ Continuous monitoring stopped")
    
    async def _send_alert(self, result: DiagnosticResult):
        """Send alert for critical issues"""
        alert_message = f"🚨 Database Connection Alert: {result.message}"
        self.logger.critical(alert_message)
        
        # Here you could send email, Slack notification, etc.
        # For now, just log it
    
    def get_diagnostics_summary(self) -> Dict[str, Any]:
        """Get summary of diagnostics history"""
        if not self.diagnostics_history:
            return {"message": "No diagnostics history available"}
        
        recent_results = self.diagnostics_history[-10:]  # Last 10 results
        
        status_counts = {}
        for result in recent_results:
            status = result.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
        
        last_result = self.diagnostics_history[-1]
        
        return {
            "total_diagnostics": len(self.diagnostics_history),
            "recent_status_counts": status_counts,
            "last_check": last_result.timestamp.isoformat(),
            "current_status": last_result.status.value,
            "auto_repair_enabled": self.auto_repair_enabled,
            "monitoring_active": self.monitoring_active
        }

# Global AI Diagnostics instance
ai_diagnostics = AIDatabaseDiagnostics()
