from datetime import datetime, time, timedelta
from typing import Dict, Any, Optional

def calculate_attendance_metrics(clock_in: Optional[datetime], clock_out: Optional[datetime]) -> Dict[str, Any]:
    """
    Calculate late minutes and overtime based on shift rules.
    Shift: 08:00 AM - 05:00 PM
    Grace Period: 5 minutes
    """
    SHIFT_START = time(8, 0)
    SHIFT_END = time(17, 0)
    GRACE_PERIOD = 5
    
    metrics = {
        "late_minutes": 0,
        "overtime_minutes": 0,
        "status": "Absent"
    }
    
    if not clock_in:
        return metrics
    
    # Check for Late
    in_time = clock_in.time()
    if in_time > SHIFT_START:
        diff = datetime.combine(datetime.today(), in_time) - datetime.combine(datetime.today(), SHIFT_START)
        late_mins = int(diff.total_seconds() / 60)
        metrics["late_minutes"] = late_mins
        metrics["status"] = "Late" if late_mins > GRACE_PERIOD else "Present"
    else:
        metrics["status"] = "Present"
        
    # Check for Overtime
    if clock_out:
        out_time = clock_out.time()
        if out_time > SHIFT_END:
            diff_ot = datetime.combine(datetime.today(), out_time) - datetime.combine(datetime.today(), SHIFT_END)
            ot_mins = int(diff_ot.total_seconds() / 60)
            # Threshold: Only count if OT > 60 mins
            if ot_mins >= 60:
                metrics["overtime_minutes"] = ot_mins
                
    return metrics
