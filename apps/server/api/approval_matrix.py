import json
import os
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from utils.jwt_handler import require_admin

router = APIRouter()

CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "approval_matrix.json")

def load_matrix():
    if not os.path.exists(CONFIG_PATH):
        return {
            "leave": {"enabled": False, "tiers": []},
            "overtime": {"enabled": False, "tiers": []}
        }
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def save_matrix(data: dict):
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f, indent=4)

@router.get("/settings/approval-matrix")
async def get_approval_matrix(current_user: dict = Depends(require_admin)):
    try:
        return load_matrix()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/approval-matrix")
async def update_approval_matrix(payload: Dict[str, Any], current_user: dict = Depends(require_admin)):
    try:
        save_matrix(payload)
        return {"status": "success", "message": "Approval matrix updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
