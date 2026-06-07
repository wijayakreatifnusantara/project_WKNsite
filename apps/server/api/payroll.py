from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from utils.supabase_client import supabase_client
from utils.payroll_calc import calculate_payroll
from utils.jwt_handler import require_admin, get_current_user

router = APIRouter()


@router.get("/payroll/calculate")
async def simulate_payroll(period: str, current_user: dict = Depends(require_admin)):
    """
    Simulate payroll for all active employees for a given period with Attendance Integration (Admin only)
    """
    try:
        # Fetch all active employees
        response = supabase_client.client.table("employees").select("*").eq("status", "Active").execute()
        employees = response.data
        
        # Fetch attendance summary for the period
        attendance_summary = await supabase_client.get_attendance_for_payroll(period)
        expected_working_days = attendance_summary.pop("__expected_working_days__", 25)
        
        results = []
        total_net = 0
        total_tax = 0
        
        for emp in employees:
            # Get specific attendance for this employee
            emp_attendance = attendance_summary.get(emp.get("employee_id") or str(emp.get("id")))
            if not emp_attendance:
                emp_attendance = {
                    "late_minutes": 0,
                    "absences": expected_working_days,
                    "unpaid_leaves": 0
                }
            
            calc = calculate_payroll(emp, emp_attendance, expected_working_days)
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
async def get_payroll_history(period: str = None, current_user: dict = Depends(require_admin)):
    """
    Fetch historical payroll records (Admin only)
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
async def finalize_payroll(period: str, payroll_data: List[Dict[str, Any]], current_user: dict = Depends(require_admin)):
    """
    Save calculated payroll to history (Admin only)
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

@router.get("/payroll/templates/active")
async def get_active_template(current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("payslip_templates").select("*").eq("is_active", True).limit(1).execute()
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/payroll/templates")
async def create_template(data: dict, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("payslip_templates").insert(data).select().execute()
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payroll/templates/{template_id}")
async def update_template(template_id: int, data: dict, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("payslip_templates").update(data).eq("id", template_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payroll/salaries/{employee_id}")
async def get_employee_salary(employee_id: str, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("employee_salaries").select("*").eq("employee_id", employee_id).limit(1).execute()
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/payroll/salaries")
async def create_employee_salary(data: dict, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("employee_salaries").insert(data).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payroll/salaries/{salary_id}")
async def update_employee_salary(salary_id: int, data: dict, current_user: dict = Depends(require_admin)):
    try:
        res = supabase_client.client.table("employee_salaries").update(data).eq("id", salary_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payroll/my-salary")
async def get_my_salary(current_user: dict = Depends(get_current_user)):
    """Fetch employee's current salary details and active payslip template for mobile app"""
    try:
        employee_id = current_user.get("employee_id")
        
        # In mobile app it fetches from employee_salaries and payslip_templates
        salary_res = supabase_client.client.table("employee_salaries").select("*").eq("employee_id", employee_id).execute()
        salary_data = salary_res.data[0] if salary_res.data else None
        
        template_res = supabase_client.client.table("payslip_templates").select("*").eq("is_active", True).limit(1).execute()
        template_data = template_res.data[0] if template_res.data else None
        
        return {
            "status": "success", 
            "data": {
                "salary": salary_data, 
                "template": template_data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payroll/timesheets")
async def get_timesheets(filter_type: str = "all", current_user: dict = Depends(require_admin)):
    """Fetch timesheets"""
    try:
        query = supabase_client.client.table("timesheets").select("id, project_name, task_description, duration_hours, date, status, created_at, employees(name)").order("date", desc=True).order("created_at", desc=True)
        if filter_type == 'pending':
            query = query.eq('status', 'PENDING')
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payroll/timesheets/{timesheet_id}")
async def update_timesheet_status(timesheet_id: int, payload: dict, current_user: dict = Depends(require_admin)):
    """Update timesheet status"""
    try:
        status = payload.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="Missing status")
        res = supabase_client.client.table("timesheets").update({"status": status}).eq("id", timesheet_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
