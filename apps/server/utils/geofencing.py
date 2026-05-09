"""
Geofencing Engine for WKNsite Attendance System
T005, T006: Haversine distance calculation and radius validation
"""
import math
from typing import Optional


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two GPS coordinates using the Haversine formula.
    
    Args:
        lat1, lon1: Latitude and longitude of point 1 (in decimal degrees)
        lat2, lon2: Latitude and longitude of point 2 (in decimal degrees)
    
    Returns:
        Distance in meters (accuracy within 0.3% for short distances)
    """
    R = 6371000  # Earth's radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c  # Distance in meters


def is_within_radius(
    user_lat: float,
    user_lon: float,
    target_lat: float,
    target_lon: float,
    radius: float = 100.0,
) -> tuple[bool, float]:
    """
    Check whether a user's GPS location is within the allowed radius of a target location.
    
    Args:
        user_lat, user_lon: User's current GPS coordinates
        target_lat, target_lon: Target location GPS coordinates (HQ or assigned site)
        radius: Allowed radius in meters (default: 100m)
    
    Returns:
        Tuple of (is_within: bool, distance_meters: float)
    """
    if target_lat is None or target_lon is None:
        # If no target is defined, deny check-in
        return False, float('inf')

    distance = haversine_distance(user_lat, user_lon, target_lat, target_lon)
    return distance <= radius, round(distance, 1)


def calculate_late_minutes(check_in_time_str: str, cutoff_hour: int = 8, cutoff_minute: int = 30) -> int:
    """
    Calculate how many minutes late an employee is.
    
    Args:
        check_in_time_str: ISO format time string (e.g., "2026-05-09T08:45:00+07:00")
        cutoff_hour: Hour threshold for "on time" (default: 8 = 08:xx)
        cutoff_minute: Minute threshold for "on time" (default: 30 = xx:30)
    
    Returns:
        Minutes late (0 if on time or early)
    """
    from datetime import datetime, timezone, timedelta
    
    try:
        # Parse ISO format datetime
        if '+' in check_in_time_str or check_in_time_str.endswith('Z'):
            dt = datetime.fromisoformat(check_in_time_str.replace('Z', '+00:00'))
        else:
            dt = datetime.fromisoformat(check_in_time_str)
        
        # Convert to local time (WIB = UTC+7)
        wib = timezone(timedelta(hours=7))
        dt_local = dt.astimezone(wib)
        
        # Create cutoff time for today
        cutoff = dt_local.replace(hour=cutoff_hour, minute=cutoff_minute, second=0, microsecond=0)
        
        if dt_local > cutoff:
            delta = dt_local - cutoff
            return int(delta.total_seconds() / 60)
        return 0
    except Exception:
        return 0
