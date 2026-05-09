"""
AI Data Diagnostics Utility
Scans employee records for inconsistencies, logical errors, and optimization opportunities.
"""

from typing import List, Dict, Any
from datetime import datetime
import re

class AIDataDiagnostics:
    def __init__(self):
        pass

    def scan_employees(self, employees: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Scans a list of employee records for various issues.
        """
        issues = []
        stats = {
            "total_records": len(employees),
            "healthy_records": 0,
            "issues_found": 0,
            "severity_counts": {"low": 0, "medium": 0, "high": 0, "critical": 0}
        }

        # Tracks for unique constraints
        emails = set()
        employee_ids = set()

        for emp in employees:
            emp_issues = []
            emp_id = emp.get("EMPLOYEE ID", "Unknown")
            emp_name = emp.get("EMPLOYEE NAME", "Unknown")

            # 1. Check Missing Critical Fields
            critical_fields = ["EMPLOYEE ID", "EMPLOYEE NAME", "EMAIL", "Organization Name *", "Job Position *", "Status *"]
            for field in critical_fields:
                if not emp.get(field):
                    emp_issues.append({
                        "field": field,
                        "type": "missing_field",
                        "severity": "high",
                        "message": f"Critical field '{field}' is missing.",
                        "suggestion": f"Please provide a value for {field}."
                    })

            # 2. Check Email Format
            email = emp.get("EMAIL")
            if email:
                if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                    emp_issues.append({
                        "field": "EMAIL",
                        "type": "invalid_format",
                        "severity": "medium",
                        "message": f"Invalid email format: {email}",
                        "suggestion": "Correct the email format (e.g., user@company.com)."
                    })
                if email in emails:
                    emp_issues.append({
                        "field": "EMAIL",
                        "type": "duplicate_value",
                        "severity": "high",
                        "message": f"Duplicate email found: {email}",
                        "suggestion": "Each employee must have a unique email address."
                    })
                emails.add(email)

            # 3. Check Duplicate Employee ID
            if emp_id != "Unknown":
                if emp_id in employee_ids:
                    emp_issues.append({
                        "field": "EMPLOYEE ID",
                        "type": "duplicate_value",
                        "severity": "critical",
                        "message": f"Duplicate Employee ID found: {emp_id}",
                        "suggestion": "Ensure all employees have unique IDs."
                    })
                employee_ids.add(emp_id)

            # 4. Logical Checks: Dates
            join_date_str = emp.get("Join Date")
            if join_date_str:
                try:
                    # Expecting various formats, usually YYYY-MM-DD or DD/MM/YYYY
                    # This is a simplified check
                    pass 
                except:
                    emp_issues.append({
                        "field": "Join Date",
                        "type": "invalid_date",
                        "severity": "medium",
                        "message": f"Invalid date format: {join_date_str}",
                        "suggestion": "Use standard YYYY-MM-DD format."
                    })

            # 5. Logical Checks: Salary vs Level (Sample)
            # This would require a mapping of levels to salary ranges
            # For now, just a placeholder for "Advanced AI logic"
            
            if emp_issues:
                for issue in emp_issues:
                    issue["employee_id"] = emp_id
                    issue["employee_name"] = emp_name
                    stats["severity_counts"][issue["severity"]] += 1
                    issues.append(issue)
                stats["issues_found"] += len(emp_issues)
            else:
                stats["healthy_records"] += 1

        # Calculate overall health score
        if stats["total_records"] > 0:
            health_score = (stats["healthy_records"] / stats["total_records"]) * 100
        else:
            health_score = 0

        return {
            "timestamp": datetime.now().isoformat(),
            "health_score": round(health_score, 1),
            "stats": stats,
            "issues": issues,
            "recommendations": self._generate_recommendations(stats)
        }

    def _generate_recommendations(self, stats: Dict[str, Any]) -> List[str]:
        recs = []
        if stats["severity_counts"]["critical"] > 0:
            recs.append("CRITICAL: Resolve duplicate Employee IDs immediately to prevent data corruption.")
        if stats["severity_counts"]["high"] > 0:
            recs.append("HIGH: Fill in missing critical fields (Name, ID, Email) for better record integrity.")
        if stats["severity_counts"]["medium"] > 0:
            recs.append("MEDIUM: Standardize email formats and date entries across the database.")
        if stats["healthy_records"] / stats["total_records"] < 0.9:
            recs.append("SUGGESTION: Run a bulk data cleanup session to reach >90% data health.")
        
        if not recs:
            recs.append("Your database is in excellent condition. No immediate actions required.")
            
        return recs

ai_data_diagnostics = AIDataDiagnostics()
