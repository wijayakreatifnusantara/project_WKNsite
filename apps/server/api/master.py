from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time
from utils.supabase_client import get_supabase

router = APIRouter()

# ---------------------------------------------------------
# SHIFT MODELS & ROUTES
# ---------------------------------------------------------
class ShiftCreate(BaseModel):
    code: str
    name: str
    time_in: time
    time_out: time
    grace_period: int = 15
    break_start: Optional[time] = None
    break_end: Optional[time] = None
    is_cross_day: bool = False
    is_active: bool = True

class ShiftUpdate(ShiftCreate):
    pass

@router.get("/shifts")
def get_shifts(active_only: bool = False):
    supabase = get_supabase()
    try:
        query = supabase.table("shifts").select("*")
        if active_only:
            query = query.eq("is_active", True)
        
        response = query.order("created_at", desc=False).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shifts")
def create_shift(shift: ShiftCreate):
    supabase = get_supabase()
    try:
        data = shift.dict()
        data["time_in"] = data["time_in"].strftime("%H:%M:%S")
        data["time_out"] = data["time_out"].strftime("%H:%M:%S")
        if data["break_start"]:
            data["break_start"] = data["break_start"].strftime("%H:%M:%S")
        if data["break_end"]:
            data["break_end"] = data["break_end"].strftime("%H:%M:%S")
            
        response = supabase.table("shifts").insert(data).execute()
        return {"status": "success", "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/shifts/{shift_id}")
def update_shift(shift_id: str, shift: ShiftUpdate):
    supabase = get_supabase()
    try:
        data = shift.dict()
        data["time_in"] = data["time_in"].strftime("%H:%M:%S")
        data["time_out"] = data["time_out"].strftime("%H:%M:%S")
        if data["break_start"]:
            data["break_start"] = data["break_start"].strftime("%H:%M:%S")
        if data["break_end"]:
            data["break_end"] = data["break_end"].strftime("%H:%M:%S")
            
        response = supabase.table("shifts").update(data).eq("id", shift_id).execute()
        return {"status": "success", "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# HOLIDAY MODELS & ROUTES
# ---------------------------------------------------------
class HolidayCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    type: str = "Libur Nasional"
    description: Optional[str] = None

class HolidayUpdate(HolidayCreate):
    pass

@router.get("/holidays")
def get_holidays():
    supabase = get_supabase()
    try:
        response = supabase.table("national_holidays").select("*").order("start_date", desc=False).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/holidays")
def create_holiday(holiday: HolidayCreate):
    supabase = get_supabase()
    try:
        data = holiday.dict()
        data["start_date"] = data["start_date"].isoformat()
        data["end_date"] = data["end_date"].isoformat()
        
        response = supabase.table("national_holidays").insert(data).execute()
        return {"status": "success", "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/holidays/{holiday_id}")
def update_holiday(holiday_id: str, holiday: HolidayUpdate):
    supabase = get_supabase()
    try:
        data = holiday.dict()
        data["start_date"] = data["start_date"].isoformat()
        data["end_date"] = data["end_date"].isoformat()
        
        response = supabase.table("national_holidays").update(data).eq("id", holiday_id).execute()
        return {"status": "success", "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
