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
        data = res.data

        # Ambil data absensi untuk mendeteksi anomali (Cross-Validation UI)
        if data:
            dates = list(set([r.get("date") for r in data if r.get("date")]))
            emp_ids = list(set([r.get("employee_id") for r in data if r.get("employee_id")]))
            
            if dates and emp_ids:
                att_res = supabase_client.client.table("attendance").select("employee_id, date, clock_in, clock_out").in_("employee_id", emp_ids).in_("date", dates).execute()
                att_map = {(a["employee_id"], a["date"]): a for a in att_res.data}
                
                for req in data:
                    req["attendance"] = att_map.get((req.get("employee_id"), req.get("date")))

        return {"status": "success", "data": data}
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

        # 1a. Fetch existing request for Cross-Validation
        req_res = supabase_client.client.table("overtime_requests").select("*").eq("id", request_id).execute()
        if not req_res.data:
            raise HTTPException(status_code=404, detail="Pengajuan lembur tidak ditemukan.")
        request_data = req_res.data[0]

        # Validasi Silang Absensi (Cross-Validation)
        if status == "Approved":
            employee_id = request_data.get("employee_id")
            ot_date = request_data.get("date")
            ot_start = request_data.get("start_time")
            ot_end = request_data.get("end_time")

            att_res = supabase_client.client.table("attendance").select("clock_out").eq("employee_id", employee_id).eq("date", ot_date).execute()
            if not att_res.data:
                raise HTTPException(status_code=400, detail="Karyawan tidak memiliki data absensi pada tanggal tersebut.")
            
            clock_out = att_res.data[0].get("clock_out")
            if not clock_out:
                raise HTTPException(status_code=400, detail="Karyawan belum melakukan Clock-Out absensi. Persetujuan lembur ditolak.")
            
            try:
                t_start = datetime.strptime(ot_start[:5], "%H:%M")
                t_end = datetime.strptime(ot_end[:5], "%H:%M")
                t_out = datetime.strptime(clock_out[:5], "%H:%M")
                
                if t_end < t_start: t_end += timedelta(days=1)
                if t_out < t_start: t_out += timedelta(days=1)
                
                # Tambahkan toleransi 5 menit (kadang clock_out di 18:59 dianggap invalid untuk lembur sd 19:00)
                if t_end > (t_out + timedelta(minutes=5)):
                    raise HTTPException(status_code=400, detail=f"Validasi Gagal: Jam Clock-Out absensi ({clock_out[:5]}) lebih awal dari jam selesai lembur ({ot_end[:5]}).")
            except Exception as e:
                if isinstance(e, HTTPException):
                    raise
                # Jika parsing gagal, lewati validasi (fallback aman)
                pass

        res = supabase_client.client.table("overtime_requests").update({
            "status": status,
            "approved_by": admin_id,
            "updated_at": datetime.now().isoformat()
        }).eq("id", request_id).execute()

        request_data = res.data[0]
        
        # 2. Sinkronisasi Otomatis ke Payroll (Tunjangan Lembur)
        if status == "Approved":
            try:
                employee_id_sync = request_data.get("employee_id")
                duration = float(request_data.get("duration_hours", 0))
                if duration > 0:
                    sal_res = supabase_client.client.table("employee_salaries").select("id, basic_salary, overtime_allowance").eq("employee_id", employee_id_sync).execute()
                    if sal_res.data:
                        salary_data = sal_res.data[0]
                        basic_salary = float(salary_data.get("basic_salary") or 0)
                        current_ot_allowance = float(salary_data.get("overtime_allowance") or 0)
                        
                        # Rumus lembur standar Kemenaker: (Gaji Pokok / 173) * Jam * 1.5
                        ot_pay = (basic_salary / 173.0) * duration * 1.5
                        new_ot_allowance = current_ot_allowance + round(ot_pay)
                        
                        supabase_client.client.table("employee_salaries").update({
                            "overtime_allowance": new_ot_allowance
                        }).eq("id", salary_data["id"]).execute()
                    else:
                        ot_pay = 0 # Fallback jika belum migrasi ke employee_salaries
                        
                    # Update juga di JSON payroll_components (employees) untuk backward compatibility
                    emp_res = supabase_client.client.table("employees").select("id, payroll_components").eq("id", employee_id_sync).execute()
                    if not emp_res.data:
                        emp_res = supabase_client.client.table("employees").select("id, payroll_components").eq("employee_id", employee_id_sync).execute()
                        
                    if emp_res.data:
                        emp_id_db = emp_res.data[0]["id"]
                        pc = emp_res.data[0].get("payroll_components") or {}
                        if "variable_income" not in pc:
                            pc["variable_income"] = {}
                            
                        if not sal_res.data:
                            b_sal = float(pc.get("basic_salary", 0))
                            ot_pay = (b_sal / 173.0) * duration * 1.5
                            
                        current_json_ot = float(pc["variable_income"].get("overtime_allowance", 0) or 0)
                        pc["variable_income"]["overtime_allowance"] = current_json_ot + round(ot_pay)
                        
                        supabase_client.client.table("employees").update({
                            "payroll_components": pc
                        }).eq("id", emp_id_db).execute()

            except Exception as sync_err:
                print(f"[Payroll Sync] Error syncing overtime to payroll: {sync_err}")

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
