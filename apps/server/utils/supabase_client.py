import os
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Memuat environment variables dari file .env
load_dotenv()

class WKNSupabaseClient:
    """Official Supabase client for WKNsite operations - Direct replacement for Sheets"""
    
    def __init__(self):
        # Membaca kredensial dari environment variables
        self.url = os.getenv("SUPABASE_URL", "https://vlpaszzbebgrfppklqml.supabase.co")
        self.key = os.getenv("SUPABASE_KEY")
        if not self.key:
            print("WARNING: SUPABASE_KEY environment variable is missing.")
        
        try:
            self.client: Client = create_client(self.url, self.key)
            print("Successfully connected to Supabase Database (WKN-System)")
        except Exception as e:
            print(f"CRITICAL: Failed to connect to Supabase: {str(e)}")
            self.client = None
            
        # Optimization: Simple TTL Cache
        self._cache = {}
        self._cache_ttl = 60 # seconds

    async def get_employees(self, q: Optional[str] = None, page: int = 1, page_size: int = 50) -> Dict[str, Any]:
        """Get employees with pagination, server-side filtering and total count"""
        if not self.client: return {"data": [], "total": 0}
        
        # Check cache only for first page of non-filtered requests
        import time
        if not q and page == 1 and "employees_p1" in self._cache:
            cache_data, timestamp = self._cache["employees_p1"]
            if time.time() - timestamp < self._cache_ttl:
                return cache_data

        try:
            # Calculate range for pagination
            start = (page - 1) * page_size
            end = start + page_size - 1
            
            query = self.client.table("employees").select("*", count="exact")
            
            if q:
                # Optimized server-side filtering
                query = query.or_(f"name.ilike.%{q}%,id.ilike.%{q}%,email.ilike.%{q}%")
            
            response = query.order("name").range(start, end).execute()
            data = response.data
            total = response.count
            
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
                    "Division Name *": e.get("division_name"),
                    "Status *": e.get("status"),
                    "Gaji Pokok *": str(e.get("base_salary", 0)),
                    "JOIN DATE": e.get("join_date"),
                    "Contract End Date": e.get("contract_end_date"),
                    "Resign Date": e.get("resign_date"),
                    "is_resigned": e.get("is_resigned"),
                    "working_location": e.get("working_location"),
                    "Working Location": e.get("working_location"),
                    "is_field_team": e.get("is_field_team"),
                    "isFieldTeam": e.get("is_field_team")
                })
            
            result = {
                "data": compat_data,
                "total": total,
                "page": page,
                "page_size": page_size
            }
            
            # Update cache for first page of non-filtered requests
            if not q and page == 1:
                self._cache["employees_p1"] = (result, time.time())
                
            return result
        except Exception as e:
            print(f"Error fetching employees: {str(e)}")
            return {"data": [], "total": 0}

    async def get_admins(self) -> List[Dict[str, Any]]:
        """Get all admin accounts from profiles table"""
        if not self.client: return []
        try:
            response = self.client.table("profiles").select("*").execute()
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
        """Authenticate user against profiles table (with stdout console logging)"""
        if not self.client: return None
        try:
            from utils.security import verify_password
            clean_username = username.strip()
            clean_password = password.strip()
            
            print(f"[DEBUG] Login attempt at {clean_username}")

            # Mencari di tabel profiles (plural)
            response = self.client.table("profiles") \
                .select("*") \
                .ilike("username", clean_username) \
                .execute()
            
            if not response.data:
                print(f"[ERROR] User {clean_username} NOT FOUND in 'profiles' table.")
                return None
            
            user = response.data[0]
            if verify_password(clean_password, user.get("password")):
                print(f"[SUCCESS] Login OK for {clean_username}")
                
                # Fetch employee ID and is_field_team status
                employee_id = None
                is_field_team = False
                try:
                    emp_res = self.client.table("employees") \
                        .select("id, is_field_team") \
                        .eq("email", clean_username) \
                        .execute()
                    if emp_res.data:
                        employee_id = emp_res.data[0].get("id")
                        is_field_team = emp_res.data[0].get("is_field_team", False)
                except Exception as ex:
                    print(f"[WARN] Failed to fetch employee detail: {str(ex)}")

                return {
                    "Username": user.get("username"),
                    "Full Name": user.get("full_name"),
                    "Role": user.get("role"),
                    "Status": user.get("status"),
                    "employee_id": employee_id,
                    "is_field_team": is_field_team
                }
            else:
                print(f"[ERROR] Password mismatch for {clean_username}")
                return None
        except Exception as e:
            print(f"[CRITICAL] System Error: {str(e)}")
            return None

    async def authenticate_employee(self, email: str, hashed_password: str) -> Optional[Dict[str, Any]]:
        """Authenticate employee for mobile app"""
        if not self.client: return None
        try:
            clean_email = email.strip()
            
            res = self.client.table("employees") \
                .select("id, name, email, mobile_password, status, is_resigned, job_position, is_field_team, working_location") \
                .ilike("email", clean_email) \
                .execute()
                
            if not res.data:
                return None
                
            employee = res.data[0]
            if employee.get("is_resigned") or employee.get("status") == "RESIGNED":
                return None
                
            if employee.get("mobile_password") == hashed_password:
                # Remove password from return dict
                clean_employee = employee.copy()
                if "mobile_password" in clean_employee:
                    del clean_employee["mobile_password"]
                return clean_employee
                
            return None
        except Exception as e:
            print(f"Error authenticating employee: {str(e)}")
            return None

    async def update_employee_password(self, employee_id: str, new_hashed_password: str) -> bool:
        """Update employee password"""
        if not self.client: return False
        try:
            self.client.table("employees").update({"mobile_password": new_hashed_password}).eq("id", employee_id).execute()
            return True
        except Exception as e:
            print(f"Error updating employee password: {str(e)}")
            return False

    async def add_employee(self, employee_data: Dict[str, Any]) -> bool:
        """Add new employee to Supabase"""
        if not self.client: return False
        try:
            # Map back to Supabase snake_case columns
            db_data = {
                "id": employee_data.get("EMPLOYEE ID"),
                "name": employee_data.get("EMPLOYEE NAME"),
                "nickname": employee_data.get("NICKNAME"),
                "email": employee_data.get("EMAIL"),
                "phone_number": employee_data.get("PHONE NUMBER"),
                "whatsapp_number": employee_data.get("WHATSAPP NUMBER"),
                "gender": employee_data.get("GENDER"),
                "place_of_birth": employee_data.get("PLACE OF BIRTH"),
                "date_of_birth": employee_data.get("DATE OF BIRTH"),
                "religion": employee_data.get("RELIGION"),
                "marital_status": employee_data.get("MARITAL STATUS"),
                "residence_status": employee_data.get("RESIDENCE STATUS"),
                "blood_type": employee_data.get("BLOOD TYPE"),
                "height": employee_data.get("HEIGHT"),
                "weight": employee_data.get("WEIGHT"),
                "uniform_size": employee_data.get("UNIFORM SIZE"),
                "shoe_size": employee_data.get("SHOE SIZE"),
                "national_id_nik": employee_data.get("NATIONAL ID (NIK)"),
                "kk_number": employee_data.get("KK NUMBER"),
                "address": employee_data.get("ADDRESS"),
                "family_members": employee_data.get("FAMILY MEMBERS", []),
                "education_history": employee_data.get("EDUCATION HISTORY", []),
                "work_experience": employee_data.get("WORK EXPERIENCE", []),
                "certifications": employee_data.get("CERTIFICATIONS", []),
                "skills": employee_data.get("SKILLS"),
                "job_position": employee_data.get("Job Position *"),
                "division_name": employee_data.get("Division Name *"),
                "status": employee_data.get("Status *", "Active"),
                "base_salary": float(str(employee_data.get("Gaji Pokok *", 0)).replace(",", "")) if employee_data.get("Gaji Pokok *") else 0,
                "join_date": employee_data.get("JOIN DATE"),
                "contract_end_date": employee_data.get("Contract End Date"),
                "bank_branch": employee_data.get("Bank Branch"),
                "payroll_method": employee_data.get("Payroll Method"),
                "npwp_16_digit": employee_data.get("NPWP 16 Digit"),
                "tax_method": employee_data.get("Tax Method"),
                "kpp_name": employee_data.get("KPP Name"),
                "faskes_tk1": employee_data.get("Faskes TK1"),
                "employment_type": employee_data.get("Employment Type"),
                "probation_end_date": employee_data.get("Probation End Date"),
                "working_location": employee_data.get("Working Location"),
                "overtime_eligible": employee_data.get("Overtime Eligible"),
                "resign_date": employee_data.get("Resign Date"),
                "is_resigned": employee_data.get("is_resigned", False)
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
                "nickname": employee_data.get("NICKNAME"),
                "email": employee_data.get("EMAIL"),
                "phone_number": employee_data.get("PHONE NUMBER"),
                "whatsapp_number": employee_data.get("WHATSAPP NUMBER"),
                "gender": employee_data.get("GENDER"),
                "place_of_birth": employee_data.get("PLACE OF BIRTH"),
                "date_of_birth": employee_data.get("DATE OF BIRTH"),
                "religion": employee_data.get("RELIGION"),
                "marital_status": employee_data.get("MARITAL STATUS"),
                "residence_status": employee_data.get("RESIDENCE STATUS"),
                "blood_type": employee_data.get("BLOOD TYPE"),
                "height": employee_data.get("HEIGHT"),
                "weight": employee_data.get("WEIGHT"),
                "uniform_size": employee_data.get("UNIFORM SIZE"),
                "shoe_size": employee_data.get("SHOE SIZE"),
                "national_id_nik": employee_data.get("NATIONAL ID (NIK)"),
                "kk_number": employee_data.get("KK NUMBER"),
                "address": employee_data.get("ADDRESS"),
                "family_members": employee_data.get("FAMILY MEMBERS", []),
                "education_history": employee_data.get("EDUCATION HISTORY", []),
                "work_experience": employee_data.get("WORK EXPERIENCE", []),
                "certifications": employee_data.get("CERTIFICATIONS", []),
                "skills": employee_data.get("SKILLS"),
                "job_position": employee_data.get("Job Position *"),
                "division_name": employee_data.get("Division Name *"),
                "status": employee_data.get("Status *"),
                "base_salary": float(str(employee_data.get("Gaji Pokok *", 0)).replace(",", "")) if employee_data.get("Gaji Pokok *") else 0,
                "contract_end_date": employee_data.get("Contract End Date"),
                "bank_branch": employee_data.get("Bank Branch"),
                "payroll_method": employee_data.get("Payroll Method"),
                "npwp_16_digit": employee_data.get("NPWP 16 Digit"),
                "tax_method": employee_data.get("Tax Method"),
                "kpp_name": employee_data.get("KPP Name"),
                "faskes_tk1": employee_data.get("Faskes TK1"),
                "employment_type": employee_data.get("Employment Type"),
                "probation_end_date": employee_data.get("Probation End Date"),
                "working_location": employee_data.get("Working Location"),
                "overtime_eligible": employee_data.get("Overtime Eligible"),
                "resign_date": employee_data.get("Resign Date"),
                "is_resigned": employee_data.get("is_resigned")
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
            emp_response = await self.get_employees(page_size=1000)
            employees = emp_response.get("data", [])
            total = emp_response.get("total", 0)
            active = len([e for e in employees if e.get("Status *") == "Active"])
            
            # Count departments
            depts = set([e.get("Division Name *") for e in employees if e.get("Division Name *")])
            
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

    async def get_attendance_summary_today(self) -> Dict[str, Any]:
        """Get summary of today's attendance"""
        if not self.client: return {}
        try:
            from datetime import date
            today = date.today().isoformat()
            
            # Get all attendance for today
            res = self.client.table("attendance").select("*").eq("date", today).execute()
            data = res.data
            
            # Get active employee count
            emp_res = self.client.table("employees").select("id", count="exact").eq("status", "Active").execute()
            total_active = emp_res.count or 0
            
            present = len([r for r in data if str(r.get("status", "")).lower() in ["present", "late"]])
            late = len([r for r in data if str(r.get("status", "")).lower() == "late"])
            absent = total_active - present
            
            return {
                "present": present,
                "late": late,
                "absent": max(0, absent),
                "total": total_active
            }
        except Exception as e:
            print(f"Error getting today summary: {str(e)}")
            return {"present": 0, "late": 0, "absent": 0, "total": 0}

    async def get_attendance_trends(self, period: str) -> List[Dict[str, Any]]:
        """Get daily attendance trends for a specific period (YYYY-MM)"""
        if not self.client: return []
        try:
            import calendar
            try:
                year, month = map(int, period.split('-'))
                last_day = calendar.monthrange(year, month)[1]
                start_date = f"{period}-01"
                end_date = f"{period}-{last_day:02d}"
            except Exception:
                start_date = f"{period}-01"
                end_date = f"{period}-31"

            res = self.client.table("attendance") \
                .select("date, status") \
                .gte("date", start_date) \
                .lte("date", end_date) \
                .execute()
            
            data = res.data
            # Group by date
            trends = {}
            for r in data:
                d = r.get("date")
                if d not in trends:
                    trends[d] = {"date": d, "present": 0, "late": 0}
                status_lower = str(r.get("status", "")).lower()
                if status_lower in ["present", "late"]:
                    trends[d]["present"] += 1
                if status_lower == "late":
                    trends[d]["late"] += 1
            
            return sorted(list(trends.values()), key=lambda x: x["date"])
        except Exception as e:
            print(f"Error getting trends: {str(e)}")
            return []

    async def get_attendance_for_payroll(self, period: str) -> Dict[str, Any]:
        """Aggregate attendance metrics per employee for payroll calculation"""
        if not self.client: return {}
        try:
            import calendar
            try:
                year, month = map(int, period.split('-'))
                last_day = calendar.monthrange(year, month)[1]
                start_date = f"{period}-01"
                end_date = f"{period}-{last_day:02d}"
            except Exception:
                start_date = f"{period}-01"
                end_date = f"{period}-31"

            res = self.client.table("attendance") \
                .select("employee_id, status, late_minutes") \
                .gte("date", start_date) \
                .lte("date", end_date) \
                .execute()
            
            data = res.data
            summary = {}
            for r in data:
                eid = r.get("employee_id")
                if eid not in summary:
                    summary[eid] = {"late_minutes": 0, "absences": 0, "unpaid_leaves": 0}
                
                summary[eid]["late_minutes"] += r.get("late_minutes", 0)
                status_lower = str(r.get("status", "")).lower()
                if status_lower == "absent":
                    summary[eid]["absences"] += 1
                elif status_lower == "unpaid leave":
                    summary[eid]["unpaid_leaves"] += 1
            
            return summary


        except Exception as e:
            print(f"Error getting payroll attendance: {str(e)}")
            return {}

    async def get_all_data(self) -> Dict[str, Any]:
        """Fetch all tables at once for dashboard sync"""
        if not self.client: return {}
        try:
            # Individual calls in Supabase are very fast
            emp_response = await self.get_employees(page_size=1000)
            employees = emp_response.get("data", [])
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

    # -----------------------------------------------------------------------
    # T007, T008, T009: Geofencing & System Config Methods
    # -----------------------------------------------------------------------

    async def get_system_config(self, key: str) -> Optional[Dict[str, Any]]:
        """
        T007: Get system configuration value by key from system_configs table.
        
        Args:
            key: Configuration key (e.g., 'hq_location')
        
        Returns:
            Dictionary with config value, or None if not found
        """
        if not self.client:
            return None
        try:
            import time
            cache_key = f"sysconfig_{key}"
            if cache_key in self._cache:
                cached_val, timestamp = self._cache[cache_key]
                if time.time() - timestamp < self._cache_ttl:
                    return cached_val

            res = self.client.table("system_configs").select("*").eq("key", key).execute()
            if res.data:
                value = res.data[0].get("value")
                self._cache[cache_key] = (value, time.time())
                return value
            return None
        except Exception as e:
            print(f"Error getting system config '{key}': {str(e)}")
            return None

    async def set_system_config(self, key: str, value: Dict[str, Any]) -> bool:
        """
        T008: Update or insert a system configuration value.
        
        Args:
            key: Configuration key (e.g., 'hq_location')
            value: Configuration value as dictionary
        
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            return False
        try:
            from datetime import datetime, timezone
            data = {
                "key": key,
                "value": value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            self.client.table("system_configs").upsert(data).execute()
            
            # Invalidate cache for this key
            cache_key = f"sysconfig_{key}"
            if cache_key in self._cache:
                del self._cache[cache_key]
            
            return True
        except Exception as e:
            print(f"Error setting system config '{key}': {str(e)}")
            return False

    async def get_employee_by_id(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """
        T009: Get a single employee record with geofencing fields.
        
        Args:
            employee_id: The employee's ID string
        
        Returns:
            Employee dictionary including is_field_team, assigned_site_lat, assigned_site_long
        """
        if not self.client:
            return None
        try:
            res = self.client.table("employees") \
                .select("id, name, status, is_field_team, assigned_site_lat, assigned_site_long, working_location") \
                .eq("id", employee_id) \
                .execute()
            if res.data:
                return res.data[0]
            return None
        except Exception as e:
            print(f"Error getting employee '{employee_id}': {str(e)}")
            return None

    async def add_attendance_record(self, employee_id: str, date: str, status: str,
                                    check_in_time: str, late_minutes: int = 0,
                                    notes: str = "", photo_url: str = None) -> Dict[str, Any]:
        """
        Insert attendance record, handling unique constraint (double check-in prevention).
        
        Returns:
            dict with 'success': bool and 'already_checked_in': bool
        """
        if not self.client:
            return {"success": False, "already_checked_in": False}
        try:
            data = {
                "employee_id": employee_id,
                "date": date,
                "status": status,
                "check_in_time": check_in_time,
                "late_minutes": late_minutes,
                "notes": notes,
                "photo_url": photo_url
            }
            self.client.table("attendance").insert(data).execute()
            return {"success": True, "already_checked_in": False}
        except Exception as e:
            err_msg = str(e)
            # Detect UNIQUE constraint violation
            if "attendance_employee_date_unique" in err_msg or "duplicate key" in err_msg.lower() or "23505" in err_msg:
                # Fetch existing record
                try:
                    existing = self.client.table("attendance") \
                        .select("*") \
                        .eq("employee_id", employee_id) \
                        .eq("date", date) \
                        .execute()
                    return {
                        "success": False,
                        "already_checked_in": True,
                        "existing_record": existing.data[0] if existing.data else None
                    }
                except Exception:
                    pass
                return {"success": False, "already_checked_in": True}
            print(f"Error adding attendance for {employee_id}: {err_msg}")
            return {"success": False, "already_checked_in": False, "error": err_msg}

    async def get_late_alerts(self, days: int = 30, threshold: int = 3) -> List[Dict[str, Any]]:
        """
        T021: Get employees with more than `threshold` late arrivals in last `days` days.
        
        Returns:
            List of employee dicts with late_count
        """
        if not self.client:
            return []
        try:
            from datetime import date, timedelta
            start_date = (date.today() - timedelta(days=days)).isoformat()
            
            res = self.client.table("attendance") \
                .select("employee_id, status") \
                .eq("status", "Late") \
                .gte("date", start_date) \
                .execute()
            
            # Count late arrivals per employee
            late_counts: Dict[str, int] = {}
            for r in res.data:
                eid = r.get("employee_id")
                late_counts[eid] = late_counts.get(eid, 0) + 1
            
            # Filter by threshold
            alerts = []
            for eid, count in late_counts.items():
                if count > threshold:
                    alerts.append({"employee_id": eid, "late_count": count, "period_days": days})
            
            return sorted(alerts, key=lambda x: x["late_count"], reverse=True)
        except Exception as e:
            print(f"Error getting late alerts: {str(e)}")
            return []

    async def sync_leave_to_attendance(self, employee_id: str, start_date: str,
                                        end_date: str, leave_type: str) -> int:
        """
        T022: Sync approved leave to attendance table.
        Inserts attendance records with status 'Leave' for each day in the range.
        
        Returns:
            Number of days successfully synced
        """
        if not self.client:
            return 0
        try:
            from datetime import date, timedelta
            start = date.fromisoformat(start_date)
            end = date.fromisoformat(end_date)
            synced = 0
            
            current = start
            while current <= end:
                # Skip weekends (optional — comment out if leave applies on weekends)
                # if current.weekday() < 5:  # Monday=0, Friday=4
                data = {
                    "employee_id": employee_id,
                    "date": current.isoformat(),
                    "status": "Leave",
                    "notes": leave_type,
                    "late_minutes": 0
                }
                try:
                    self.client.table("attendance").insert(data).execute()
                    synced += 1
                except Exception as insert_err:
                    # ON CONFLICT — already has attendance record for this day, skip
                    if "duplicate key" in str(insert_err).lower() or "23505" in str(insert_err):
                        pass  # Skip silently
                    else:
                        print(f"Error inserting leave attendance for {current}: {str(insert_err)}")
                current += timedelta(days=1)
            
            return synced
        except Exception as e:
            print(f"Error syncing leave to attendance: {str(e)}")
            return 0

    # -----------------------------------------------------------------------
    # Divisions & Departments CRUD
    # -----------------------------------------------------------------------

    async def get_divisions(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """Fetch all divisions from Supabase"""
        if not self.client:
            return []
        try:
            query = self.client.table("divisions").select("*")
            if active_only:
                query = query.eq("is_active", True)
            res = query.order("name").execute()
            return res.data
        except Exception as e:
            print(f"Error getting divisions: {str(e)}")
            return []

    async def get_division_by_id(self, division_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single division by ID"""
        if not self.client:
            return None
        try:
            res = self.client.table("divisions").select("*").eq("id", division_id).execute()
            if res.data:
                return res.data[0]
            return None
        except Exception as e:
            print(f"Error getting division: {str(e)}")
            return None

    async def create_division(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert a new division"""
        if not self.client:
            return None
        try:
            res = self.client.table("divisions").insert(data).execute()
            if res.data:
                return res.data[0]
            return None
        except Exception as e:
            print(f"Error creating division: {str(e)}")
            return None

    async def update_division(self, division_id: str, data: Dict[str, Any]) -> bool:
        """Update an existing division"""
        if not self.client:
            return False
        try:
            # We don't want to update updated_at here if Supabase trigger handles it, 
            # but if not, we can add it. Assuming trigger handles it.
            res = self.client.table("divisions").update(data).eq("id", division_id).execute()
            return len(res.data) > 0
        except Exception as e:
            print(f"Error updating division: {str(e)}")
            return False

    async def delete_division(self, division_id: str) -> bool:
        """Hard delete a division. Fails if there are linked departments/employees."""
        if not self.client:
            return False
        try:
            res = self.client.table("divisions").delete().eq("id", division_id).execute()
            return len(res.data) > 0
        except Exception as e:
            print(f"Error deleting division: {str(e)}")
            raise

    async def get_departments(self, division_id: str = None, active_only: bool = True) -> List[Dict[str, Any]]:
        """Fetch departments. Optionally filter by division_id."""
        if not self.client:
            return []
        try:
            query = self.client.table("departments").select("*, divisions(name, code)").order("name")
            if division_id:
                query = query.eq("division_id", division_id)
            if active_only:
                query = query.eq("is_active", True)
            res = query.execute()
            return res.data
        except Exception as e:
            print(f"Error fetching departments: {str(e)}")
            return []

    async def create_department(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new department."""
        if not self.client: return None
        try:
            res = self.client.table("departments").insert(data).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"Error creating department: {str(e)}")
            return None

    async def update_department(self, dept_id: str, data: Dict[str, Any]) -> bool:
        """Update a department."""
        if not self.client: return False
        try:
            self.client.table("departments").update(data).eq("id", dept_id).execute()
            return True
        except Exception as e:
            print(f"Error updating department: {str(e)}")
            return False

    async def delete_department(self, dept_id: str) -> bool:
        """Soft-delete a department by setting is_active = false."""
        if not self.client: return False
        try:
            self.client.table("departments").update({"is_active": False}).eq("id", dept_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting department: {str(e)}")
            return False

    # -----------------------------------------------------------------------
    # Auth Admin Operations for Employees
    # -----------------------------------------------------------------------

    async def create_auth_user(self, email: str, password: str = "123456", name: str = "") -> Optional[str]:
        """Create a user in Supabase Auth (auth.users) via Admin API"""
        if not self.client: return None
        try:
            res = self.client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"name": name}
            })
            return res.user.id if res.user else None
        except Exception as e:
            err_msg = str(e).lower()
            if "already exists" in err_msg or "already registered" in err_msg:
                # If user already exists, try to get their ID by listing users or just return a dummy string indicating success
                return "EXISTING"
            print(f"Error creating auth user: {str(e)}")
            return None

    async def update_auth_user_email(self, current_email: str, new_email: str) -> bool:
        """Update user email in Auth. Requires finding the user UID first."""
        if not self.client: return False
        try:
            # Note: List users requires pagination, but for small teams it's fine.
            # A more robust way is to store auth_id in employees table, but without it we search by email
            users_res = self.client.auth.admin.list_users()
            for u in users_res:
                if u.email == current_email:
                    self.client.auth.admin.update_user_by_id(u.id, {"email": new_email})
                    return True
            print(f"Auth user {current_email} not found for email update.")
            return False
        except Exception as e:
            print(f"Error updating auth user email: {str(e)}")
            return False

    async def delete_or_suspend_auth_user(self, email: str) -> bool:
        """Delete user from auth.users when they resign"""
        if not self.client: return False
        try:
            users_res = self.client.auth.admin.list_users()
            for u in users_res:
                if u.email == email:
                    self.client.auth.admin.delete_user(u.id)
                    return True
            return True # Not found, so essentially "deleted"
        except Exception as e:
            print(f"Error deleting auth user: {str(e)}")
            return False

    # -----------------------------------------------------------------------
    # Positions CRUD
    # -----------------------------------------------------------------------

    async def get_positions(self, dept_id: Optional[str] = None, active_only: bool = True) -> List[Dict[str, Any]]:
        """Get positions, optionally filtered by department."""
        if not self.client: return []
        try:
            query = self.client.table("positions").select("*").order("name")
            if dept_id:
                query = query.eq("department_id", dept_id)
            if active_only:
                query = query.eq("is_active", True)
            res = query.execute()
            return res.data
        except Exception as e:
            print(f"Error fetching positions: {str(e)}")
            return []

    async def create_position(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new position."""
        if not self.client: return None
        try:
            res = self.client.table("positions").insert(data).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"Error creating position: {str(e)}")
            return None

    async def update_position(self, pos_id: str, data: Dict[str, Any]) -> bool:
        """Update a position."""
        if not self.client: return False
        try:
            self.client.table("positions").update(data).eq("id", pos_id).execute()
            return True
        except Exception as e:
            print(f"Error updating position: {str(e)}")
            return False

    async def delete_position(self, pos_id: str) -> bool:
        """Soft-delete a position by setting is_active = false."""
        if not self.client: return False
        try:
            self.client.table("positions").update({"is_active": False}).eq("id", pos_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting position: {str(e)}")
            return False

# Singleton instance
supabase_client = WKNSupabaseClient()

