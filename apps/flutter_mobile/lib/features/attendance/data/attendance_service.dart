import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/utils/constants.dart';

class AttendanceService {
  // Use local backend URL or production URL
  // If running locally on emulator, 10.0.2.2 usually maps to localhost
  static String baseUrl = AppConstants.apiUrl; 

  Future<Map<String, dynamic>> submitAttendance({
    required String employeeId,
    required double latitude,
    required double longitude,
    required String clockType,
    required String notes,
    required String photoPath,
  }) async {
    try {
      final session = Supabase.instance.client.auth.currentSession;
      final token = session?.accessToken ?? '';
      
      String photoBase64 = '';
      if (photoPath.isNotEmpty) {
        final fileBytes = await File(photoPath).readAsBytes();
        photoBase64 = base64Encode(fileBytes);
      }

      final url = Uri.parse('$baseUrl/attendance/check-in');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'employee_id': employeeId,
          'latitude': latitude,
          'longitude': longitude,
          'clock_type': clockType,
          'notes': notes,
          'photo_base64': photoBase64,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'status': 'success', 'data': jsonDecode(response.body)};
      } else {
        final body = jsonDecode(response.body);
        return {'status': body['status'] ?? 'error', 'message': body['message'] ?? 'Gagal absensi'};
      }
    } catch (e) {
      return {'status': 'error', 'message': 'Gagal terhubung ke server: $e'};
    }
  }
}
