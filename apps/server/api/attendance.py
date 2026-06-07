from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator, ValidationInfo
from typing import Optional
from utils.supabase_client import supabase_client
from utils.geofencing import is_within_radius, calculate_late_minutes
from utils.jwt_handler import get_current_user, require_admin

router = APIRouter()


# ─── Request Models ────────────────────────────────────────────────────────────

class CheckInRequest(BaseModel):
    """T010: Request body for ESS check-in"""
    employee_id: str
    latitude: float
    longitude: float
    photo_url: Optional[str] = None
    photo_base64: Optional[str] = None
    clock_type: Optional[str] = "IN" # "IN" or "OUT"
    timestamp: Optional[str] = None # For offline sync
    notes: Optional[str] = None


class LocationConfigRequest(BaseModel):
    """T016: Request body for updating location settings"""
    key: str
    value: dict

    @field_validator("value")
    @classmethod
    def validate_location_value(cls, v, info: ValidationInfo):
        key = info.data.get("key") if info.data else None
        if key == "hq_location":
            if "lat" not in v or "lon" not in v:
                raise ValueError("value must include 'lat' and 'lon' fields")
            radius = v.get("radius", 100)
            if not (50 <= radius <= 5000):
                raise ValueError("radius must be between 50 and 5000 meters")
        return v


class SiteAssignRequest(BaseModel):
    """T017: Request body for assigning a site to a field team member"""
    assigned_site_lat: Optional[float] = None
    assigned_site_long: Optional[float] = None
    is_field_team: bool = True
    working_location: Optional[str] = None


# ─── Existing Endpoints ────────────────────────────────────────────────────────

