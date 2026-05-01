"""
Dashboard API using MCP Google Sheets
"""

from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase_client

router = APIRouter()

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        stats = await supabase_client.get_dashboard_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

@router.get("/dashboard/attendance")
async def get_attendance_data():
    """Get attendance data for dashboard"""
    try:
        attendance = await supabase_client.get_attendance()
        return {"status": "success", "data": attendance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendance: {str(e)}")

@router.get("/dashboard/mutations")
async def get_mutation_data():
    """Get mutation history for dashboard"""
    try:
        # Mutations placeholder (can be added to supabase_client later)
        return {"status": "success", "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching mutations: {str(e)}")

@router.get("/dashboard/logs")
async def get_system_logs():
    """Get system logs for dashboard"""
    try:
        # Logs placeholder
        return {"status": "success", "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching logs: {str(e)}")
