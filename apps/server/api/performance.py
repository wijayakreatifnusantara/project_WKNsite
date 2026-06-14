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

@router.post("/performance/metrics")
async def create_metric(payload: Dict[str, Any]):
    """Create a new KPI metric"""
    try:
        data = {
            "name": payload.get("name"),
            "description": payload.get("description", ""),
            "max_score": payload.get("max_score", 5),
            "weight": payload.get("weight", 0),
            "is_active": True,
        }
        res = supabase_client.client.table("kpi_metrics").insert(data).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/performance/metrics/{metric_id}")
async def update_metric(metric_id: int, payload: Dict[str, Any]):
    """Update an existing KPI metric"""
    try:
        data = {
            "name": payload.get("name"),
            "description": payload.get("description", ""),
            "max_score": payload.get("max_score", 5),
            "weight": payload.get("weight", 0),
        }
        res = supabase_client.client.table("kpi_metrics").update(data).eq("id", metric_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Metric not found")
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/performance/metrics/{metric_id}")
async def delete_metric(metric_id: int):
    """Soft delete a KPI metric"""
    try:
        res = supabase_client.client.table("kpi_metrics").update({"is_active": False}).eq("id", metric_id).execute()
        return {"status": "success", "message": "Metric deleted"}
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

@router.get("/performance/pending-reviews")
async def get_pending_reviews(period: str = None):
    """Get list of employees who haven't been reviewed in the current period (T020)"""
    try:
        # Default to current quarter if not specified
        if not period:
            from datetime import datetime
            current_month = datetime.now().month
            quarter = (current_month - 1) // 3 + 1
            period = f"{datetime.now().year}-Q{quarter}"
        
        # Get all active employees
        employees_res = supabase_client.client.table("employees").select("id, name, employee_id").eq("is_active", True).execute()
        all_employees = employees_res.data
        
        # Get reviews for the period
        reviews_res = supabase_client.client.table("performance_reviews").select("employee_id").eq("period", period).execute()
        reviewed_ids = set(r["employee_id"] for r in reviews_res.data)
        
        # Filter employees without reviews
        pending = [e for e in all_employees if e["id"] not in reviewed_ids and e["employee_id"] not in reviewed_ids]
        
        return {
            "status": "success", 
            "data": pending,
            "period": period,
            "total_pending": len(pending)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import json
import os

GAMIFICATION_FILE = os.path.join(os.path.dirname(__file__), "..", "gamification.json")

def load_bonus_points():
    if not os.path.exists(GAMIFICATION_FILE):
        return {}
    try:
        with open(GAMIFICATION_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_bonus_points(data):
    with open(GAMIFICATION_FILE, "w") as f:
        json.dump(data, f)

@router.get("/performance/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get gamification leaderboard based on on-time attendance and manual bonuses"""
    try:
        # Fetch attendance to calculate points dynamically
        att_res = supabase_client.client.table("attendance").select("employee_id, late_minutes, date").execute()
        
        bonus_points = load_bonus_points()
        points_map = {}
        for row in att_res.data:
            eid = row.get("employee_id")
            if not eid: continue
            if eid not in points_map:
                points_map[eid] = 0
            # +10 points for on-time check-in
            if row.get("late_minutes", 0) == 0:
                points_map[eid] += 10
                
        # Fetch active employees
        emp_res = supabase_client.client.table("employees").select("id, name, employee_id, profile_photo_base64, division_id").eq("is_active", True).execute()
        
        # Optional: fetch division names for better UI
        div_res = supabase_client.client.table("divisions").select("id, name").execute()
        div_map = {d["id"]: d["name"] for d in div_res.data} if div_res.data else {}
        
        leaderboard = []
        for emp in emp_res.data:
            base_pts = points_map.get(emp["id"], 0)
            if base_pts == 0 and emp.get("employee_id"):
                base_pts = points_map.get(emp["employee_id"], 0)
                
            bonus_pts = bonus_points.get(emp["id"], 0)
            if bonus_pts == 0 and emp.get("employee_id"):
                bonus_pts = bonus_points.get(emp["employee_id"], 0)
                
            total_pts = base_pts + bonus_pts
            div_name = div_map.get(emp.get("division_id"), "Staff")
                
            leaderboard.append({
                "id": emp["id"],
                "name": emp["name"],
                "department": div_name,
                "avatar_url": emp.get("profile_photo_base64"),
                "points": total_pts,
                "base_points": base_pts,
                "bonus_points": bonus_pts,
                "streak": base_pts // 10  # Simplified streak calculation for demo
            })
            
        # Sort descending by points
        leaderboard.sort(key=lambda x: x["points"], reverse=True)
        
        return {"status": "success", "data": leaderboard[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class BonusRequest(BaseModel):
    employee_id: str
    bonus: int

@router.post("/performance/gamification/bonus")
async def add_bonus_points(payload: BonusRequest):
    """Add manual bonus points to an employee"""
    try:
        bonus_data = load_bonus_points()
        current_bonus = bonus_data.get(payload.employee_id, 0)
        bonus_data[payload.employee_id] = current_bonus + payload.bonus
        save_bonus_points(bonus_data)
        
        return {"status": "success", "message": f"Added {payload.bonus} points to {payload.employee_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

