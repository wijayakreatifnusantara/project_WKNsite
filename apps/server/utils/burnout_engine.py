from typing import Dict, Any
from datetime import datetime, timedelta
from utils.supabase_client import supabase_client

class BurnoutEngine:
    @staticmethod
    async def analyze_risk(employee_id: str) -> Dict[str, Any]:
        """
        Aggregate workforce data to calculate burnout risk score (0-100)
        """
        try:
            risk_score = 0
            factors = []
            
            # 1. Analyze Attendance (Last 30 Days)
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            attendance_res = supabase_client.client.table("attendance") \
                .select("status") \
                .eq("employee_id", employee_id) \
                .gte("date", thirty_days_ago) \
                .execute()
            
            late_count = sum(1 for a in attendance_res.data if a["status"] == "Late")
            if late_count > 5:
                points = min(late_count * 5, 30)
                risk_score += points
                factors.append({"factor": "Attendance Irregularity", "impact": "High", "desc": f"Detected {late_count} late arrivals in 30 days."})
            elif late_count > 2:
                risk_score += 10
                factors.append({"factor": "Attendance Irregularity", "impact": "Low", "desc": f"Detected {late_count} late arrivals."})

            # 2. Analyze Performance Volatility
            reviews_res = supabase_client.client.table("performance_reviews") \
                .select("total_score") \
                .eq("employee_id", employee_id) \
                .order("created_at", desc=True) \
                .limit(2) \
                .execute()
            
            if len(reviews_res.data) >= 2:
                latest = float(reviews_res.data[0]["total_score"])
                previous = float(reviews_res.data[1]["total_score"])
                drop = previous - latest
                if drop > 0.5:
                    risk_score += 40
                    factors.append({"factor": "Performance Drop", "impact": "Critical", "desc": f"Performance score dropped by {drop:.1f} points."})
                elif drop > 0.2:
                    risk_score += 15
                    factors.append({"factor": "Performance Volatility", "impact": "Medium", "desc": f"Performance score showing downward trend."})

            # 3. Analyze Leave (Burnout Prevention)
            # Check if employee has taken leave in the last 90 days
            ninety_days_ago = (datetime.now() - timedelta(days=90)).isoformat()
            leave_res = supabase_client.client.table("leave_requests") \
                .select("id") \
                .eq("employee_id", employee_id) \
                .eq("status", "Approved") \
                .gte("start_date", ninety_days_ago) \
                .execute()
            
            if len(leave_res.data) == 0:
                risk_score += 20
                factors.append({"factor": "Leave Deprivation", "impact": "High", "desc": "No approved leave taken in the last 90 days."})

            # Determine Risk Level
            level = "Low"
            color = "emerald"
            if risk_score > 60:
                level = "High"
                color = "rose"
            elif risk_score > 30:
                level = "Medium"
                color = "amber"

            return {
                "employee_id": employee_id,
                "risk_score": min(risk_score, 100),
                "level": level,
                "color": color,
                "factors": factors,
                "generated_at": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error in BurnoutEngine: {e}")
            return {"error": str(e)}

burnout_engine = BurnoutEngine()
