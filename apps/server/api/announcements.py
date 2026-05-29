from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from utils.jwt_handler import require_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class AnnouncementPayload(BaseModel):
    title: str
    body: str
    type: str
    targetType: str
    targetValue: Optional[str] = None

@router.post("/company/announcements")
async def create_announcement(payload: AnnouncementPayload, current_user: dict = Depends(require_admin)):
    try:
        # 1. Fetch target employees
        query = supabase_client.client.table("employees").select("id")
        
        if payload.targetType == 'DEPARTMENT':
            query = query.eq('department_id', payload.targetValue)
        elif payload.targetType == 'POSITION':
            query = query.eq('job_position', payload.targetValue)

        res = query.execute()
        employees = res.data
        
        if not employees:
            raise HTTPException(status_code=400, detail="Tidak ada karyawan yang cocok dengan kriteria tersebut")

        # 2. Prepare bulk insert
        notifications = []
        for emp in employees:
            notifications.append({
                "employee_id": emp["id"],
                "title": payload.title,
                "body": payload.body,
                "type": payload.type,
                "is_read": False
            })

        # 3. Insert into notifications
        insert_res = supabase_client.client.table("notifications").insert(notifications).execute()
        
        return {"status": "success", "message": f"Pengumuman berhasil dikirim ke {len(employees)} karyawan!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
