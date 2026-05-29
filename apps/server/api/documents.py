from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from utils.supabase_client import supabase_client
from utils.jwt_handler import get_current_user
from typing import List, Dict, Any, Optional
import os

router = APIRouter()

@router.get("/documents")
async def list_documents(category: str = None, employee_id: str = None):
    """List documents with optional filtering"""
    try:
        query = supabase_client.client.table("documents").select("*")
        if category:
            query = query.eq("category", category)
        if employee_id:
            query = query.eq("employee_id", employee_id)
            
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/my-documents")
async def list_my_documents(category: str = None, current_user: dict = Depends(get_current_user)):
    """List documents for the current employee"""
    try:
        employee_id = current_user.get("employee_id")
        query = supabase_client.client.table("documents").select("*").eq("employee_id", employee_id)
        if category:
            query = query.eq("category", category)
            
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    employee_id: Optional[str] = Form(None),
    is_private: bool = Form(False)
):
    """Upload a document to Supabase Storage and save metadata"""
    try:
        # 1. Read file content
        content = await file.read()
        filename = file.filename
        file_path = f"{category.lower()}/{filename}"
        
        # 2. Upload to Supabase Storage (assuming bucket 'documents' exists)
        # Note: We need to implement storage helper or use client directly
        storage_res = supabase_client.client.storage.from_("documents").upload(
            path=file_path,
            file=content,
            file_options={"content-type": file.content_type}
        )
        
        # 3. Save metadata to DB
        metadata = {
            "name": name,
            "description": description,
            "category": category,
            "file_url": file_path,
            "file_size": len(content),
            "file_type": file.content_type,
            "employee_id": employee_id,
            "is_private": is_private
        }
        
        res = supabase_client.client.table("documents").insert(metadata).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete document from storage and metadata"""
    try:
        # 1. Get metadata to find file path
        doc_res = supabase_client.client.table("documents").select("file_url").eq("id", doc_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path = doc_res.data[0]["file_url"]
        
        # 2. Delete from Storage
        supabase_client.client.storage.from_("documents").remove([file_path])
        
        # 3. Delete from DB
        supabase_client.client.table("documents").delete().eq("id", doc_id).execute()
        
        return {"status": "success", "message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
