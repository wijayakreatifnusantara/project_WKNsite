from fastapi import APIRouter, HTTPException, Depends
from models.employee import EmployeeCreate, Employee
from utils.supabase_client import supabase_client
from utils.ai_error_handler import ai_error_handler
from typing import Optional, List, Dict, Any

router = APIRouter()

@router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate):
    try:
        # Map Pydantic model to Spreadsheet Headers
        employee_dict = employee.dict()
        header_map = {
            "employee_id": "EMPLOYEE ID",
            "employee_name": "EMPLOYEE NAME",
            "email": "EMAIL",
            "phone_number": "PHONE NUMBER",
            "whatsapp_number": "WHATSAPP NUMBER",
            "gender": "GENDER",
            "date_of_birth": "DATE OF BIRTH",
            "marital_status": "MARITAL STATUS",
            "national_id_nik": "NATIONAL ID (NIK)",
            "address": "ADDRESS",
            "emergency_contact_1_name": "Emergency Contact 1 (Name)",
            "emergency_contact_1_relationship": "Emergency Contact 1 (Relationship)",
            "emergency_contact_1_phone": "Emergency Contact 1 (Phone)",
            "emergency_contact_2_name": "Emergency Contact 2 (Name)",
            "emergency_contact_2_relationship": "Emergency Contact 2 (Relationship)",
            "emergency_contact_2_phone": "Emergency Contact 2 (Phone)",
            "organization_name": "Organization Name *",
            "job_position": "Job Position *",
            "job_level": "Job Level *",
            "status": "Status *",
            "gaji_pokok": "Gaji Pokok *",
            "position_allowance": "Position Allowance",
            "communication_allowance": "Communication Allowance",
            "meal_allowance": "Meal Allowance",
            "transport_allowance": "Transport Allowance",
            "join_date": "JOIN DATE",
            "ptkp_status": "PTKP Status",
            "bpjs_ketenagakerjaan": "BPJS Ketenagakerjaan",
            "bpjs_kesehatan": "BPJS Kesehatan",
            "npwp": "NPWP",
            "bank_name": "Bank Name",
            "bank_account": "Bank Account",
            "bank_account_holder": "Bank Account Holder",
            "ktp_document_link": "KTP Document (Link)",
            "npwp_document_link": "NPWP Document (Link)",
            "kk_document_link": "KK Document (Link)",
            "contract_document_link": "Contract Document (Link)",
            "cv_document_link": "CV Document (Link)",
            "bank_book_document_link": "Bank Book Document (Link)",
            "sim_a_document_link": "SIM A Document (Link)",
            "sim_c_document_link": "SIM C Document (Link)",
            "contract_end_date": "Contract End Date",
            "resign_date": "Resign Date",
            "profile_photo_base64": "Profile Photo (Base64)"
        }
        
        spreadsheet_data = {header_map[k]: v for k, v in employee_dict.items() if k in header_map}
        
        success = await supabase_client.add_employee(spreadsheet_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add employee to Spreadsheet")
        
        return Employee(**employee_dict, id=0)
        
    except Exception as e:
        # AI Error Handling
        context = {
            "operation": "create_employee",
            "employee_id": employee.employee_id,
            "system": {
                "endpoint": "/employees",
                "method": "POST"
            }
        }
        
        ai_result = await ai_error_handler.handle_error(e, context)
        
        if ai_result["auto_recovered"]:
            return await create_employee(employee)
        
        raise HTTPException(
            status_code=400, 
            detail={
                "error": ai_result["user_message"],
                "error_id": ai_result["error_id"]
            }
        )

@router.get("/employees")
async def get_employees(q: Optional[str] = None):
    try:
        if q:
            # Search logic can be improved later with Supabase ilike
            employees = await supabase_client.get_employees()
            employees = [e for e in employees if q.lower() in e["EMPLOYEE NAME"].lower()]
        else:
            employees = await supabase_client.get_employees()
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employees: {str(e)}")

@router.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, employee: EmployeeCreate):
    try:
        employee_dict = employee.dict()
        header_map = {
            "employee_id": "EMPLOYEE ID",
            "employee_name": "EMPLOYEE NAME",
            "email": "EMAIL",
            "phone_number": "PHONE NUMBER",
            "whatsapp_number": "WHATSAPP NUMBER",
            "gender": "GENDER",
            "date_of_birth": "DATE OF BIRTH",
            "marital_status": "MARITAL STATUS",
            "national_id_nik": "NATIONAL ID (NIK)",
            "address": "ADDRESS",
            "emergency_contact_1_name": "Emergency Contact 1 (Name)",
            "emergency_contact_1_relationship": "Emergency Contact 1 (Relationship)",
            "emergency_contact_1_phone": "Emergency Contact 1 (Phone)",
            "emergency_contact_2_name": "Emergency Contact 2 (Name)",
            "emergency_contact_2_relationship": "Emergency Contact 2 (Relationship)",
            "emergency_contact_2_phone": "Emergency Contact 2 (Phone)",
            "organization_name": "Organization Name *",
            "job_position": "Job Position *",
            "job_level": "Job Level *",
            "status": "Status *",
            "gaji_pokok": "Gaji Pokok *",
            "position_allowance": "Position Allowance",
            "communication_allowance": "Communication Allowance",
            "meal_allowance": "Meal Allowance",
            "transport_allowance": "Transport Allowance",
            "join_date": "JOIN DATE",
            "ptkp_status": "PTKP Status",
            "bpjs_ketenagakerjaan": "BPJS Ketenagakerjaan",
            "bpjs_kesehatan": "BPJS Kesehatan",
            "npwp": "NPWP",
            "bank_name": "Bank Name",
            "bank_account": "Bank Account",
            "bank_account_holder": "Bank Account Holder",
            "ktp_document_link": "KTP Document (Link)",
            "npwp_document_link": "NPWP Document (Link)",
            "kk_document_link": "KK Document (Link)",
            "contract_document_link": "Contract Document (Link)",
            "cv_document_link": "CV Document (Link)",
            "bank_book_document_link": "Bank Book Document (Link)",
            "sim_a_document_link": "SIM A Document (Link)",
            "sim_c_document_link": "SIM C Document (Link)",
            "contract_end_date": "Contract End Date",
            "resign_date": "Resign Date",
            "profile_photo_base64": "Profile Photo (Base64)"
        }
        
        spreadsheet_data = {header_map[k]: v for k, v in employee_dict.items() if k in header_map}
        
        success = await supabase_client.update_employee(employee_id, spreadsheet_data)
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        return Employee(**employee_dict, id=0)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating employee: {str(e)}")

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    try:
        success = await supabase_client.delete_employee(employee_id)
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        return {"status": "success", "message": "Employee soft-deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting employee: {str(e)}")
