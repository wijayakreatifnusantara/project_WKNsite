from fastapi import APIRouter, HTTPException, Depends
from models.employee import EmployeeCreate, Employee
from utils.supabase_client import supabase_client
from utils.ai_error_handler import ai_error_handler
from typing import Optional, List, Dict, Any
from utils.jwt_handler import require_admin, get_current_user
from fastapi import UploadFile, File, Form
import time
import uuid

router = APIRouter()

@router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate, current_user: dict = Depends(require_admin)):
    try:
        # Use Pydantic dictionary directly, dropping pseudo-headers
        employee_dict = employee.dict()
        spreadsheet_data = employee_dict
        
        success = await supabase_client.add_employee(spreadsheet_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add employee to Spreadsheet")
        
        if employee.email:
            await supabase_client.create_auth_user(email=employee.email, password="123456", name=employee.employee_name)
        
        return Employee(**employee_dict, id=0)
        
    except Exception as e:
        # AI Error Handling
        context = {
            "operation": "create_employee",
            "employee_id": employee.employee_id,
            "system": {
                "endpoint": "/employees",
                "method": "POST"
            }
        }
        
        ai_result = await ai_error_handler.handle_error(e, context)
        
        if ai_result["auto_recovered"]:
            return await create_employee(employee)
        
        raise HTTPException(
            status_code=400, 
            detail={
                "error": ai_result["user_message"],
                "error_id": ai_result["error_id"]
            }
        )

@router.get("/employees")
async def get_employees(
    q: Optional[str] = None, 
    page: int = 1, 
    size: int = 50, 
    mobile: bool = False,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Optimized: Pagination and Filtering handled at database level
        result = await supabase_client.get_employees(q=q, page=page, page_size=size)
        
        # Field Reduction for Mobile Bandwidth Optimization
        if mobile and result and "data" in result:
            optimized_data = []
            for emp in result["data"]:
                optimized_data.append({
                    "employee_id": emp.get("employee_id"),
                    "employee_name": emp.get("employee_name"),
                    "department": emp.get("department"),
                    "position": emp.get("position"),
                    "barcode": emp.get("barcode")
                })
            result["data"] = optimized_data
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employees: {str(e)}")

@router.get("/employees/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        if not employee_id:
            raise HTTPException(status_code=400, detail="No employee_id in token")
            
        res = supabase_client.client.table("employees").select("*, divisions(name), departments(name), positions(name)").eq("id", employee_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/employees/signature")
async def upload_signature(payload: dict, current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        signature_base64 = payload.get("signature_base64")
        if not signature_base64:
            raise HTTPException(status_code=400, detail="No signature provided")
            
        # In a real app we'd convert base64 to image and upload to Storage
        # For now, just save base64 string or assume it's an uploaded url
        # But wait, mobile app sends raw base64 or file?
        # Mobile app in signature.tsx uses expo-print and captures base64. Then uploads to storage.
        # Let's write a simple endpoint that saves it to DB directly for now, or just returns success if it's already a URL.
        # Actually, let's just update the signature_url in employees table
        url_or_base64 = payload.get("signature_url") or signature_base64
        
        res = supabase_client.client.table("employees").update({"signature_url": url_or_base64}).eq("id", employee_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        return {"status": "success", "signature_url": url_or_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/employees/upload")
async def upload_file(
    file: UploadFile = File(...),
    bucket: str = Form(...),
    current_user: dict = Depends(require_admin)
):
    """Upload a file to Supabase Storage and return public URL"""
    try:
        # Generate unique filename
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        unique_filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}.{ext}"
        
        file_bytes = await file.read()
        
        # Upload to Supabase Storage
        res = supabase_client.client.storage.from_(bucket).upload(
            file=file_bytes,
            path=unique_filename,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase_client.client.storage.from_(bucket).get_public_url(unique_filename)
        
        return {"status": "success", "publicUrl": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.get("/employees/generate-id")
async def generate_employee_id(org_code: str = "WKN", current_user: dict = Depends(require_admin)):
    """Generate the next employee ID for a given division code"""
    try:
        # Example logic: WKN-0001
        res = supabase_client.client.table("employees").select("id").like("id", f"{org_code.upper()}-%").not_.ilike("id", f"{org_code.upper()}-TMP-%").order("id", desc=True).limit(1).execute()
        
        max_num = 0
        if res.data and len(res.data) > 0:
            parts = res.data[0]["id"].split("-")
            if len(parts) > 1:
                try:
                    max_num = int(parts[1])
                except ValueError:
                    pass
                    
        new_num = max_num + 1
        new_id = f"{org_code.upper()}-{str(new_num).zfill(4)}"
        return {"status": "success", "data": new_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employees/notifications/unread-count")
async def get_unread_notifications_count(current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        res = supabase_client.client.table("notifications").select("id", count="exact").eq("employee_id", employee_id).eq("is_read", False).execute()
        count = res.count if hasattr(res, 'count') else (len(res.data) if res.data else 0)
        return {"status": "success", "count": count}
    except Exception as e:
        return {"status": "error", "count": 0}

@router.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, employee: EmployeeCreate, current_user: dict = Depends(require_admin)):
    try:
        # Fetch old email to detect changes
        old_res = supabase_client.client.table('employees').select('email').eq('id', employee_id).execute()
        old_email = old_res.data[0].get('email') if old_res.data else None

        # Use Pydantic dictionary directly
        employee_dict = employee.dict()
        spreadsheet_data = employee_dict
        
        success = await supabase_client.update_employee(employee_id, spreadsheet_data)
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        if old_email and employee.email and old_email != employee.email:
            await supabase_client.update_auth_user_email(old_email, employee.email)
            
        return Employee(**employee_dict, id=0)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating employee: {str(e)}")

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(require_admin)):
    try:
        old_res = supabase_client.client.table('employees').select('email').eq('id', employee_id).execute()
        old_email = old_res.data[0].get('email') if old_res.data else None

        success = await supabase_client.delete_employee(employee_id)
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        if old_email:
            await supabase_client.delete_or_suspend_auth_user(old_email)
            
        return {"status": "success", "message": "Employee soft-deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting employee: {str(e)}")

# --- BULK OPERATIONS FOR WEB ADMIN ---
from pydantic import BaseModel
class BulkActionRequest(BaseModel):
    ids: List[str]

class FCMTokenRequest(BaseModel):
    token: str

@router.put("/employees/fcm-token")
async def update_fcm_token(payload: FCMTokenRequest, current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        if not employee_id:
            raise HTTPException(status_code=400, detail="No employee_id in token")
            
        res = supabase_client.client.table("employees").update({"fcm_token": payload.token}).eq("id", employee_id).execute()
        return {"status": "success", "message": "FCM token updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ResetPasswordRequest(BaseModel):
    new_password: str

@router.put("/employees/{employee_id}/reset-password")
async def reset_employee_password(employee_id: str, payload: ResetPasswordRequest, current_user: dict = Depends(require_admin)):
    try:
        # 1. Update in employees table (mobile_password)
        success = await supabase_client.update_employee_password(employee_id, payload.new_password)
        if not success:
            raise HTTPException(status_code=404, detail="Gagal mengupdate password di database")
            
        # 2. Get employee email
        res = supabase_client.client.table('employees').select('email').eq('id', employee_id).execute()
        email = res.data[0].get('email') if res.data else None
        
        # 3. Update in Supabase Auth
        if email:
            auth_success = await supabase_client.update_auth_user_password(email, payload.new_password)
            if not auth_success:
                print(f"Warning: Failed to update auth user password for {email}")
                
        return {"status": "success", "message": "Password berhasil di-reset"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset password failed: {str(e)}")

@router.put("/employees/{employee_id}/reset-device")
async def reset_employee_device(employee_id: str, current_user: dict = Depends(require_admin)):
    try:
        # Reset device_id column to null
        response = supabase_client.client.table('employees').update({'device_id': None}).eq('id', employee_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")
            
        return {"status": "success", "message": "Device binding berhasil di-reset"}
    except Exception as e:
        # Since device_id might not exist yet, catch the specific postgrest error and gracefully fail or return success
        err_str = str(e)
        if "device_id" in err_str and "column" in err_str:
             return {"status": "success", "message": "Device binding tidak diperlukan/belum aktif di database"}
        raise HTTPException(status_code=500, detail=f"Reset device failed: {err_str}")

@router.put("/employees/bulk-resign")
async def bulk_resign_employees(data: BulkActionRequest, current_user: dict = Depends(require_admin)):
    try:
        from datetime import datetime
        
        # Fetch emails
        res = supabase_client.client.table('employees').select('email').in_('id', data.ids).execute()
        emails_to_ban = [row['email'] for row in res.data if row.get('email')]

        resign_date = datetime.now().strftime('%Y-%m-%d')
        update_data = {
            'status': 'RESIGNED',
            'resign_date': resign_date,
            'is_resigned': True
        }
        response = supabase_client.client.table('employees').update(update_data).in_('id', data.ids).execute()
        
        for email in emails_to_ban:
            await supabase_client.delete_or_suspend_auth_user(email)
            
        return {"status": "success", "count": len(response.data) if response.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk resign failed: {str(e)}")

@router.put("/employees/bulk-activate")
async def bulk_activate_employees(data: BulkActionRequest, current_user: dict = Depends(require_admin)):
    try:
        update_data = {
            'status': 'Permanent',
            'resign_date': None,
            'is_resigned': False
        }
        response = supabase_client.client.table('employees').update(update_data).in_('id', data.ids).execute()
        return {"status": "success", "count": len(response.data) if response.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk activate failed: {str(e)}")

@router.delete("/employees/bulk-delete")
async def bulk_delete_employees(data: BulkActionRequest, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table('employees').select('email').in_('id', data.ids).execute()
        emails_to_ban = [row['email'] for row in res.data if row.get('email')]
        
        response = supabase_client.client.table('employees').delete().in_('id', data.ids).execute()
        
        for email in emails_to_ban:
            await supabase_client.delete_or_suspend_auth_user(email)
            
        return {"status": "success", "count": len(response.data) if response.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk delete failed: {str(e)}")
@router.post("/employees/direct")
async def create_employee_direct(data: dict, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table('employees').insert([data]).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct create failed: {str(e)}")

@router.put("/employees/direct/{employee_id}")
async def update_employee_direct(employee_id: str, data: dict, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table('employees').update(data).eq('id', employee_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct update failed: {str(e)}")

@router.post("/employees/bulk-insert")
async def bulk_insert_employees(data: list, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table('employees').insert(data).execute()
        return {"status": "success", "count": len(response.data) if response.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk insert failed: {str(e)}")
