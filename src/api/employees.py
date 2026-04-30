from fastapi import APIRouter, HTTPException, Depends
from src.models.employee import EmployeeCreate, Employee
from src.utils.db import get_db_connection
import sqlite3
from typing import Optional

router = APIRouter()

@router.post("/employees", response_model=Employee)
def create_employee(employee: EmployeeCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO employees (nik, nama, email, posisi, departemen, gaji_pokok, tanggal_masuk)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (employee.nik, employee.nama, employee.email, employee.posisi, 
              employee.departemen, employee.gaji_pokok, employee.tanggal_masuk))
        
        employee_id = cursor.lastrowid
        conn.commit()
        
        # Fetch the created employee
        cursor.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
        row = cursor.fetchone()
        return dict(row)
        
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="NIK already exists")
    finally:
        conn.close()

@router.get("/employees")
def get_employees(q: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if q:
        cursor.execute('''
        SELECT * FROM employees 
        WHERE is_active = 1 AND (nama LIKE ? OR nik LIKE ?)
        ''', (f'%{q}%', f'%{q}%'))
    else:
        cursor.execute('SELECT * FROM employees WHERE is_active = 1')
        
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.put("/employees/{id}", response_model=Employee)
def update_employee(id: int, employee: EmployeeCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        UPDATE employees 
        SET nama = ?, email = ?, posisi = ?, departemen = ?, gaji_pokok = ?, tanggal_masuk = ?
        WHERE id = ? AND is_active = 1
        ''', (employee.nama, employee.email, employee.posisi, 
              employee.departemen, employee.gaji_pokok, employee.tanggal_masuk, id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        conn.commit()
        
        # Fetch the updated employee
        cursor.execute('SELECT * FROM employees WHERE id = ?', (id,))
        row = cursor.fetchone()
        return dict(row)
        
    finally:
        conn.close()

@router.delete("/employees/{id}")
def delete_employee(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    import datetime
    now = datetime.datetime.now().isoformat()
    
    try:
        cursor.execute('''
        UPDATE employees 
        SET is_active = 0, deleted_at = ?
        WHERE id = ?
        ''', (now, id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        conn.commit()
        return {"status": "success", "message": "Employee soft-deleted"}
        
    finally:
        conn.close()
