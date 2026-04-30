from pydantic import BaseModel
from typing import Optional

class EmployeeBase(BaseModel):
    nik: str
    nama: str
    email: Optional[str] = None
    posisi: Optional[str] = None
    departemen: Optional[str] = None
    gaji_pokok: float
    tanggal_masuk: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    is_active: int = 1
    deleted_at: Optional[str] = None

    class Config:
        from_attributes = True