@router.get("/attendance/summary/today")
async def get_today_summary(current_user: dict = Depends(get_current_user)):
    """Get today's attendance summary"""
    try:
        summary = await supabase_client.get_attendance_summary_today()
        return {"status": "success", "data": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance/export/today")
async def export_today_attendance(current_user: dict = Depends(require_admin)):
    """Fetch raw attendance logs for today for export"""
    try:
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        res = supabase_client.client.table("attendance").select("*, employees(name, division_name, job_position)").gte("created_at", f"{today}T00:00:00Z").lte("created_at", f"{today}T23:59:59Z").order("created_at", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance/live")
async def get_live_attendance(current_user: dict = Depends(require_admin)):
    """Fetch the latest 100 attendance records for the live feed"""
    try:
        res = supabase_client.client.table("attendance").select("*, employees(name, id)").order("created_at", desc=True).limit(100).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance/recap")
async def get_attendance_recap(start_date: str, end_date: str, current_user: dict = Depends(require_admin)):
    """Fetch attendance recap for a specific date range"""
    try:
        emp_res = supabase_client.client.table("employees").select("id, name, division_name, job_position").eq("is_resigned", False).execute()
        att_res = supabase_client.client.table("attendance").select("*").gte("date", start_date).lte("date", end_date).execute()
        
        return {
            "status": "success",
            "data": {
                "employees": emp_res.data,
                "attendance": att_res.data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance/report")
async def get_attendance_report(start_date: str, end_date: str, employee_id: str = None, current_user: dict = Depends(require_admin)):
    """Fetch attendance report with employee details"""
    try:
        query = supabase_client.client.table("attendance").select("*, employees(name, id, division_name, job_position)").gte("date", start_date).lte("date", end_date).order("date", desc=True)
        if employee_id and employee_id != 'ALL':
            query = query.eq("employee_id", employee_id)
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/attendance/resolve-discrepancy")
async def resolve_discrepancy(record_id: int, decision: str, current_user: dict = Depends(require_admin)):
    """T015: Manager resolves an attendance discrepancy."""
    try:
        from datetime import datetime
        now = datetime.now().isoformat()
        res = supabase_client.client.table("attendance").update({
            "discrepancy_status": decision, # "APPROVED" or "REJECTED"
            "discrepancy_resolved_at": now,
            "discrepancy_resolved_by": current_user.get("Username")
        }).eq("id", record_id).execute()
        
        return {"status": "success", "data": res.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/attendance/direct")
async def create_attendance_direct(data: dict, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("attendance").insert([data]).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct create failed: {str(e)}")

@router.put("/attendance/direct/{attendance_id}")
async def update_attendance_direct(attendance_id: int, data: dict, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("attendance").update(data).eq("id", attendance_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct update failed: {str(e)}")

@router.post("/attendance/bulk-insert")
async def bulk_insert_attendance(data: list, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("attendance").insert(data).execute()
        return {"status": "success", "count": len(response.data) if response.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk insert failed: {str(e)}")

@router.delete("/attendance/direct/{attendance_id}")
async def delete_attendance_direct(attendance_id: int, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("attendance").delete().eq("id", attendance_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct delete failed: {str(e)}")

@router.get("/attendance/analytics/trends")
async def get_attendance_trends(period: str = "2026-05", current_user: dict = Depends(require_admin)):
    """Get attendance trends for analytics"""
    try:
        trends = await supabase_client.get_attendance_trends(period)
        return {"status": "success", "data": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── New Endpoints: Geofencing & ESS ──────────────────────────────────────────

@router.post("/attendance/check-in")
async def ess_check_in(body: CheckInRequest, current_user: dict = Depends(get_current_user)):
    """
    T010, T014: ESS Check-in endpoint with geofencing validation.
    
    - Office employees: validated against HQ coordinates from system_configs
    - Field team members: validated against their assigned_site_lat/long
    - Falls back to HQ if field team has no site assigned
    """
    from datetime import datetime, timezone, timedelta

    employee_id = body.employee_id
    user_lat = body.latitude
    user_lon = body.longitude

    # VALIDASI KEAMANAN: Karyawan biasa HANYA boleh absen untuk dirinya sendiri!
    user_role = current_user.get("role", "").lower()
    if user_role not in ["admin", "owner"] and current_user.get("employee_id") != employee_id:
        raise HTTPException(
            status_code=403, 
            detail="Akses ditolak. Anda tidak diperbolehkan melakukan absensi atas nama karyawan lain."
        )

    # Fetch employee data (includes is_field_team and site coordinates)
    employee = await supabase_client.get_employee_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")

    # Determine target location
    is_field = employee.get("is_field_team", False)
    site_lat = employee.get("assigned_site_lat")
    site_lon = employee.get("assigned_site_long")
    target_name = "Lokasi Lapangan"
    radius = 100

    # Check if free attendance is globally allowed
    allow_free_cfg = await supabase_client.get_system_config("allow_free_attendance")
    allow_free = allow_free_cfg.get("value", False) if allow_free_cfg else False

    if allow_free:
        target_lat = user_lat
        target_lon = user_lon
        target_name = "Bebas Absen (Anywhere)"
        radius = 9999999
    elif is_field:
        if site_lat is not None and site_lon is not None:
            target_lat = site_lat
            target_lon = site_lon
            target_name = "Site Proyek"
            radius = 100
        else:
            target_lat = user_lat
            target_lon = user_lon
            target_name = "Bebas Absen (Field Team)"
            radius = 9999999
    else:
        # Check if employee's working_location matches any configured working locations
        working_loc_name = employee.get("working_location", "Head Office")
        locations_cfg = await supabase_client.get_system_config("working_locations")
        locations_list = locations_cfg.get("locations", []) if locations_cfg else []
        
        matched_loc = None
        for loc in locations_list:
            if loc.get("name") == working_loc_name:
                matched_loc = loc
                break
        
        if matched_loc:
            target_lat = matched_loc.get("lat")
            target_lon = matched_loc.get("lon")
            target_name = matched_loc.get("name")
            radius = matched_loc.get("radius", 100)
        else:
            # Use HQ location from system_configs
            hq_config = await supabase_client.get_system_config("hq_location")
            if not hq_config:
                raise HTTPException(status_code=503, detail="Konfigurasi lokasi HQ tidak ditemukan. Hubungi Admin.")
            target_lat = hq_config.get("lat")
            target_lon = hq_config.get("lon")
            target_name = hq_config.get("name", "WKN HQ")
            radius = hq_config.get("radius", 100)

    # Geofencing validation
    within, distance_m = is_within_radius(user_lat, user_lon, target_lat, target_lon, radius)

    if not within:
        return {
            "status": "out_of_range",
            "data": {
                "distance_meters": distance_m,
                "allowed_radius": radius,
                "target_name": target_name,
                "message": f"Check-in ditolak. Anda berada {distance_m}m dari {target_name} (batas {radius}m)."
            }
        }

    # Calculate check-in time and late status
    wib = timezone(timedelta(hours=7))
    now = datetime.now(wib)
    check_in_time = now.isoformat()
    today = now.date().isoformat()

    late_mins = calculate_late_minutes(check_in_time)
    attendance_status = "Late" if late_mins > 0 else "Present"

    # Insert attendance record (handles double check-in)
    result = await supabase_client.add_attendance_record(
        employee_id=employee_id,
        date=today,
        status=attendance_status,
        check_in_time=check_in_time,
        late_minutes=late_mins,
        notes=body.notes or f"Geofencing check-in @ {target_name}",
        photo_url=body.photo_url or body.photo_base64
    )

    if result.get("already_checked_in") and body.clock_type != "OUT":
        existing = result.get("existing_record", {})
        return {
            "status": "already_checked_in",
            "data": {
                "check_in_time": existing.get("check_in_time") if existing else check_in_time,
                "message": "Anda sudah melakukan check-in hari ini."
            }
        }

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Gagal menyimpan data absensi"))

    return {
        "status": "success",
        "data": {
            "check_in_status": attendance_status,
            "distance_meters": distance_m,
            "check_in_time": check_in_time,
            "late_minutes": late_mins,
            "target_name": target_name,
            "message": (
                f"Check-in berhasil. Anda berada {distance_m}m dari {target_name}. "
                f"{'Terlambat ' + str(late_mins) + ' menit.' if late_mins > 0 else 'Tepat waktu!'}"
            )
        }
    }

@router.post("/attendance/upload-photo")
async def upload_attendance_photo(payload: dict, current_user: dict = Depends(get_current_user)):
    try:
        # In a real app we'd convert base64 to image and upload to Storage
        photo_base64 = payload.get("photo_base64")
        if not photo_base64:
            raise HTTPException(status_code=400, detail="No photo provided")
            
        # Return a mock url or the base64 string as url for now
        return {"status": "success", "photo_url": photo_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/attendance/sync-offline")
async def sync_offline_attendance(payload: list, current_user: dict = Depends(get_current_user)):
    try:
        success_count = 0
        failed_count = 0
        # Iterate over array of attendance objects and process them
        for item in payload:
            # We skip actual validation here and just insert/update
            clock_type = item.get("clock_type")
            employee_id = current_user.get("employee_id")
            today = item.get("date")
            nowTime = item.get("time")
            notes = item.get("notes")
            photo_url = item.get("photo_url") or item.get("photo_base64")
            
            existing_res = supabase_client.client.table("attendance").select("id, clock_in, clock_out").eq("employee_id", employee_id).eq("date", today).execute()
            existing = existing_res.data[0] if existing_res.data else None
            
            if clock_type == "IN":
                if not existing:
                    supabase_client.client.table("attendance").insert({
                        "employee_id": employee_id,
                        "date": today,
                        "clock_in": nowTime,
                        "status": "Present",
                        "notes": notes,
                        "photo_url": photo_url,
                        "location_lat": item.get("location_lat"),
                        "location_lng": item.get("location_lng")
                    }).execute()
                    success_count += 1
            else:
                if existing:
                    supabase_client.client.table("attendance").update({
                        "clock_out": nowTime,
                        "notes": notes,
                        "photo_url": photo_url,
                        "location_lat": item.get("location_lat"),
                        "location_lng": item.get("location_lng")
                    }).eq("id", existing.get("id")).execute()
                    success_count += 1
                else:
                    supabase_client.client.table("attendance").insert({
                        "employee_id": employee_id,
                        "date": today,
                        "clock_out": nowTime,
                        "status": "Present",
                        "notes": notes,
                        "photo_url": photo_url,
                        "location_lat": item.get("location_lat"),
                        "location_lng": item.get("location_lng")
                    }).execute()
                    success_count += 1
                    
        return {"status": "success", "synced": success_count, "failed": failed_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/attendance/settings")
async def get_attendance_settings():
    """
    T013: Get current location configuration (HQ coordinates & radius).
    Used by frontend CheckInCard to display target location info.
    """
    try:
        hq_config = await supabase_client.get_system_config("hq_location")
        if not hq_config:
            # Return safe defaults if not configured yet
            hq_config = {
                "lat": -6.2088,
                "lon": 106.8456,
                "radius": 100,
                "name": "WKN HQ Jakarta"
            }
        allow_free_cfg = await supabase_client.get_system_config("allow_free_attendance")
        allow_free = allow_free_cfg.get("value", False) if allow_free_cfg else False

        locations_cfg = await supabase_client.get_system_config("working_locations")
        locations = locations_cfg.get("locations", []) if locations_cfg else []

        return {
            "status": "success",
            "data": {
                "hq_location": hq_config,
                "allow_free_attendance": allow_free,
                "working_locations": locations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/attendance/settings")
async def update_attendance_settings(body: LocationConfigRequest, current_user: dict = Depends(require_admin)):
    """
    T016: Update location configuration (Admin only).
    Saves new HQ coordinates or other settings to system_configs table.
    """
    try:
        success = await supabase_client.set_system_config(body.key, body.value)
        if not success:
            raise HTTPException(status_code=500, detail="Gagal menyimpan konfigurasi lokasi")
        return {
            "status": "success",
            "message": f"Konfigurasi '{body.key}' berhasil diperbarui."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/attendance/employees/{employee_id}/site")
async def assign_employee_site(employee_id: str, body: SiteAssignRequest, current_user: dict = Depends(require_admin)):
    """
    T017: Assign site coordinates to a field team member.
    Updates employees.assigned_site_lat, assigned_site_long, is_field_team, and working_location.
    """
    try:
        update_data = {
            "is_field_team": body.is_field_team,
            "assigned_site_lat": body.assigned_site_lat,
            "assigned_site_long": body.assigned_site_long,
            "working_location": body.working_location
        }
        # Remove None values except boolean
        update_data = {k: v for k, v in update_data.items() if v is not None or k == "is_field_team"}
        
        if not supabase_client.client:
            raise HTTPException(status_code=503, detail="Database tidak tersedia")
        
        supabase_client.client.table("employees") \
            .update(update_data) \
            .eq("id", employee_id) \
            .execute()
        
        return {
            "status": "success",
            "message": f"Konfigurasi lokasi untuk karyawan '{employee_id}' berhasil diperbarui."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/attendance/calendar")
async def get_attendance_calendar(employee_id: str, start_date: str, end_date: str, current_user: dict = Depends(require_admin)):
    """Fetch attendance data for calendar view"""
    try:
        res = supabase_client.client.table("attendance").select("*").eq("employee_id", employee_id).gte("date", start_date).lte("date", end_date).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance/late-alerts")
async def get_late_alerts(days: int = 30, threshold: int = 3, current_user: dict = Depends(require_admin)):
    """
    T021: Get employees flagged for excessive late arrivals.
    Returns employees with more than `threshold` late check-ins in the last `days` days.
    """
    try:
        alerts = await supabase_client.get_late_alerts(days=days, threshold=threshold)
        return {
            "status": "success",
            "data": alerts,
            "meta": {
                "period_days": days,
                "threshold": threshold,
                "total_flagged": len(alerts)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance/overtime")
async def get_overtime_requests(current_user: dict = Depends(require_admin)):
    """Fetch all overtime requests"""
    try:
        res = supabase_client.client.table("overtime_requests").select("*, employees(name, employee_id, division_name, job_position)").order("date", desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/attendance/overtime/{request_id}")
async def update_overtime_status(request_id: int, payload: dict, current_user: dict = Depends(require_admin)):
    """Approve or reject overtime request"""
    try:
        from datetime import datetime
        update_data = {
            "status": payload.get("status"),
            "approved_by": payload.get("approved_by"),
            "updated_at": datetime.now().isoformat()
        }
        res = supabase_client.client.table("overtime_requests").update(update_data).eq("id", request_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
