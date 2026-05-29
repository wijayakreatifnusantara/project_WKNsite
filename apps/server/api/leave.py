from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from typing import List, Dict, Any
from datetime import datetime, timedelta
from utils.leave_logic import calculate_working_days
from utils.jwt_handler import get_current_user, require_admin

router = APIRouter()

@router.get("/leave/requests")
async def get_leave_requests(status: str = None, current_user: dict = Depends(require_admin)):
    """Fetch all leave requests (Admin only)"""
    try:
        query = supabase_client.client.table("leave_requests").select("*")
        if status:
            query = query.eq("status", status)
        
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leave/my-requests")
async def get_my_leave_requests(status: str = None, current_user: dict = Depends(get_current_user)):
    """Fetch all leave requests for the current employee"""
    try:
        employee_id = current_user.get("employee_id")
        query = supabase_client.client.table("leave_requests").select("*").eq("employee_id", employee_id)
        if status:
            query = query.eq("status", status)
        
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leave/balances")
async def get_leave_balances(current_user: dict = Depends(require_admin)):
    """Fetch leave balances for all employees (Admin only)"""
    try:
        res = supabase_client.client.table("employees").select("id, employee_id, name, annual_leave_balance").execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leave/request")
async def create_leave_request(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Submit a new leave request (Employees or Admin)"""
    try:
        employee_id = payload.get("employee_id")
        
        # VALIDASI KEAMANAN: Karyawan biasa HANYA boleh mengajukan cuti untuk dirinya sendiri!
        user_role = current_user.get("role", "").lower()
        if user_role not in ["admin", "owner"] and current_user.get("employee_id") != employee_id:
            raise HTTPException(
                status_code=403, 
                detail="Akses ditolak. Anda tidak diperbolehkan mengajukan cuti atas nama karyawan lain."
            )

        start_date = payload.get("start_date")
        end_date = payload.get("end_date")
        
        # Calculate days
        days = calculate_working_days(start_date, end_date)
        
        # VALIDASI BISNIS: Tolak jika jumlah hari kerja 0 (misal: pengajuan hanya di akhir pekan)
        if days <= 0:
            raise HTTPException(
                status_code=400, 
                detail="Pengajuan ditolak. Rentang tanggal yang dipilih tidak memiliki hari kerja aktif."
            )
        
        # Force these fields so the client cannot tamper with them
        payload.pop("days_count", None)
        payload.pop("status", None)
        payload.pop("applied_at", None)
        
        record = {
            **payload,
            "days_count": days,
            "status": "Pending",
            "applied_at": datetime.now().isoformat()
        }
        
        res = supabase_client.client.table("leave_requests").insert(record).execute()
        if res.data:
            request_data = res.data[0]
            request_id = request_data.get("id")
            # Fetch employee details for PDF
            try:
                emp_res = supabase_client.client.table("employees").select("*").eq("id", employee_id).execute()
                if not emp_res.data:
                    emp_res = supabase_client.client.table("employees").select("*").eq("employee_id", employee_id).execute()
                employee_data = emp_res.data[0] if emp_res.data else {}
                
                from utils.pdf_generator import RequestPDFGenerator
                pdf_url = await RequestPDFGenerator.generate_leave_pdf(
                    request_id=str(request_id),
                    employee_data=employee_data,
                    request_data=request_data,
                    manager_signature_url=None
                )
                
                # Save pdf_url back to db
                supabase_client.client.table("leave_requests").update({"pdf_url": pdf_url}).eq("id", request_id).execute()
                res.data[0]["pdf_url"] = pdf_url
            except Exception as pdf_err:
                print(f"[PDF Generator] Error during initial PDF creation: {pdf_err}")
                
        return {"status": "success", "data": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/leave/approve/{request_id}")
async def approve_leave_request(request_id: str, payload: Dict[str, Any], current_user: dict = Depends(require_admin)):
    """Approve or reject a leave request (Admin only)"""
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
        
        # 1b. Fetch approver signature and employee details to regenerate PDF
        try:
            manager_sig_url = None
            if status == "Approved" and admin_id:
                mgr_res = supabase_client.client.table("employees").select("signature_url").eq("id", admin_id).execute()
                if not mgr_res.data:
                    mgr_res = supabase_client.client.table("employees").select("signature_url").eq("employee_id", admin_id).execute()
                if mgr_res.data:
                    manager_sig_url = mgr_res.data[0].get("signature_url")
            
            # Fetch employee
            employee_id = request_data.get("employee_id")
            emp_res = supabase_client.client.table("employees").select("*").eq("id", employee_id).execute()
            if not emp_res.data:
                emp_res = supabase_client.client.table("employees").select("*").eq("employee_id", employee_id).execute()
            employee_data = emp_res.data[0] if emp_res.data else {}
            
            from utils.pdf_generator import RequestPDFGenerator
            pdf_url = await RequestPDFGenerator.generate_leave_pdf(
                request_id=str(request_id),
                employee_data=employee_data,
                request_data=request_data,
                manager_signature_url=manager_sig_url
            )
            
            # Save pdf_url back to db
            supabase_client.client.table("leave_requests").update({"pdf_url": pdf_url}).eq("id", request_id).execute()
            request_data["pdf_url"] = pdf_url
        except Exception as pdf_err:
            print(f"[PDF Generator] Error during approval PDF regeneration: {pdf_err}")
        
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

@router.put("/leave/direct/{request_id}")
async def update_leave_direct(request_id: int, data: dict, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("leave_requests").update(data).eq("id", request_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct update failed: {str(e)}")

@router.delete("/leave/direct/{request_id}")
async def delete_leave_direct(request_id: int, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("leave_requests").delete().eq("id", request_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct delete failed: {str(e)}")
