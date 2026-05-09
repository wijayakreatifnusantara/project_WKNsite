from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase_client
from utils.burnout_engine import burnout_engine
from typing import List, Dict, Any, Optional
from datetime import datetime


router = APIRouter()

@router.get("/performance/metrics")
async def list_metrics():
    """Fetch all active KPI metrics"""
    try:
        res = supabase_client.client.table("kpi_metrics").select("*").eq("is_active", True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance/reviews")
async def list_reviews(employee_id: str = None, period: str = None):
    """List performance reviews with filtering"""
    try:
        query = supabase_client.client.table("performance_reviews").select("*, employees(name)")
        if employee_id:
            query = query.eq("employee_id", employee_id)
        if period:
            query = query.eq("period", period)
            
        res = query.order("created_at", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/performance/reviews")
async def submit_review(payload: Dict[str, Any]):
    """Submit a new performance review and calculate total score"""
    try:
        # 1. Fetch metrics to get weights
        metrics_res = supabase_client.client.table("kpi_metrics").select("id, weight").execute()
        weights = {m["id"]: float(m["weight"]) for m in metrics_res.data}
        
        # 2. Calculate Weighted Total Score
        scores = payload.get("scores", {})
        total_score = 0.0
        for kpi_id, score in scores.items():
            weight = weights.get(kpi_id, 0.0)
            total_score += float(score) * weight
            
        # 3. Save Review
        review_data = {
            "employee_id": payload.get("employee_id"),
            "reviewer_id": payload.get("reviewer_id"),
            "period": payload.get("period"),
            "scores": scores,
            "total_score": round(total_score, 2),
            "feedback": payload.get("feedback"),
            "status": "Submitted",
            "created_at": datetime.now().isoformat()
        }
        
        res = supabase_client.client.table("performance_reviews").insert(review_data).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance/burnout-risk/{employee_id}")
async def get_burnout_risk(employee_id: str):
    """Analyze burnout risk for a specific employee"""
    try:
        risk_data = await burnout_engine.analyze_risk(employee_id)
        return {"status": "success", "data": risk_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

