from datetime import datetime, timedelta
from typing import List

def calculate_working_days(start_date: str, end_date: str) -> int:
    """
    Calculate number of working days between two dates, excluding weekends.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    day_count = 0
    current = start
    while current <= end:
        if current.weekday() < 5:  # 0-4 are Mon-Fri
            day_count += 1
        current += timedelta(days=1)
        
    return day_count
