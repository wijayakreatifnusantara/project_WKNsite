import os
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import FileResponse
from typing import Dict, Any, List
from utils.jwt_handler import require_admin
from utils.supabase_client import supabase_client
from utils.db_backup import (
    run_backup_job,
    get_backups_list,
    BACKUPS_DIR,
    TABLES
)
from utils.audit_logger import audit_logger

router = APIRouter()

DEFAULT_SETTINGS = {
    "general": {
        "system_name": "WKN Corporate CMS",
        "tagline": "Intelligent Ecosystem",
        "maintenance_mode": False,
        "debug_mode": True
    },
    "security": {
        "session_timeout": 60,
        "password_expiry": True,
        "two_factor": False,
        "ip_restriction": False,
        "max_login_attempts": 5
    },
    "notifications": {
        "smtp_server": "smtp.gmail.com",
        "smtp_port": "465",
        "system_email": "no-reply@wijayakn.com",
        "wa_api_instance": "INST-8890",
        "wa_token": "••••••••••••••••",
        "wa_webhooks": True
    },
    "network": {
        "cdn_acceleration": True
    },
    "database": {
        "auto_backup": True,
        "logs_retention": True,
        "retention_days": 30
    }
}

@router.get("/database/settings")
async def get_settings(current_user: dict = Depends(require_admin)):
    """
    Fetch all system configuration settings including general, security, notification,
    network, and backup settings. Merges with defaults if not configured yet.
    """
    try:
        # Load main settings
        settings = await supabase_client.get_system_config("system_settings")
        if not settings or not isinstance(settings, dict):
            settings = DEFAULT_SETTINGS.copy()
            
        # Ensure deep nesting structure is complete
        for section, values in DEFAULT_SETTINGS.items():
            if section not in settings:
                settings[section] = values
            else:
                for k, v in values.items():
                    if k not in settings[section]:
                        settings[section][k] = v
                        
        # Load last backup details from backup_settings config
        backup_config = await supabase_client.get_system_config("backup_settings")
        if backup_config and isinstance(backup_config, dict):
            settings["database"]["last_backup_time"] = backup_config.get("last_backup_time")
            settings["database"]["last_backup_name"] = backup_config.get("last_backup_name")
            settings["database"]["last_backup_size"] = backup_config.get("last_backup_size")
        else:
            settings["database"]["last_backup_time"] = None
            settings["database"]["last_backup_name"] = None
            settings["database"]["last_backup_size"] = None
            
        return settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve system settings: {str(e)}"
        )

@router.post("/database/settings")
async def save_settings(payload: Dict[str, Any], current_user: dict = Depends(require_admin)):
    """
    Save all system configuration settings and update the separate backup scheduler settings.
    """
    try:
        # Update system settings in db
        success = await supabase_client.set_system_config("system_settings", payload)
        if not success:
            raise Exception("Failed to write system settings to database.")
            
        # Update separate backup_settings config table for the background scheduler process
        db_settings = payload.get("database", {})
        
        # Load existing backup stats to prevent overwriting them
        existing_backup_config = await supabase_client.get_system_config("backup_settings")
        backup_config = {}
        if existing_backup_config and isinstance(existing_backup_config, dict):
            backup_config = existing_backup_config.copy()
            
        backup_config.update({
            "auto_backup": db_settings.get("auto_backup", True),
            "logs_retention": db_settings.get("logs_retention", True),
            "retention_days": int(db_settings.get("retention_days", 30))
        })
        
        await supabase_client.set_system_config("backup_settings", backup_config)
        
        # Log to Audit Logs
        await audit_logger.log_action(
            user_id=current_user["username"],
            action="UPDATE",
            module="Settings",
            entity_id="system_settings",
            new_data={"updated_sections": list(payload.keys())}
        )
        
        return {"status": "success", "message": "System settings saved successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save system settings: {str(e)}"
        )

@router.post("/database/backup")
async def trigger_manual_backup(current_user: dict = Depends(require_admin)):
    """
    Trigger an immediate, manual backup of the database.
    """
    try:
        # Run backup job with initiator set to user's username
        result = await run_backup_job(initiated_by=current_user["username"])
        if not result.get("success"):
            raise Exception(result.get("error", "Unknown backup error"))
            
        return {
            "status": "success",
            "message": "Manual backup completed successfully",
            "details": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Manual backup failed: {str(e)}"
        )

@router.get("/database/backups")
async def get_backups(current_user: dict = Depends(require_admin)):
    """
    Get lists of all completed database backups saved on disk.
    """
    try:
        backups = get_backups_list()
        return backups
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve backups: {str(e)}"
        )

@router.get("/database/backups/{filename}")
async def download_backup(filename: str, current_user: dict = Depends(require_admin)):
    """
    Securely download a specific database backup file.
    Includes security checks to prevent directory traversal.
    """
    # Prevent Directory Traversal Attacks
    safe_filename = os.path.basename(filename)
    if safe_filename != filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename path traversal detected"
        )
        
    file_path = os.path.join(BACKUPS_DIR, safe_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup file does not exist"
        )
        
    try:
        # Audit download action
        await audit_logger.log_action(
            user_id=current_user["username"],
            action="DOWNLOAD",
            module="Database",
            entity_id=safe_filename
        )
        
        return FileResponse(
            path=file_path,
            filename=safe_filename,
            media_type="application/zip"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download backup: {str(e)}"
        )

@router.delete("/database/backups/{filename}")
async def delete_backup(filename: str, current_user: dict = Depends(require_admin)):
    """
    Delete a specific database backup file from disk.
    """
    # Prevent Directory Traversal Attacks
    safe_filename = os.path.basename(filename)
    if safe_filename != filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
        
    file_path = os.path.join(BACKUPS_DIR, safe_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup file does not exist"
        )
        
    try:
        os.remove(file_path)
        
        # Log to Audit Logs
        await audit_logger.log_action(
            user_id=current_user["username"],
            action="DELETE",
            module="Database",
            entity_id=safe_filename,
            new_data={"reason": "Manual administrative deletion"}
        )
        
        return {"status": "success", "message": f"Backup file {safe_filename} has been deleted"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete backup file: {str(e)}"
        )
