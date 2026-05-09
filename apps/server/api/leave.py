from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase_client
from typing import List, Dict, Any
from datetime import datetime, timedelta
from utils.leave_logic import calculate_working_days

router = APIRouter()

@router.get("/leave/requests")
async def get_leave_requests(status: str = None):
    """Fetch all leave requests"""
    try:
        query = supabase_client.client.table("leave_requests").select("*")
        if status:
            query = query.eq("status", status)
        
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leave/balances")
async def get_leave_balances():
    """Fetch leave balances for all employees"""
    try:
        res = supabase_client.client.table("employees").select("id, employee_id, name, annual_leave_balance").execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leave/request")
async def create_leave_request(payload: Dict[str, Any]):
    """Submit a new leave request"""
    try:
        start_date = payload.get("start_date")
        end_date = payload.get("end_date")
        
        # Calculate days
        days = calculate_working_days(start_date, end_date)
        
        record = {
            **payload,
            "days_count": days,
            "status": "Pending",
            "applied_at": datetime.now().isoformat()
        }
        
        res = supabase_client.client.table("leave_requests").insert(record).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/leave/approve/{request_id}")
async def approve_leave_request(request_id: str, payload: Dict[str, Any]):
    """Approve or reject a leave request"""
    try:
        status = payload.get("status") # Approved or Rejected
        admin_id = payload.get("admin_id")
        
        # 1. Update request status
        res = supabase_client.client.table("leave_requests").update({
            "status": status,
            "approved_by": admin_id
        }).eq("id", request_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Request not found")
            
        request_data = res.data[0]
        
        # 2. If approved, sync to attendance and deduct balance (T022)
        if status == "Approved":
            eid = request_data.get("employee_id")
            days = request_data.get("days_count", 0)
            start_date_str = request_data.get("start_date")
            end_date_str = request_data.get("end_date")
            leave_type = request_data.get("leave_type", "Leave")
            attendance_status = "Unpaid Leave" if leave_type == "Unpaid" else "Leave"
            
            # Auto-sync to attendance table (handles conflict/duplicate via ON CONFLICT DO NOTHING)
            synced_days = await supabase_client.sync_leave_to_attendance(
                employee_id=eid,
                start_date=start_date_str,
                end_date=end_date_str,
                leave_type=attendance_status
            )

            # Deduct balance if Annual Leave
            if request_data.get("leave_type") == "Annual":
                emp_res = supabase_client.client.table("employees").select("annual_leave_balance").eq("employee_id", eid).execute()
                if emp_res.data:
                    curr_balance = emp_res.data[0].get("annual_leave_balance", 12)
                    new_balance = max(0, curr_balance - days)
                    
                    supabase_client.client.table("employees").update({
                        "annual_leave_balance": new_balance
                    }).eq("employee_id", eid).execute()
        
        return {"status": "success", "data": request_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
