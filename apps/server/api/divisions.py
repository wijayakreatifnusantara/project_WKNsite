from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.supabase_client import supabase_client

router = APIRouter()


# ─── Request Models ────────────────────────────────────────────────────────────

class divisionCreateRequest(BaseModel):
    """Request body for creating an division"""
    code: str
    name: str
    description: Optional[str] = None
    pic_name: Optional[str] = None
    pic_email: Optional[str] = None
    pic_phone: Optional[str] = None


class divisionUpdateRequest(BaseModel):
    """Request body for updating an division"""
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    pic_name: Optional[str] = None
    pic_email: Optional[str] = None
    pic_phone: Optional[str] = None


class DepartmentCreateRequest(BaseModel):
    """Request body for creating a department"""
    code: str
    name: str


class DepartmentUpdateRequest(BaseModel):
    """Request body for updating a department"""
    code: Optional[str] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None


class PositionCreateRequest(BaseModel):
    """Request body for creating a position"""
    name: str
    level: Optional[str] = None
    description: Optional[str] = None


class PositionUpdateRequest(BaseModel):
    """Request body for updating a position"""
    name: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


# ─── division Endpoints ────────────────────────────────────────────────────

@router.get("/divisions")
async def list_divisions(active_only: bool = True):
    """Get all divisions"""
    try:
        data = await supabase_client.get_divisions(active_only=active_only)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/divisions")
