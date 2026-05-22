from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.supabase_client import supabase_client

router = APIRouter()


# ─── Request Models ────────────────────────────────────────────────────────────

class OrganizationCreateRequest(BaseModel):
    """Request body for creating an organization"""
    code: str
    name: str
    description: Optional[str] = None
    pic_name: Optional[str] = None
    pic_email: Optional[str] = None
    pic_phone: Optional[str] = None


class OrganizationUpdateRequest(BaseModel):
    """Request body for updating an organization"""
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


# ─── Organization Endpoints ────────────────────────────────────────────────────

@router.get("/organizations")
async def list_organizations(active_only: bool = True):
    """Get all organizations"""
    try:
        data = await supabase_client.get_organizations(active_only=active_only)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/organizations")
async def create_organization(body: OrganizationCreateRequest):
    """Create a new organization"""
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

        result = await supabase_client.create_organization(insert_data)
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


@router.put("/organizations/{org_id}")
async def update_organization(org_id: str, body: OrganizationUpdateRequest):
    """Update an existing organization"""
    try:
        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Tidak ada data yang diperbarui")

        success = await supabase_client.update_organization(org_id, update_data)
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


@router.delete("/organizations/{org_id}")
async def delete_organization(org_id: str):
    """Delete an organization"""
    try:
        await supabase_client.delete_organization(org_id)
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

@router.get("/organizations/{org_id}/departments")
async def list_departments(org_id: str, active_only: bool = True):
    """Get departments belonging to an organization"""
    try:
        data = await supabase_client.get_departments(org_id=org_id, active_only=active_only)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/organizations/{org_id}/departments")
async def create_department(org_id: str, body: DepartmentCreateRequest):
    """Create a new department under an organization"""
    try:
        # Verify organization exists
        org = await supabase_client.get_organization_by_id(org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organisasi tidak ditemukan")

        insert_data = {
            "organization_id": org_id,
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



@router.post("/organizations/migrate-employees")
async def migrate_employees_to_org_id():
    """
    One-time migration: match employees' organization_name text field
    to the organizations table and set organization_id FK.
    """
    try:
        if not supabase_client.client:
            raise HTTPException(status_code=503, detail="Database tidak tersedia")

        # Fetch all organizations for name matching
        orgs = await supabase_client.get_organizations(active_only=False)
        org_lookup = {o["name"].strip().lower(): o["id"] for o in orgs if o.get("name")}

        # Fetch employees that still have organization_name but no organization_id
        emp_res = supabase_client.client.table("employees") \
            .select("id, organization_name, organization_id") \
            .execute()

        migrated = 0
        skipped = 0
        unmatched = []

        for emp in emp_res.data:
            # Skip if already has organization_id
            if emp.get("organization_id"):
                skipped += 1
                continue

            org_name = (emp.get("organization_name") or "").strip().lower()
            if not org_name:
                skipped += 1
                continue

            matched_org_id = org_lookup.get(org_name)
            if matched_org_id:
                supabase_client.client.table("employees") \
                    .update({"organization_id": matched_org_id}) \
                    .eq("id", emp["id"]) \
                    .execute()
                migrated += 1
            else:
                unmatched.append(emp.get("organization_name", ""))

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
