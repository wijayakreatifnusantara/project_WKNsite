from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase_client
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter()

@router.get("/assets")
async def list_assets(status: str = None, category: str = None):
    """Fetch all assets with optional filters"""
    try:
        query = supabase_client.client.table("assets").select("*")
        if status:
            query = query.eq("status", status)
        if category:
            query = query.eq("category", category)
            
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assets/{asset_id}/history")
async def get_asset_history(asset_id: str):
    """Fetch assignment history for a specific asset"""
    try:
        res = supabase_client.client.table("asset_assignments").select("*, employees(name)").eq("asset_id", asset_id).order("assigned_date", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assets")
async def create_asset(payload: Dict[str, Any]):
    """Add a new asset to inventory"""
    try:
        res = supabase_client.client.table("assets").insert(payload).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assets/assign")
async def assign_asset(payload: Dict[str, Any]):
    """Assign an asset to an employee"""
    try:
        asset_id = payload.get("asset_id")
        employee_id = payload.get("employee_id")
        
        # 1. Update Asset Status
        supabase_client.client.table("assets").update({
            "status": "Assigned",
            "current_holder_id": employee_id
        }).eq("id", asset_id).execute()
        
        # 2. Log Assignment
        assignment = {
            "asset_id": asset_id,
            "employee_id": employee_id,
            "assigned_date": datetime.now().isoformat(),
            "initial_condition": payload.get("condition", "Good")
        }
        res = supabase_client.client.table("asset_assignments").insert(assignment).execute()
        
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assets/return")
async def return_asset(payload: Dict[str, Any]):
    """Return an asset to inventory"""
    try:
        asset_id = payload.get("asset_id")
        
        # 1. Update Asset Status
        supabase_client.client.table("assets").update({
            "status": "Available",
            "current_holder_id": None
        }).eq("id", asset_id).execute()
        
        # 2. Update Assignment Log
        # Find the latest open assignment
        assign_res = supabase_client.client.table("asset_assignments").select("id").eq("asset_id", asset_id).is_("return_date", "null").order("assigned_date", desc=True).limit(1).execute()
        
        if assign_res.data:
            assignment_id = assign_res.data[0]["id"]
            supabase_client.client.table("asset_assignments").update({
                "return_date": datetime.now().isoformat(),
                "return_condition": payload.get("condition", "Good")
            }).eq("id", assignment_id).execute()
            
        return {"status": "success", "message": "Asset returned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
