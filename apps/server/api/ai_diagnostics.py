"""
AI Database Diagnostics API
Provides endpoints for database connection monitoring and auto-repair
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from utils.ai_database_diagnostics import ai_diagnostics
from typing import Dict, Any, Optional
import asyncio

router = APIRouter()

@router.get("/diagnostics/run")
async def run_diagnostics():
    """Run comprehensive database diagnostics"""
    try:
        result = await ai_diagnostics.run_comprehensive_diagnostics()
        
        return {
            "status": "success",
            "data": {
                "timestamp": result.timestamp.isoformat(),
                "connection_status": result.status.value,
                "issue_type": result.issue_type.value if result.issue_type else None,
                "message": result.message,
                "details": result.details,
                "auto_repaired": result.auto_repaired,
                "repair_method": result.repair_method,
                "repair_success": result.repair_success
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostics failed: {str(e)}")

@router.get("/diagnostics/summary")
async def get_diagnostics_summary():
    """Get diagnostics summary and history"""
    try:
        summary = ai_diagnostics.get_diagnostics_summary()
        return {
            "status": "success",
            "data": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")

@router.post("/diagnostics/monitoring/start")
async def start_monitoring(background_tasks: BackgroundTasks, interval: int = 60):
    """Start continuous monitoring"""
    try:
        if ai_diagnostics.monitoring_active:
            return {
                "status": "info",
                "message": "Monitoring is already active"
            }
        
        # Start monitoring in background
        background_tasks.add_task(ai_diagnostics.start_continuous_monitoring, interval)
        
        return {
            "status": "success",
            "message": f"Monitoring started with {interval}s interval"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {str(e)}")

@router.post("/diagnostics/monitoring/stop")
async def stop_monitoring():
    """Stop continuous monitoring"""
    try:
        ai_diagnostics.stop_monitoring()
        return {
            "status": "success",
            "message": "Monitoring stopped"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop monitoring: {str(e)}")

@router.get("/diagnostics/status")
async def get_monitoring_status():
    """Get current monitoring status"""
    try:
        return {
            "status": "success",
            "data": {
                "monitoring_active": ai_diagnostics.monitoring_active,
                "auto_repair_enabled": ai_diagnostics.auto_repair_enabled,
                "last_diagnostics": ai_diagnostics.diagnostics_history[-1].timestamp.isoformat() if ai_diagnostics.diagnostics_history else None,
                "total_diagnostics_run": len(ai_diagnostics.diagnostics_history)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.post("/diagnostics/auto-repair/enable")
async def enable_auto_repair():
    """Enable auto-repair functionality"""
    try:
        ai_diagnostics.auto_repair_enabled = True
        return {
            "status": "success",
            "message": "Auto-repair enabled"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enable auto-repair: {str(e)}")

@router.post("/diagnostics/auto-repair/disable")
async def disable_auto_repair():
    """Disable auto-repair functionality"""
    try:
        ai_diagnostics.auto_repair_enabled = False
        return {
            "status": "success",
            "message": "Auto-repair disabled"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disable auto-repair: {str(e)}")

@router.get("/diagnostics/history")
async def get_diagnostics_history(limit: int = 20):
    """Get diagnostics history"""
    try:
        history = ai_diagnostics.diagnostics_history[-limit:] if ai_diagnostics.diagnostics_history else []
        
        serializable_history = []
        for result in history:
            serializable_history.append({
                "timestamp": result.timestamp.isoformat(),
                "status": result.status.value,
                "issue_type": result.issue_type.value if result.issue_type else None,
                "message": result.message,
                "details": result.details,
                "auto_repaired": result.auto_repaired,
                "repair_method": result.repair_method,
                "repair_success": result.repair_success
            })
        
        return {
            "status": "success",
            "data": {
                "history": serializable_history,
                "total_count": len(serializable_history),
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.get("/diagnostics/health")
async def get_database_health():
    """Get overall database health score"""
    try:
        if not ai_diagnostics.diagnostics_history:
            return {
                "status": "info",
                "message": "No diagnostics data available"
            }
        
        # Calculate health score based on recent diagnostics
        recent_results = ai_diagnostics.diagnostics_history[-10:]  # Last 10 results
        
        health_scores = {
            "healthy": 100,
            "degraded": 60,
            "critical": 20,
            "offline": 0
        }
        
        total_score = sum(health_scores.get(result.status.value, 50) for result in recent_results)
        avg_score = total_score / len(recent_results)
        
        # Determine health status
        if avg_score >= 80:
            health_status = "excellent"
        elif avg_score >= 60:
            health_status = "good"
        elif avg_score >= 40:
            health_status = "fair"
        else:
            health_status = "poor"
        
        return {
            "status": "success",
            "data": {
                "health_score": round(avg_score, 1),
                "health_status": health_status,
                "last_check": ai_diagnostics.diagnostics_history[-1].timestamp.isoformat(),
                "checks_analyzed": len(recent_results),
                "auto_repair_rate": sum(1 for r in recent_results if r.auto_repaired) / len(recent_results) * 100
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate health: {str(e)}")
