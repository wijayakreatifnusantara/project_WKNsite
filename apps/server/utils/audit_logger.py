import uuid
from typing import Any, Optional, Dict
from datetime import datetime
from utils.supabase_client import supabase_client

def is_valid_uuid(val: Any) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

class AuditLogger:
    @staticmethod
    async def log_action(
        user_id: str,
        action: str,  # CREATE, UPDATE, DELETE, LOGIN, BACKUP
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
            resolved_user_id = None
            if user_id:
                if is_valid_uuid(user_id):
                    resolved_user_id = user_id
                else:
                    # Attempt to resolve username/email to UUID using profiles table
                    try:
                        res = supabase_client.client.table("profiles").select("id").eq("username", user_id).execute()
                        if res.data:
                            resolved_user_id = res.data[0].get("id")
                    except Exception as lookup_err:
                        print(f"Error looking up user UUID for {user_id}: {lookup_err}")

            # Fallback if cannot be resolved (e.g. system jobs or manual triggers with custom scripts)
            if not resolved_user_id:
                try:
                    # 1. Try to find the authorized default admin
                    res = supabase_client.client.table("profiles").select("id").eq("username", "adianto@wijayakn.com").execute()
                    if res.data:
                        resolved_user_id = res.data[0].get("id")
                    else:
                        # 2. Try to find any admin
                        res = supabase_client.client.table("profiles").select("id").eq("role", "admin").limit(1).execute()
                        if res.data:
                            resolved_user_id = res.data[0].get("id")
                        else:
                            # 3. Fallback to any valid profile
                            res = supabase_client.client.table("profiles").select("id").limit(1).execute()
                            if res.data:
                                resolved_user_id = res.data[0].get("id")
                except Exception as fb_err:
                    print(f"Error fetching fallback user UUID: {fb_err}")

            log_entry = {
                "user_id": resolved_user_id,
                "action": action,
                "module": module,
                "entity_id": entity_id,
                "old_data": old_data,
                "new_data": new_data,
                "ip_address": ip_address,
                "created_at": datetime.utcnow().isoformat()
            }
            
            supabase_client.client.table("audit_logs").insert(log_entry).execute()
            print(f"Audit Log Created: {action} on {module} for user {user_id} (UUID: {resolved_user_id})")
            return True
        except Exception as e:
            print(f"Failed to create Audit Log for {user_id}: {e}")
            return False

audit_logger = AuditLogger()

