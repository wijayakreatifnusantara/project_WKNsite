"""
Bulk Sync API for WKNsite
Combines all spreadsheet data into one response for frontend compatibility
"""

from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase_client

router = APIRouter()

@router.get("/sync/all")
async def sync_all():
    """Get all data at once using stable Batch API and caching"""
    try:
        # Use the optimized Supabase fetcher
        all_data = await supabase_client.get_all_data()
        
        if not all_data:
            raise Exception("No data returned from batch sync")

        return {
            "status": "success",
            "employees": all_data.get("employee", []),
            "admins": all_data.get("admin", []),
            "attendance": all_data.get("attendance", []),
            "mutations": all_data.get("mutation", []),
            "logs": all_data.get("logs", []),
            "roles": all_data.get("roles", [])
        }
    except Exception as e:
        print(f"Sync API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sync error: {str(e)}")
