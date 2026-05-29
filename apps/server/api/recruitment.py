from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from utils.jwt_handler import require_admin

router = APIRouter()

@router.get("/recruitment/jobs")
async def get_jobs(current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("job_postings").select("id, title, department, status, created_at, job_applicants(id, status)").order("created_at", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recruitment/jobs")
async def create_job(data: dict, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("job_postings").insert([data]).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recruitment/public/jobs")
async def get_public_jobs():
    """Get active jobs for public career portal"""
    try:
        res = supabase_client.client.table("job_postings").select("*").eq("status", "Active").order("created_at", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recruitment/public/apply")
async def submit_application(data: dict):
    """Submit job application"""
    try:
        payload = {
            "job_id": data.get("job_id"),
            "name": data.get("name"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "resume_url": data.get("resume_url"),
            "status": "New"
        }
        res = supabase_client.client.table("job_applicants").insert([payload]).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
