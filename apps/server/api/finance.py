from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from utils.jwt_handler import get_current_user
from utils.supabase_client import supabase_client

router = APIRouter()

class ExpenseItem(BaseModel):
    title: str
    category: str
    amount: float
    date: str
    status: str = "Pending"

class InvoiceItem(BaseModel):
    description: str
    qty: int
    rate: float
    tax: float

class Invoice(BaseModel):
    client: str
    dueDate: str
    invoiceNo: str
    status: str = "Unpaid"
    items: List[InvoiceItem]

@router.get("/finance/expenses")
async def get_expenses(current_user: dict = Depends(get_current_user)):
    try:
        response = await supabase_client.client.table("finance_expenses").select("*").execute()
        return response.data
    except Exception as e:
        # Fallback empty list if table doesn't exist yet
        return []

@router.post("/finance/expenses")
async def create_expense(payload: ExpenseItem, current_user: dict = Depends(get_current_user)):
    try:
        data = payload.dict()
        data["user_id"] = current_user.get("id", "system")
        response = await supabase_client.client.table("finance_expenses").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/finance/invoices")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    try:
        response = await supabase_client.client.table("finance_invoices").select("*").execute()
        return response.data
    except Exception as e:
        return []

@router.post("/finance/invoices")
async def create_invoice(payload: Invoice, current_user: dict = Depends(get_current_user)):
    try:
        data = payload.dict()
        response = await supabase_client.client.table("finance_invoices").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
