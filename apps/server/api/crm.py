from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from utils.jwt_handler import require_admin

router = APIRouter()

@router.get("/crm/clients")
async def get_clients(current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("clients").select("*").order("name").execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/crm/quotations")
async def create_quotation(data: dict, current_user: dict = Depends(require_admin)):
    try:
        quotation_data = data.get("quotation")
        items_data = data.get("items", [])
        
        # 1. Insert Quotation
        res = supabase_client.client.table("quotations").insert([quotation_data]).select().execute()
        if not res.data:
            raise Exception("Failed to insert quotation")
        
        quote = res.data[0]
        
        # 2. Insert Items
        if items_data:
            formatted_items = []
            for item in items_data:
                item["quotation_id"] = quote["id"]
                formatted_items.append(item)
            supabase_client.client.table("quotation_items").insert(formatted_items).execute()
            
        return {"status": "success", "data": quote}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
