from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from utils.supabase_client import supabase_client
from utils.payroll_calc import calculate_payroll

router = APIRouter()

@router.get("/payroll/calculate")
async def simulate_payroll(period: str):
    """
    Simulate payroll for all active employees for a given period with Attendance Integration
    """
    try:
        # Fetch all active employees
        response = supabase_client.client.table("employees").select("*").eq("status", "Active").execute()
        employees = response.data
        
        # Fetch attendance summary for the period
        attendance_summary = await supabase_client.get_attendance_for_payroll(period)
        
        results = []
        total_net = 0
        total_tax = 0
        
        for emp in employees:
            # Get specific attendance for this employee
            emp_attendance = attendance_summary.get(emp.get("employee_id") or str(emp.get("id")))
            
            calc = calculate_payroll(emp, emp_attendance)
            calc["employee_name"] = emp.get("name")
            calc["employee_id"] = emp.get("employee_id") or emp.get("id")
            calc["period"] = period
            results.append(calc)
            
            total_net += calc["net_salary"]
            total_tax += calc["tax_deduction"]
            
        return {
            "status": "success",
            "period": period,
            "data": results,
            "summary": {
                "total_employees": len(results),
                "total_net_disbursement": total_net,
                "total_tax_withheld": total_tax
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payroll/history")
async def get_payroll_history(period: str = None):
    """
    Fetch historical payroll records
    """
    try:
        query = supabase_client.client.table("payroll_history").select("*, employees(name)")
        if period:
            query = query.eq("period", period)
        
        response = query.execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        # Fallback if table doesn't exist yet
        return {"status": "error", "message": "Payroll history table not found or error: " + str(e), "data": []}

@router.post("/payroll/finalize")
async def finalize_payroll(period: str, payroll_data: List[Dict[str, Any]]):
    """
    Save calculated payroll to history
    """
    try:
        # Prepare data for bulk insert
        db_records = []
        for item in payroll_data:
            db_records.append({
                "employee_id": str(item["employee_id"]),
                "period": period,
                "base_salary": item["base_salary"],
                "allowances_total": item["allowances_total"],
                "gross_salary": item["gross_salary"],
                "tax_deduction": item["tax_deduction"],
                "bpjs_health_deduction": item["bpjs_health_employee"],
                "bpjs_employment_deduction": item["bpjs_employment_employee"],
                "net_salary": item["net_salary"],
                "status": "Paid",
                "meta_data": item
            })
        
        supabase_client.client.table("payroll_history").insert(db_records).execute()
        return {"status": "success", "message": f"Payroll for {period} finalized"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
