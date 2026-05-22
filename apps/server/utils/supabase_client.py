import os
from typing import List, Dict, Any, Optional
from supabase import create_client, Client

class WKNSupabaseClient:
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
                    "Organization Name *": e.get("organization_name"),
                    "Status *": e.get("status"),
                    "Gaji Pokok *": str(e.get("base_salary", 0)),
                    "JOIN DATE": e.get("join_date"),
                    "Contract End Date": e.get("contract_end_date"),
                    "Resign Date": e.get("resign_date"),
                    "is_resigned": e.get("is_resigned")
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
        """Authenticate user against profiles table (with Absolute Path Logging)"""
        if not self.client: return None
        log_path = "e:/project_WKNsite/apps/server/auth_debug.log"
        try:
            clean_username = username.strip()
            clean_password = password.strip()
            
            with open(log_path, "a") as f:
                f.write(f"\n[DEBUG] Login attempt at {clean_username}\n")

            # Mencari di tabel profiles (plural)
            response = self.client.table("profiles") \
                .select("*") \
                .ilike("username", clean_username) \
                .execute()
            
            if not response.data:
                with open(log_path, "a") as f:
                    f.write(f"[ERROR] User {clean_username} NOT FOUND in 'profiles' table.\n")
                return None
            
            user = response.data[0]
            if user.get("password") == clean_password:
                with open(log_path, "a") as f:
                    f.write(f"[SUCCESS] Login OK for {clean_username}\n")
                
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
                    with open(log_path, "a") as f:
                        f.write(f"[WARN] Failed to fetch employee detail: {str(ex)}\n")

                return {
                    "Username": user.get("username"),
                    "Password": user.get("password"),
                    "Full Name": user.get("full_name"),
                    "Role": user.get("role"),
                    "Status": user.get("status"),
                    "employee_id": employee_id,
                    "is_field_team": is_field_team
                }
            else:
                with open(log_path, "a") as f:
                    f.write(f"[ERROR] Password mismatch for {clean_username}\n")
                return None
        except Exception as e:
            with open(log_path, "a") as f:
                f.write(f"[CRITICAL] System Error: {str(e)}\n")
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
                "email": employee_data.get("EMAIL"),
                "phone_number": employee_data.get("PHONE NUMBER"),
                "job_position": employee_data.get("Job Position *"),
                "organization_name": employee_data.get("Organization Name *"),
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
                .select("id, name, status, is_field_team, assigned_site_lat, assigned_site_long") \
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
                                    notes: str = "") -> Dict[str, Any]:
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
                "notes": notes
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
    # Organizations & Departments CRUD
    # -----------------------------------------------------------------------

    async def get_organizations(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """Get all organizations, optionally filtered by active status."""
        if not self.client: return []
        try:
            query = self.client.table("organizations").select("*").order("name")
            if active_only:
                query = query.eq("is_active", True)
            res = query.execute()
            return res.data
        except Exception as e:
            print(f"Error fetching organizations: {str(e)}")
            return []

    async def get_organization_by_id(self, org_id: str) -> Optional[Dict[str, Any]]:
        """Get a single organization by ID."""
        if not self.client: return None
        try:
            res = self.client.table("organizations").select("*").eq("id", org_id).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"Error fetching organization: {str(e)}")
            return None

    async def create_organization(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new organization."""
        if not self.client: return None
        try:
            res = self.client.table("organizations").insert(data).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"Error creating organization: {str(e)}")
            return None

    async def update_organization(self, org_id: str, data: Dict[str, Any]) -> bool:
        """Update an organization."""
        if not self.client: return False
        try:
            from datetime import datetime, timezone
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            self.client.table("organizations").update(data).eq("id", org_id).execute()
            return True
        except Exception as e:
            print(f"Error updating organization: {str(e)}")
            return False

    async def delete_organization(self, org_id: str) -> bool:
        """Delete an organization from the database."""
        if not self.client: return False
        try:
            self.client.table("organizations").delete().eq("id", org_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting organization: {str(e)}")
            raise e

    async def get_departments(self, org_id: Optional[str] = None, active_only: bool = True) -> List[Dict[str, Any]]:
        """Get departments, optionally filtered by organization."""
        if not self.client: return []
        try:
            query = self.client.table("departments").select("*, organizations(name, code)").order("name")
            if org_id:
                query = query.eq("organization_id", org_id)
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

