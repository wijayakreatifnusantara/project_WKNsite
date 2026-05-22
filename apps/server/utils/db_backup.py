import os
import json
import zipfile
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from utils.supabase_client import supabase_client
from utils.audit_logger import audit_logger

BACKUPS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")

# Define target tables for backup
TABLES = [
    "employees",
    "profiles",
    "attendance",
    "organizations",
    "departments",
    "positions",
    "system_configs",
    "role_permissions",
    "audit_logs",
    "assets",
    "asset_assignments",
    "documents",
    "leave_requests",
    "payroll_history",
    "kpi_metrics",
    "performance_reviews"
]

async def fetch_table_data(table_name: str) -> List[Dict[str, Any]]:
    """
    Fetch all rows from a Supabase table using pagination to handle large tables.
    """
    if not supabase_client.client:
        raise Exception("Supabase client is not initialized")
    
    all_data = []
    page = 0
    page_size = 1000
    
    while True:
        start = page * page_size
        end = start + page_size - 1
        
        # Paginate results
        res = supabase_client.client.table(table_name).select("*").range(start, end).execute()
        data = res.data
        
        if not data:
            break
            
        all_data.extend(data)
        
        if len(data) < page_size:
            break
            
        page += 1
        
    return all_data

async def run_backup_job(initiated_by: str = "system") -> Dict[str, Any]:
    """
    Export all table data to JSON files and pack them into a compressed ZIP file.
    Also handles retention policy by cleaning up older backups.
    """
    os.makedirs(BACKUPS_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"wkn_backup_{timestamp}.zip"
    zip_path = os.path.join(BACKUPS_DIR, zip_filename)
    
    metadata = {
        "backup_name": zip_filename,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "initiated_by": initiated_by,
        "tables_included": [],
        "table_row_counts": {},
        "status": "success"
    }
    
    try:
        # Create ZIP archive in write mode
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for table in TABLES:
                try:
                    data = await fetch_table_data(table)
                    metadata["tables_included"].append(table)
                    metadata["table_row_counts"][table] = len(data)
                    
                    # Convert to pretty-printed JSON and write directly to ZIP
                    json_str = json.dumps(data, indent=2, default=str)
                    zip_file.writestr(f"{table}.json", json_str)
                    
                except Exception as table_err:
                    print(f"Skipping table '{table}' due to error: {table_err}")
                    metadata["table_row_counts"][table] = f"error: {str(table_err)}"
            
            # Write metadata file into ZIP
            meta_str = json.dumps(metadata, indent=2)
            zip_file.writestr("metadata.json", meta_str)
            
        # Get file size
        file_size = os.path.getsize(zip_path)
        metadata["file_size_bytes"] = file_size
        metadata["file_size_formatted"] = format_size(file_size)
        
        # Log to Audit Logs (async background task)
        # Note: we need a user ID for logging. 
        # If initiated by system, user_id is 'system_job'. 
        # If manual, we will pass the admin's email or ID from the request context.
        user_id = initiated_by if "@" in initiated_by or initiated_by == "system" else f"admin_{initiated_by}"
        await audit_logger.log_action(
            user_id=user_id,
            action="BACKUP",
            module="Database",
            entity_id=zip_filename,
            new_data={
                "tables": metadata["tables_included"],
                "counts": metadata["table_row_counts"],
                "size": metadata["file_size_formatted"]
            }
        )
        
        # Update last backup stat in system configs
        await update_last_backup_config(metadata)
        
        # Run retention clean up
        await clean_old_backups()
        
        return {
            "success": True,
            "filename": zip_filename,
            "size": metadata["file_size_formatted"],
            "tables": len(metadata["tables_included"])
        }
        
    except Exception as e:
        # Clean up partial file if exists
        if os.path.exists(zip_path):
            try:
                os.remove(zip_path)
            except Exception:
                pass
                
        err_msg = f"Backup failed: {str(e)}"
        print(err_msg)
        
        # Log failure
        await audit_logger.log_action(
            user_id=initiated_by,
            action="BACKUP_FAILED",
            module="Database",
            entity_id=zip_filename if 'zip_filename' in locals() else "unknown",
            new_data={"error": err_msg}
        )
        
        return {
            "success": False,
            "error": err_msg
        }

def format_size(bytes_size: int) -> str:
    """Format bytes size into human readable string."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"

async def update_last_backup_config(backup_meta: dict):
    """Save the metadata of the last successful backup in system_configs."""
    try:
        # Load existing config
        current_config = await supabase_client.get_system_config("backup_settings")
        if not current_config or not isinstance(current_config, dict):
            current_config = {"auto_backup": True, "retention_days": 30}
            
        current_config["last_backup_time"] = backup_meta["created_at"]
        current_config["last_backup_name"] = backup_meta["backup_name"]
        current_config["last_backup_size"] = backup_meta["file_size_formatted"]
        
        await supabase_client.set_system_config("backup_settings", current_config)
    except Exception as e:
        print(f"Error updating backup config metadata: {e}")

async def clean_old_backups():
    """Delete backups that exceed the retention configuration period (default 30 days)."""
    try:
        config = await supabase_client.get_system_config("backup_settings")
        retention_days = 30
        if config and isinstance(config, dict):
            # Parse logs_retention/retention_days, support both toggle states
            # If logs_retention is active, use 30 days retention.
            # In Settings page: "Logs Retention: Purge history older than 30 days"
            logs_retention = config.get("logs_retention", True)
            if not logs_retention:
                # If retention toggle is disabled, we don't auto-delete
                return
            retention_days = int(config.get("retention_days", 30))
            
        cutoff = datetime.now() - timedelta(days=retention_days)
        
        if not os.path.exists(BACKUPS_DIR):
            return
            
        for file in os.listdir(BACKUPS_DIR):
            if file.startswith("wkn_backup_") and file.endswith(".zip"):
                file_path = os.path.join(BACKUPS_DIR, file)
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                if file_time < cutoff:
                    os.remove(file_path)
                    print(f"Purged expired backup: {file}")
                    
                    # Log audit event for purge
                    await audit_logger.log_action(
                        user_id="system_retention",
                        action="PURGE",
                        module="Database",
                        entity_id=file,
                        new_data={"reason": f"Older than {retention_days} days retention limit"}
                    )
    except Exception as e:
        print(f"Error during backup retention clean up: {e}")

def get_backups_list() -> List[Dict[str, Any]]:
    """
    List all available database backup files with their metadata.
    """
    backups = []
    if not os.path.exists(BACKUPS_DIR):
        return backups
        
    for file in os.listdir(BACKUPS_DIR):
        if file.startswith("wkn_backup_") and file.endswith(".zip"):
            file_path = os.path.join(BACKUPS_DIR, file)
            stats = os.stat(file_path)
            
            # Try to read metadata from inside ZIP if possible
            initiated_by = "system"
            created_at = datetime.fromtimestamp(stats.st_mtime, tz=timezone.utc).isoformat()
            
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_file:
                    if "metadata.json" in zip_file.namelist():
                        meta_data = json.loads(zip_file.read("metadata.json").decode("utf-8"))
                        initiated_by = meta_data.get("initiated_by", "system")
                        created_at = meta_data.get("created_at", created_at)
            except Exception:
                pass # fallback to stats mtime
                
            backups.append({
                "filename": file,
                "size": format_size(stats.st_size),
                "size_bytes": stats.st_size,
                "created_at": created_at,
                "initiated_by": initiated_by
            })
            
    # Sort backups by date, newest first
    backups.sort(key=lambda x: x["created_at"], reverse=True)
    return backups

async def start_backup_scheduler():
    """
    Asynchronous loop running in the background.
    Triggers automatic backup at 02:00 AM if auto_backup config is enabled.
    """
    print("Database backup scheduler background task started.")
    last_run_date = None
    
    while True:
        try:
            now = datetime.now()
            # Run at 02:00 AM
            if now.hour == 2 and now.minute == 0:
                current_date = now.date()
                if last_run_date != current_date:
                    # Fetch configuration
                    config = await supabase_client.get_system_config("backup_settings")
                    auto_backup = True
                    if config and isinstance(config, dict):
                        auto_backup = config.get("auto_backup", True)
                        
                    if auto_backup:
                        print(f"Triggering scheduled daily database backup at {now.isoformat()}")
                        # Execute in background task so it doesn't block the loop
                        asyncio.create_task(run_backup_job(initiated_by="system"))
                        last_run_date = current_date
                        
        except Exception as e:
            print(f"Error in backup scheduler loop: {e}")
            
        await asyncio.sleep(30) # Check every 30 seconds
