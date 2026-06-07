from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from typing import List, Dict, Any
from datetime import datetime, timedelta
from utils.jwt_handler import get_current_user, require_admin

router = APIRouter()

@router.get("/overtime/requests")
async def get_overtime_requests(status: str = None, current_user: dict = Depends(require_admin)):
    """Fetch all overtime requests (Admin only)"""
    try:
        query = supabase_client.client.table("overtime_requests").select("""
            *,
            employees (
                id,
                employee_id,
                name,
                job_position,
                division_name
            )
        """).order("created_at", { "ascending": False })
        
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
            
        # 1b. Fetch employee details and generate PDF
        if res.data:
            request_data = res.data[0]
            request_id = request_data.get("id")
            try:
                emp_res = supabase_client.client.table("employees").select("*").eq("id", employee_id).execute()
                if not emp_res.data:
                    emp_res = supabase_client.client.table("employees").select("*").eq("employee_id", employee_id).execute()
                employee_data = emp_res.data[0] if emp_res.data else {}
                
                from utils.pdf_generator import RequestPDFGenerator
                pdf_url = await RequestPDFGenerator.generate_overtime_pdf(
                    request_id=str(request_id),
                    employee_data=employee_data,
                    request_data=request_data,
                    manager_signature_url=None
                )
                
                # Save pdf_url back to db
                supabase_client.client.table("overtime_requests").update({"pdf_url": pdf_url}).eq("id", request_id).execute()
                res.data[0]["pdf_url"] = pdf_url
            except Exception as pdf_err:
                print(f"[PDF Generator] Error during overtime PDF creation: {pdf_err}")
                
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
            pdf_url = await RequestPDFGenerator.generate_overtime_pdf(
                request_id=str(request_id),
                employee_data=employee_data,
                request_data=request_data,
                manager_signature_url=manager_sig_url
            )
            
            # Save pdf_url back to db
            supabase_client.client.table("overtime_requests").update({"pdf_url": pdf_url}).eq("id", request_id).execute()
            res.data[0]["pdf_url"] = pdf_url
        except Exception as pdf_err:
            print(f"[PDF Generator] Error during overtime approval PDF regeneration: {pdf_err}")

        return {"status": "success", "data": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
