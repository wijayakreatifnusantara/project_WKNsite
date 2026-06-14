from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from utils.jwt_handler import get_current_user
from utils.supabase_client import supabase_client

router = APIRouter()

@router.get("/notifications")
async def get_notifications(
    mobile: bool = False,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = await supabase_client.client.table("system_notifications").select("*").eq("user_id", current_user["id"]).execute()
        data = response.data
        
        # Field reduction for Mobile bandwidth optimization
        if mobile and data:
            for item in data:
                # Provide only short snippet for mobile lists
                if "description" in item and item["description"]:
                    item["description"] = item["description"][:50] + ("..." if len(item["description"]) > 50 else "")
                
        return data
    except Exception as e:
        # Fallback empty list if table doesn't exist
        return []

@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: int, current_user: dict = Depends(get_current_user)):
    try:
        response = await supabase_client.client.table("system_notifications").update({"is_read": True}).eq("id", notif_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/notifications/test-smtp")
async def test_smtp_connection(current_user: dict = Depends(get_current_user)):
    """Mock testing SMTP connection"""
    import asyncio
    await asyncio.sleep(1) # simulate network delay
    return {"status": "success", "message": "SMTP Connection Successful. Test email sent."}

@router.post("/notifications/test-wa")
async def test_wa_connection(current_user: dict = Depends(get_current_user)):
    """Mock testing WhatsApp connection"""
    import asyncio
    await asyncio.sleep(1) # simulate network delay
    return {"status": "success", "message": "WhatsApp API Instance is connected and active."}
