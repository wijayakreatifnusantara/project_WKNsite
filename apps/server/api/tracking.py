from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.supabase_client import supabase_client
from utils.jwt_handler import get_current_user, require_admin
from datetime import datetime

router = APIRouter()

class LocationPing(BaseModel):
    lat: float
    lng: float

@router.post("/tracking/ping")
async def ping_location(payload: LocationPing, current_user: dict = Depends(get_current_user)):
    """Receive location ping from mobile app and update last known location in employees table"""
    try:
        employee_id = current_user.get("employee_id")
        if not employee_id:
            raise HTTPException(status_code=400, detail="No employee_id in token")
            
        update_data = {
            "last_lat": payload.lat,
            "last_lng": payload.lng,
            "last_location_update": datetime.now().isoformat()
        }
        
        # We don't check for error strictly because the columns might not exist yet if user hasn't run SQL
        res = supabase_client.client.table("employees").update(update_data).eq("id", employee_id).execute()
        
        return {"status": "success", "message": "Location updated"}
    except Exception as e:
        # Ignore postgrest errors related to missing columns so app doesn't crash before SQL is run
        if "last_lat" in str(e):
             return {"status": "success", "message": "Location ping ignored (columns not ready)"}
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tracking/active")
async def get_active_tracking(current_user: dict = Depends(require_admin)):
    """Get latest locations of all employees who have pinged recently"""
    try:
        # Fetch employees with location data, maybe only those who are active
        res = supabase_client.client.table("employees").select(
            "id, name, division_name, job_position, is_field_team, photo, last_lat, last_lng, last_location_update"
        ).not_.is_("last_lat", "null").eq("status", "Active").execute()
        
        return {"status": "success", "data": res.data}
    except Exception as e:
        if "last_lat" in str(e):
             return {"status": "success", "data": []}
        raise HTTPException(status_code=500, detail=str(e))
