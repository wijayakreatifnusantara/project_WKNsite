from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from utils.jwt_handler import require_admin
from typing import List

router = APIRouter()

@router.get("/rbac/permissions/{role_name}")
async def get_role_permissions(role_name: str, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("role_permissions").select("permission_name").eq("role_name", role_name).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rbac/permissions/{role_name}")
async def update_role_permissions(role_name: str, data: dict, current_user: dict = Depends(require_admin)):
    try:
        permissions = data.get("permissions", [])
        
        # 1. Delete all current permissions for this role
        supabase_client.client.table("role_permissions").delete().eq("role_name", role_name).execute()
        
        # 2. Insert new set of permissions
        if permissions:
            insert_data = [{"role_name": role_name, "permission_name": p} for p in permissions]
            res = supabase_client.client.table("role_permissions").insert(insert_data).execute()
        
        return {"status": "success", "message": f"Permissions for {role_name} updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rbac/audit-logs")
async def get_audit_logs(target_user_id: str = None, current_user: dict = Depends(require_admin)):
    """Fetch system audit logs for AuditTrail"""
    try:
        # We query audit_logs and join profiles for the full_name
        query = supabase_client.client.table("audit_logs").select("*, profiles(full_name)")
        if target_user_id:
            query = query.eq("target_user_id", target_user_id)
        
        res = query.order("created_at", desc=True).limit(200).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
