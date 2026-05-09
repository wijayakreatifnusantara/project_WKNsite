from typing import Any, Optional, Dict
from datetime import datetime
from utils.supabase_client import supabase_client

class AuditLogger:
    @staticmethod
    async def log_action(
        user_id: str,
        action: str,  # CREATE, UPDATE, DELETE, LOGIN
        module: str,  # Employees, Assets, Payroll, etc.
        entity_id: Optional[str] = None,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        """
        Record an administrative action to the audit_logs table
        """
        try:
            log_entry = {
                "user_id": user_id,
                "action": action,
                "module": module,
                "entity_id": entity_id,
                "old_data": old_data,
                "new_data": new_data,
                "ip_address": ip_address,
                "created_at": datetime.utcnow().isoformat()
            }
            
            supabase_client.client.table("audit_logs").insert(log_entry).execute()
            print(f"Audit Log Created: {action} on {module}")
            return True
        except Exception as e:
            print(f"Failed to create Audit Log: {e}")
            return False

audit_logger = AuditLogger()
