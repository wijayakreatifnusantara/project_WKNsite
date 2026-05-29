from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from utils.supabase_client import supabase_client
from utils.jwt_handler import get_current_user

router = APIRouter()

@router.post("/submissions/reimburse")
async def submit_reimbursement(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        
        # Override employee_id to ensure they only submit for themselves
        payload["employee_id"] = employee_id
        payload["status"] = "Pending"
        
        res = supabase_client.client.table("reimbursements").insert(payload).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submissions/salary-correction")
async def submit_salary_correction(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        
        # Override employee_id
        payload["employee_id"] = employee_id
        payload["status"] = "Pending"
        
        res = supabase_client.client.table("salary_corrections").insert(payload).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submissions/timesheet")
async def submit_timesheet(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    try:
        employee_id = current_user.get("employee_id")
        
        # Override employee_id
        payload["employee_id"] = employee_id
        payload["status"] = "Pending"
        
        res = supabase_client.client.table("timesheets").insert(payload).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
