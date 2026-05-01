import os
from typing import List, Dict, Any, Optional
from supabase import create_client, Client

class WKNSupebaseClient:
    """Official Supabase client for WKNsite operations - Direct replacement for Sheets"""
    
    def __init__(self):
        # Menggunakan kredensial yang Anda berikan
        self.url = "https://vlpaszzbebgrfppklqml.supabase.co"
        self.key = "sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i"
        
        try:
            self.client: Client = create_client(self.url, self.key)
            print("Successfully connected to Supabase Database (WKN-System)")
        except Exception as e:
            print(f"CRITICAL: Failed to connect to Supabase: {str(e)}")
            self.client = None

    async def get_employees(self) -> List[Dict[str, Any]]:
        """Get all employees with frontend compatibility mapping"""
        if not self.client: return []
        try:
            response = self.client.table("employees").select("*").execute()
            data = response.data
            
            # Mapping back to Sheets format for frontend compatibility
            compat_data = []
            for e in data:
                compat_data.append({
                    "EMPLOYEE ID": e.get("id"),
                    "EMPLOYEE NAME": e.get("name"),
                    "EMAIL": e.get("email"),
                    "PHONE NUMBER": e.get("phone_number"),
                    "WHATSAPP NUMBER": e.get("whatsapp_number"),
                    "Job Position *": e.get("job_position"),
                    "Organization Name *": e.get("organization_name"),
                    "Status *": e.get("status"),
                    "Gaji Pokok *": str(e.get("base_salary", 0)),
                    "JOIN DATE": e.get("join_date"),
                    "Contract End Date": e.get("contract_end_date")
                })
            return compat_data
        except Exception as e:
            print(f"Error fetching employees: {str(e)}")
            return []

    async def get_admins(self) -> List[Dict[str, Any]]:
        """Get all admin accounts with compatibility mapping"""
        if not self.client: return []
        try:
            response = self.client.table("admin_accounts").select("*").execute()
            data = response.data
            
            # Mapping to match legacy Sheets column names
            compat_data = []
            for a in data:
                compat_data.append({
                    "Username": a.get("username"),
                    "Password": a.get("password"),
                    "Full Name": a.get("full_name"),
                    "Role": a.get("role"),
                    "Status": a.get("status")
                })
            return compat_data
        except Exception as e:
            print(f"Error fetching admins: {str(e)}")
            return []

    async def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user against Supabase admin_accounts table"""
        if not self.client: return None
        try:
            # Note: Dalam produksi, gunakan hashing password!
            response = self.client.table("admin_accounts") \
                .select("*") \
                .eq("username", username.lower().strip()) \
                .eq("password", password.strip()) \
                .execute()
            
            if response.data and len(response.data) > 0:
                user = response.data[0]
                # Return with legacy keys for frontend compatibility
                return {
                    "Username": user.get("username"),
                    "Password": user.get("password"),
                    "Full Name": user.get("full_name"),
                    "Role": user.get("role"),
                    "Status": user.get("status")
                }
            return None
        except Exception as e:
            print(f"Auth error: {str(e)}")
            return None

    async def add_employee(self, employee_data: Dict[str, Any]) -> bool:
        """Add new employee to Supabase"""
        if not self.client: return False
        try:
            # Map back to Supabase snake_case columns
            db_data = {
                "id": employee_data.get("EMPLOYEE ID"),
                "name": employee_data.get("EMPLOYEE NAME"),
                "email": employee_data.get("EMAIL"),
                "phone_number": employee_data.get("PHONE NUMBER"),
                "whatsapp_number": employee_data.get("WHATSAPP NUMBER"),
                "job_position": employee_data.get("Job Position *"),
                "organization_name": employee_data.get("Organization Name *"),
                "status": employee_data.get("Status *", "Active"),
                "base_salary": float(str(employee_data.get("Gaji Pokok *", 0)).replace(",", "")) if employee_data.get("Gaji Pokok *") else 0,
                "join_date": employee_data.get("JOIN DATE"),
                "contract_end_date": employee_data.get("Contract End Date")
            }
            self.client.table("employees").insert(db_data).execute()
            return True
        except Exception as e:
            print(f"Error adding employee: {str(e)}")
            return False

    async def update_employee(self, employee_id: str, employee_data: Dict[str, Any]) -> bool:
        """Update existing employee in Supabase"""
        if not self.client: return False
        try:
            db_data = {
                "name": employee_data.get("EMPLOYEE NAME"),
                "email": employee_data.get("EMAIL"),
                "phone_number": employee_data.get("PHONE NUMBER"),
                "job_position": employee_data.get("Job Position *"),
                "organization_name": employee_data.get("Organization Name *"),
                "status": employee_data.get("Status *"),
                "base_salary": float(str(employee_data.get("Gaji Pokok *", 0)).replace(",", "")) if employee_data.get("Gaji Pokok *") else 0,
                "contract_end_date": employee_data.get("Contract End Date")
            }
            self.client.table("employees").update(db_data).eq("id", employee_id).execute()
            return True
        except Exception as e:
            print(f"Error updating employee: {str(e)}")
            return False

    async def delete_employee(self, employee_id: str) -> bool:
        """Soft delete employee by setting status to Inactive"""
        if not self.client: return False
        try:
            self.client.table("employees").update({"status": "Inactive"}).eq("id", employee_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting employee: {str(e)}")
            return False

    async def add_attendance(self, attendance_data: Dict[str, Any]) -> bool:
        """Insert attendance record into Supabase"""
        if not self.client: return False
        try:
            self.client.table("attendance").insert(attendance_data).execute()
            return True
        except Exception as e:
            print(f"Error adding attendance: {str(e)}")
            return False

    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Calculate dashboard statistics from Supabase"""
        if not self.client: return {}
        try:
            employees = await self.get_employees()
            total = len(employees)
            active = len([e for e in employees if e.get("Status *") == "Active"])
            
            # Count departments
            depts = set([e.get("Organization Name *") for e in employees if e.get("Organization Name *")])
            
            return {
                "total_employees": total,
                "active_employees": active,
                "total_departments": len(depts),
                "last_update": "Just now"
            }
        except Exception as e:
            print(f"Error calculating stats: {str(e)}")
            return {}

    async def get_attendance(self) -> List[Dict[str, Any]]:
        """Get attendance records"""
        if not self.client: return []
        try:
            res = self.client.table("attendance").select("*").execute()
            return res.data
        except Exception as e:
            print(f"Error fetching attendance: {str(e)}")
            return []

    async def get_all_data(self) -> Dict[str, Any]:
        """Fetch all tables at once for dashboard sync"""
        if not self.client: return {}
        try:
            # Individual calls in Supabase are very fast
            employees = await self.get_employees()
            admins = await self.get_admins()
            
            # Attendance
            att_res = self.client.table("attendance").select("*").execute()
            attendance = att_res.data
            
            # Add placeholders for other tables if not migrated yet
            return {
                "employee": employees,
                "admin": admins,
                "attendance": attendance,
                "mutation": [],
                "logs": [],
                "roles": []
            }
        except Exception as e:
            print(f"Error in get_all_data: {str(e)}")
            return {}

# Singleton instance
supabase_client = WKNSupebaseClient()
