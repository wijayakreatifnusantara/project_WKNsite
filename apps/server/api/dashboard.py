from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from utils.jwt_handler import get_current_user, require_admin

router = APIRouter()

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics (Authenticated Users)"""
    try:
        stats = await supabase_client.get_dashboard_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

@router.get("/dashboard/attendance")
async def get_attendance_data(current_user: dict = Depends(get_current_user)):
    """Get attendance data for dashboard (Authenticated Users)"""
    try:
        attendance = await supabase_client.get_attendance()
        return {"status": "success", "data": attendance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendance: {str(e)}")

@router.get("/dashboard/mutations")
async def get_mutation_data(current_user: dict = Depends(get_current_user)):
    """Get mutation history for dashboard (Authenticated Users)"""
    try:
        # Mutations placeholder
        return {"status": "success", "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching mutations: {str(e)}")

@router.get("/dashboard/logs")
async def get_system_logs(current_user: dict = Depends(require_admin)):
    """Get system logs for dashboard (Admin only)"""
    try:
        # Logs placeholder
        return {"status": "success", "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching logs: {str(e)}")
