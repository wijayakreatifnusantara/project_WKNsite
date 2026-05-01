"""
Error Monitoring API for WKNsite AI Error Handler
Provides dashboard and analytics for error tracking
"""

from fastapi import APIRouter, HTTPException
from utils.ai_error_handler import ai_error_handler
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/error-stats")
async def get_error_statistics() -> Dict[str, Any]:
    """Get comprehensive error statistics"""
    try:
        stats = ai_error_handler.get_error_statistics()
        return {
            "status": "success",
            "data": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/error-history")
async def get_error_history(limit: int = 50) -> Dict[str, Any]:
    """Get recent error history"""
    try:
        # Get recent errors from AI handler
        history = ai_error_handler.error_history[-limit:] if ai_error_handler.error_history else []
        
        # Convert to serializable format
        serializable_history = []
        for error in history:
            serializable_error = {
                "error_id": error.error_id,
                "timestamp": error.timestamp.isoformat(),
                "category": error.category.value,
                "severity": error.severity.value,
                "message": error.message,
                "resolved": error.resolved,
                "resolution_method": error.resolution_method,
                "user_context": error.user_context,
                "system_context": error.system_context
            }
            serializable_history.append(serializable_error)
        
        return {
            "status": "success",
            "data": {
                "errors": serializable_history,
                "total_count": len(serializable_history),
                "limit": limit
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@router.get("/error-patterns")
async def get_error_patterns() -> Dict[str, Any]:
    """Get learned error patterns"""
    try:
        patterns = []
        for pattern in ai_error_handler.error_patterns:
            pattern_data = {
                "pattern": pattern.pattern,
                "category": pattern.category.value,
                "severity": pattern.severity.value,
                "auto_recovery": pattern.auto_recovery,
                "recovery_action": pattern.recovery_action,
                "frequency": pattern.frequency,
                "last_occurrence": pattern.last_occurrence.isoformat() if pattern.last_occurrence else None
            }
            patterns.append(pattern_data)
        
        # Sort by frequency
        patterns.sort(key=lambda x: x["frequency"], reverse=True)
        
        return {
            "status": "success",
            "data": {
                "patterns": patterns,
                "total_patterns": len(patterns)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching patterns: {str(e)}")

@router.post("/error-log")
async def log_error(error_data: Dict[str, Any]) -> Dict[str, Any]:
    """Receive error logs from frontend"""
    try:
        # Store error log (could be sent to database or file)
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "source": "frontend",
            "data": error_data
        }
        
        # Log to file (in production, use proper logging system)
        with open("logs/frontend_errors.jsonl", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
        
        return {
            "status": "success",
            "message": "Error logged successfully",
            "error_id": error_data.get("error_id", "unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging: {str(e)}")

@router.get("/health-check")
async def health_check() -> Dict[str, Any]:
    """Health check for error monitoring system"""
    try:
        stats = ai_error_handler.get_error_statistics()
        
        # Determine system health
        total_errors = stats.get("total_errors", 0)
        recent_errors = stats.get("recent_errors_24h", 0)
        critical_errors = stats.get("errors_by_severity", {}).get("critical", 0)
        
        if critical_errors > 0:
            health_status = "critical"
        elif recent_errors > 50:
            health_status = "warning"
        elif recent_errors > 10:
            health_status = "degraded"
        else:
            health_status = "healthy"
        
        return {
            "status": "success",
            "data": {
                "health": health_status,
                "total_errors": total_errors,
                "recent_errors_24h": recent_errors,
                "critical_errors": critical_errors,
                "auto_recovery_enabled": ai_error_handler.auto_recovery_enabled,
                "learning_enabled": ai_error_handler.learning_enabled,
                "uptime": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.post("/configure")
async def configure_error_handler(config: Dict[str, Any]) -> Dict[str, Any]:
    """Configure AI error handler settings"""
    try:
        # Update configuration
        if "auto_recovery_enabled" in config:
            ai_error_handler.auto_recovery_enabled = config["auto_recovery_enabled"]
        
        if "learning_enabled" in config:
            ai_error_handler.learning_enabled = config["learning_enabled"]
        
        return {
            "status": "success",
            "message": "Configuration updated",
            "current_config": {
                "auto_recovery_enabled": ai_error_handler.auto_recovery_enabled,
                "learning_enabled": ai_error_handler.learning_enabled
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration failed: {str(e)}")

@router.get("/dashboard-data")
async def get_dashboard_data() -> Dict[str, Any]:
    """Get comprehensive dashboard data"""
    try:
        stats = ai_error_handler.get_error_statistics()
        patterns = await get_error_patterns()
        history = await get_error_history(limit=20)
        health = await health_check()
        
        return {
            "status": "success",
            "data": {
                "statistics": stats["data"],
                "patterns": patterns["data"],
                "recent_errors": history["data"],
                "health": health["data"]
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard data failed: {str(e)}")
