from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from typing import List, Dict, Any
from datetime import datetime
from utils.jwt_handler import get_current_user, require_admin

router = APIRouter()

@router.get("/overtime/requests")
async def get_overtime_requests(status: str = None, current_user: dict = Depends(require_admin)):
    """Fetch all overtime requests (Admin only)"""
    try:
        query = supabase_client.client.table("overtime_requests").select(`
            *,
            employees (
                id,
                employee_id,
                name,
                job_position,
                organization_name
            )
        `).order("created_at", { "ascending": False })
        
        if status:
            query = query.eq("status", status)
        
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overtime/my-requests")
async def get_my_overtime_requests(current_user: dict = Depends(get_current_user)):
    """Fetch overtime requests for the logged-in employee"""
    try:
        employee_id = current_user.get("employee_id")
        if not employee_id:
            # Fallback check: find employee record via UUID or profile details
            # If current_user has a profile username, get employee_id
            username = current_user.get("sub")
            if username:
                emp_res = supabase_client.client.table("employees").select("id").eq("email", username).execute()
                if emp_res.data:
                    employee_id = emp_res.data[0].get("id")
            
        if not employee_id:
            raise HTTPException(status_code=400, detail="Employee record not linked to this account.")

        res = supabase_client.client.table("overtime_requests")\
            .select("*")\
            .eq("employee_id", employee_id)\
            .order("created_at", { "ascending": False })\
            .execute()
            
        return {"status": "success", "data": res.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/overtime/request")
async def create_overtime_request(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Submit a new overtime request"""
    try:
        employee_id = payload.get("employee_id")
        
        # SECURITY VALIDATION: Regular employees can only request overtime for themselves
        user_role = current_user.get("role", "").lower()
        my_employee_id = current_user.get("employee_id")
        
        if user_role not in ["admin", "owner"] and my_employee_id != employee_id:
            raise HTTPException(
                status_code=403, 
                detail="Akses ditolak. Anda tidak diperbolehkan mengajukan lembur atas nama karyawan lain."
            )

        date = payload.get("date")
        start_time = payload.get("start_time")
        end_time = payload.get("end_time")
        reason = payload.get("reason")

        if not date or not start_time or not end_time or not reason:
            raise HTTPException(status_code=400, detail="Data pengajuan tidak lengkap.")

        # Calculate duration hours
        try:
            t1 = datetime.strptime(start_time, "%H:%M")
            t2 = datetime.strptime(end_time, "%H:%M")
            # If overtime crosses midnight, add 1 day to t2
            if t2 < t1:
                t2 += timedelta(days=1)
            duration = (t2 - t1).seconds / 3600.0
        except Exception:
            duration = payload.get("duration_hours", 0.0)

        record = {
            "employee_id": employee_id,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "duration_hours": round(duration, 2),
            "reason": reason,
            "status": "Pending",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        res = supabase_client.client.table("overtime_requests").insert(record).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Gagal menyimpan data pengajuan lembur.")
            
        return {"status": "success", "data": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/overtime/approve/{request_id}")
async def approve_overtime_request(request_id: str, payload: Dict[str, Any], current_user: dict = Depends(require_admin)):
    """Approve or reject an overtime request (Admin only)"""
    try:
        status = payload.get("status") # Approved or Rejected
        admin_id = current_user.get("employee_id") or payload.get("admin_id")

        if status not in ["Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="Status persetujuan tidak valid.")

        res = supabase_client.client.table("overtime_requests").update({
            "status": status,
            "approved_by": admin_id,
            "updated_at": datetime.now().isoformat()
        }).eq("id", request_id).execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="Pengajuan lembur tidak ditemukan.")

        return {"status": "success", "data": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
