from typing import Dict, Any, Optional

def get_ptkp_category(ptkp_status: str) -> str:
    """
    Map PTKP status to TER Category (A, B, C)
    - Category A: TK/0, TK/1, K/0
    - Category B: TK/2, TK/3, K/1, K/2
    - Category C: K/3
    """
    if not ptkp_status:
        return "A"
    
    status = ptkp_status.upper().replace(" ", "")
    if status in ["TK/0", "TK/1", "K/0"]:
        return "A"
    elif status in ["TK/2", "TK/3", "K/1", "K/2"]:
        return "B"
    elif status in ["K/3"]:
        return "C"
    return "A"

def get_ter_rate(category: str, gross_salary: float) -> float:
    """
    Simplified TER Rate mapping based on 2024 tables.
    In a real production app, this should be a full lookup table.
    """
    # Sample logic for Category A (TK/0, TK/1, K/0)
    if category == "A":
        if gross_salary <= 5400000: return 0.0
        if gross_salary <= 5650000: return 0.0025
        if gross_salary <= 5950000: return 0.005
        if gross_salary <= 6300000: return 0.0075
        if gross_salary <= 6750000: return 0.01
        if gross_salary <= 7500000: return 0.0125
        if gross_salary <= 8550000: return 0.015
        if gross_salary <= 9650000: return 0.0175
        if gross_salary <= 10000000: return 0.02
        if gross_salary <= 11000000: return 0.025
        if gross_salary <= 12500000: return 0.03
        if gross_salary <= 15000000: return 0.05
        return 0.07 # Default cap for sample
    
    # Sample logic for Category B
    if category == "B":
        if gross_salary <= 6200000: return 0.0
        if gross_salary <= 6500000: return 0.0025
        if gross_salary <= 10000000: return 0.02
        return 0.05
    
    # Sample logic for Category C
    if category == "C":
        if gross_salary <= 6600000: return 0.0
        if gross_salary <= 7000000: return 0.0025
        if gross_salary <= 10000000: return 0.02
        return 0.05
        
    return 0.0

def calculate_bpjs(base_salary: float) -> Dict[str, float]:
    """
    Calculate BPJS Kesehatan and Ketenagakerjaan
    """
    # Max caps
    MAX_HEALTH_BASE = 12000000
    MAX_JP_BASE = 10042300 # 2024
    
    health_base = min(base_salary, MAX_HEALTH_BASE)
    jp_base = min(base_salary, MAX_JP_BASE)
    
    return {
        "health_employee": health_base * 0.01,
        "health_company": health_base * 0.04,
        "jht_employee": base_salary * 0.02,
        "jht_company": base_salary * 0.037,
        "jp_employee": jp_base * 0.01,
        "jp_company": jp_base * 0.02,
        "jkk_company": base_salary * 0.0024,
        "jkm_company": base_salary * 0.003
    }

def calculate_payroll(employee_data: Dict[str, Any], attendance_data: Dict[str, Any] = None, expected_working_days: int = 25) -> Dict[str, Any]:
    """
    Calculate comprehensive payroll including tax (TER) and BPJS
    """
    base = float(employee_data.get("base_salary", 0))
    # Add allowances
    allowances = [
        float(employee_data.get("position_allowance", 0)),
        float(employee_data.get("communication_allowance", 0)),
        float(employee_data.get("meal_allowance", 0)),
        float(employee_data.get("transport_allowance", 0))
    ]
    total_allowance = sum(allowances)
    gross = base + total_allowance
    
    # BPJS
    bpjs = calculate_bpjs(base)
    
    # Attendance Deductions
    late_deduction = 0
    absence_deduction = 0
    unpaid_leave_deduction = 0
    
    if attendance_data:
        # Example: 1000 IDR per minute late
        late_deduction = attendance_data.get("late_minutes", 0) * 1000
        # Example: Pro-rata daily deduction
        absence_deduction = (base / expected_working_days) * attendance_data.get("absences", 0)
        # Unpaid Leave deduction (assuming same pro-rata rule as absence)
        unpaid_leave_deduction = (base / expected_working_days) * attendance_data.get("unpaid_leaves", 0)
    
    # Tax (PPh 21 TER)

    ptkp = employee_data.get("ptkp_status", "TK/0")
    cat = get_ptkp_category(ptkp)
    rate = get_ter_rate(cat, gross)
    tax = gross * rate
    
    net = gross - tax - bpjs["health_employee"] - bpjs["jht_employee"] - bpjs["jp_employee"] - late_deduction - absence_deduction - unpaid_leave_deduction
    
    return {
        "base_salary": base,
        "allowances_total": total_allowance,
        "gross_salary": gross,
        "tax_deduction": tax,
        "late_deduction": late_deduction,
        "absence_deduction": absence_deduction,
        "unpaid_leave_deduction": unpaid_leave_deduction,
        "bpjs_health_employee": bpjs["health_employee"],
        "bpjs_employment_employee": bpjs["jht_employee"] + bpjs["jp_employee"],
        "net_salary": net,

        "tax_category": cat,
        "tax_rate": rate,
        "bpjs_breakdown": bpjs
    }