async def create_division(body: divisionCreateRequest):
    """Create a new division"""
    try:
        insert_data = {"code": body.code, "name": body.name}
        if body.description is not None:
            insert_data["description"] = body.description
        if body.pic_name is not None:
            insert_data["pic_name"] = body.pic_name
        if body.pic_email is not None:
            insert_data["pic_email"] = body.pic_email
        if body.pic_phone is not None:
            insert_data["pic_phone"] = body.pic_phone

        result = await supabase_client.create_division(insert_data)
        if not result:
            raise HTTPException(status_code=500, detail="Gagal membuat organisasi")
        return {
            "status": "success",
            "message": f"Organisasi '{body.name}' berhasil dibuat.",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/divisions/{division_id}")
async def update_division(division_id: str, body: divisionUpdateRequest):
    """Update an existing division"""
    try:
        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Tidak ada data yang diperbarui")

        success = await supabase_client.update_division(division_id, update_data)
        if not success:
            raise HTTPException(status_code=500, detail="Gagal memperbarui organisasi")
        return {
            "status": "success",
            "message": "Organisasi berhasil diperbarui.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/divisions/{division_id}")
async def delete_division(division_id: str):
    """Delete an division"""
    try:
        await supabase_client.delete_division(division_id)
        return {
            "status": "success",
            "message": "Organisasi berhasil dihapus secara permanen.",
        }
    except Exception as e:
        error_msg = str(e)
        if "foreign key" in error_msg.lower() or "violates foreign key" in error_msg.lower():
            raise HTTPException(
                status_code=400,
                detail="Tidak dapat menghapus organisasi ini karena masih terikat dengan data karyawan atau profil pengguna.",
            )
        raise HTTPException(status_code=500, detail=f"Gagal menghapus organisasi: {error_msg}")


# ─── Department Endpoints ──────────────────────────────────────────────────────

@router.get("/divisions/{division_id}/departments")
async def list_departments(division_id: str, active_only: bool = True):
    """Get departments belonging to an division"""
    try:
        data = await supabase_client.get_departments(division_id=division_id, active_only=active_only)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/divisions/{division_id}/departments")
async def create_department(division_id: str, body: DepartmentCreateRequest):
    """Create a new department under an division"""
    try:
        # Verify division exists
        org = await supabase_client.get_division_by_id(division_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organisasi tidak ditemukan")

        insert_data = {
            "division_id": division_id,
            "code": body.code,
            "name": body.name,
        }
        result = await supabase_client.create_department(insert_data)
        if not result:
            raise HTTPException(status_code=500, detail="Gagal membuat departemen")
        return {
            "status": "success",
            "message": f"Departemen '{body.name}' berhasil dibuat.",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/departments/{dept_id}")
async def update_department(dept_id: str, body: DepartmentUpdateRequest):
    """Update an existing department"""
    try:
        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Tidak ada data yang diperbarui")

        success = await supabase_client.update_department(dept_id, update_data)
        if not success:
            raise HTTPException(status_code=500, detail="Gagal memperbarui departemen")
        return {
            "status": "success",
            "message": "Departemen berhasil diperbarui.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str):
    """Soft-delete a department (set is_active = false)"""
    try:
        success = await supabase_client.delete_department(dept_id)
        if not success:
            raise HTTPException(status_code=500, detail="Gagal menghapus departemen")
        return {
            "status": "success",
            "message": "Departemen berhasil dihapus.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Position Endpoints ────────────────────────────────────────────────────────

@router.get("/departments/{dept_id}/positions")
async def list_positions(dept_id: str, active_only: bool = True):
    """Get positions belonging to a department"""
    try:
        data = await supabase_client.get_positions(dept_id=dept_id, active_only=active_only)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/departments/{dept_id}/positions")
async def create_position(dept_id: str, body: PositionCreateRequest):
    """Create a new position under a department"""
    try:
        insert_data = {
            "department_id": dept_id,
            "name": body.name,
        }
        if body.level is not None:
            insert_data["level"] = body.level
        if body.description is not None:
            insert_data["description"] = body.description

        result = await supabase_client.create_position(insert_data)
        if not result:
            raise HTTPException(status_code=500, detail="Gagal membuat posisi")
        return {
            "status": "success",
            "message": f"Posisi '{body.name}' berhasil dibuat.",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/positions/{pos_id}")
async def update_position(pos_id: str, body: PositionUpdateRequest):
    """Update an existing position"""
    try:
        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Tidak ada data yang diperbarui")

        success = await supabase_client.update_position(pos_id, update_data)
        if not success:
            raise HTTPException(status_code=500, detail="Gagal memperbarui posisi")
        return {
            "status": "success",
            "message": "Posisi berhasil diperbarui.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/positions/{pos_id}")
async def delete_position(pos_id: str):
    """Soft-delete a position (set is_active = false)"""
    try:
        success = await supabase_client.delete_position(pos_id)
        if not success:
            raise HTTPException(status_code=500, detail="Gagal menghapus posisi")
        return {
            "status": "success",
            "message": "Posisi berhasil dihapus.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/divisions/migrate-positions")
async def migrate_positions_from_employees():
    """
    One-time data migration: create positions rows from employees.job_position
    when a matching active position does not yet exist for that department.
    """
    try:
        if not supabase_client.client:
            raise HTTPException(status_code=503, detail="Database tidak tersedia")

        emp_res = supabase_client.client.table("employees") \
            .select("id, job_position, job_level, department_id") \
            .not_.is_("department_id", "null") \
            .not_.is_("job_position", "null") \
            .execute()

        pos_res = supabase_client.client.table("positions") \
            .select("id, name, department_id, is_active") \
            .execute()

        lookup = {
            f"{p['department_id']}::{p['name'].strip().lower()}"
            for p in (pos_res.data or [])
            if p.get("is_active") and p.get("name")
        }

        created = 0
        skipped = 0
        seen = set()

        for emp in emp_res.data or []:
            name = (emp.get("job_position") or "").strip()
            dept_id = emp.get("department_id")
            if not name or not dept_id:
                skipped += 1
                continue

            key = f"{dept_id}::{name.lower()}"
            if key in lookup or key in seen:
                skipped += 1
                continue
            seen.add(key)

            insert_data = {
                "department_id": dept_id,
                "name": name,
                "level": emp.get("job_level"),
                "is_active": True,
            }
            result = await supabase_client.create_position(insert_data)
            if result:
                lookup.add(key)
                created += 1
            else:
                skipped += 1

        return {
            "status": "success",
            "message": f"Migrasi posisi selesai: {created} dibuat, {skipped} dilewati.",
            "data": {"created": created, "skipped": skipped},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/divisions/migrate-employees")
async def migrate_employees_to_division_id():
    """
    One-time migration: match employees' division_name text field
    to the divisions table and set division_id FK.
    """
    try:
        if not supabase_client.client:
            raise HTTPException(status_code=503, detail="Database tidak tersedia")

        # Fetch all divisions for name matching
        orgs = await supabase_client.get_divisions(active_only=False)
        org_lookup = {o["name"].strip().lower(): o["id"] for o in orgs if o.get("name")}

        # Fetch employees that still have division_name but no division_id
        emp_res = supabase_client.client.table("employees") \
            .select("id, division_name, division_id") \
            .execute()

        migrated = 0
        skipped = 0
        unmatched = []

        for emp in emp_res.data:
            # Skip if already has division_id
            if emp.get("division_id"):
                skipped += 1
                continue

            org_name = (emp.get("division_name") or "").strip().lower()
            if not org_name:
                skipped += 1
                continue

            matched_division_id = org_lookup.get(org_name)
            if matched_division_id:
                supabase_client.client.table("employees") \
                    .update({"division_id": matched_division_id}) \
                    .eq("id", emp["id"]) \
                    .execute()
                migrated += 1
            else:
                unmatched.append(emp.get("division_name", ""))

        return {
            "status": "success",
            "message": f"Migrasi selesai: {migrated} karyawan diperbarui, {skipped} dilewati.",
            "data": {
                "migrated": migrated,
                "skipped": skipped,
                "unmatched_names": list(set(unmatched)),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
