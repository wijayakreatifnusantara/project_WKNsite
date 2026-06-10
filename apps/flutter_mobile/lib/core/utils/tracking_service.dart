import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class TrackingService {
  static Timer? _trackingTimer;
  static bool _isTracking = false;

  static Future<void> startTracking() async {
    if (_isTracking) return;
    
    // Check if permission is granted
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      debugPrint('Location permission not granted. Cannot start tracking.');
      return;
    }

    _isTracking = true;
    debugPrint('Tracking Service Started');
    
    // Initial ping
    _pingLocation();

    // Ping every 30 seconds
    _trackingTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _pingLocation();
    });
  }

  static void stopTracking() {
    _trackingTimer?.cancel();
    _trackingTimer = null;
    _isTracking = false;
    debugPrint('Tracking Service Stopped');
  }

  static Future<void> _pingLocation() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      if (token == null) return;

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final response = await http.post(
        Uri.parse('${AppConstants.apiUrl}/tracking/ping'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'lat': position.latitude,
          'lng': position.longitude,
        }),
      );

      if (response.statusCode == 200) {
        debugPrint('Location ping successful');
      } else {
        debugPrint('Location ping failed: ${response.body}');
      }
    } catch (e) {
      debugPrint('Error pinging location: $e');
    }
  }
}
