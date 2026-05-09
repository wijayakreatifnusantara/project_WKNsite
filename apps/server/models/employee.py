from pydantic import BaseModel
from typing import Optional

class EmployeeBase(BaseModel):
    # Core Identity (A-C)
    employee_id: str
    employee_name: str
    email: Optional[str] = None
    
    # Personal Info (D-H)
    phone_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    marital_status: Optional[str] = None
    
    # IDs & Address (I-J)
    national_id_nik: Optional[str] = None
    address: Optional[str] = None
    
    # Emergency Contacts (K-P)
    emergency_contact_1_name: Optional[str] = None
    emergency_contact_1_relationship: Optional[str] = None
    emergency_contact_1_phone: Optional[str] = None
    emergency_contact_2_name: Optional[str] = None
    emergency_contact_2_relationship: Optional[str] = None
    emergency_contact_2_phone: Optional[str] = None
    
    # Employment (Q-T)
    organization_name: str
    job_position: str
    job_level: str
    status: str = "Active"
    
    # Financial & Banking (U-Y)
    gaji_pokok: float = 0
    position_allowance: float = 0
    communication_allowance: float = 0
    meal_allowance: float = 0
    transport_allowance: float = 0
    
    # Professional Banking Details
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_account_holder: Optional[str] = None
    bank_branch: Optional[str] = None
    payroll_method: Optional[str] = "Bank Transfer"
    
    # Tax & Government (Z-AG)
    join_date: Optional[str] = None
    ptkp_status: Optional[str] = None
    bpjs_ketenagakerjaan: Optional[str] = None
    bpjs_kesehatan: Optional[str] = None
    npwp: Optional[str] = None
    npwp_16_digit: Optional[str] = None
    tax_method: Optional[str] = "Gross"
    kpp_name: Optional[str] = None
    faskes_tk1: Optional[str] = None
    
    # Detailed Employment
    employment_type: Optional[str] = "Permanent"
    probation_end_date: Optional[str] = None
    working_location: Optional[str] = "Head Office"
    overtime_eligible: bool = True
    
    # Documents (AH-AO)
    ktp_document_link: Optional[str] = None
    npwp_document_link: Optional[str] = None
    kk_document_link: Optional[str] = None
    contract_document_link: Optional[str] = None
    cv_document_link: Optional[str] = None
    bank_book_document_link: Optional[str] = None
    sim_a_document_link: Optional[str] = None
    sim_c_document_link: Optional[str] = None
    
    # Status & Media (AP-AR)
    contract_end_date: Optional[str] = None
    resign_date: Optional[str] = None
    profile_photo_base64: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int = 0
    is_active: int = 1
    deleted_at: Optional[str] = None

    class Config:
        from_attributes = True

