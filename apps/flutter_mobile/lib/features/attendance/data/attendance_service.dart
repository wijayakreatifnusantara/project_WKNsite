import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/utils/constants.dart';

class AttendanceService {
  // Use local backend URL or production URL
  // If running locally on emulator, 10.0.2.2 usually maps to localhost
  static String baseUrl = AppConstants.apiUrl; 

  Future<Map<String, dynamic>> getAttendanceSettings() async {
    try {
      final session = Supabase.instance.client.auth.currentSession;
      final token = session?.accessToken ?? '';
      
      final url = Uri.parse('$baseUrl/attendance/settings');
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return {'status': 'success', 'data': jsonDecode(response.body)['data']};
      } else {
        return {'status': 'error', 'message': 'Gagal mengambil konfigurasi lokasi'};
      }
    } catch (e) {
      return {'status': 'error', 'message': 'Gagal terhubung ke server: $e'};
    }
  }

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
        final body = jsonDecode(response.body);
        if (body['status'] == 'success') {
          return {'status': 'success', 'data': body['data'] ?? body};
        } else {
          // Backend returned 200 but status is 'out_of_range' or 'already_checked_in' etc.
          String errorMsg = 'Gagal absensi';
          if (body['data'] != null && body['data']['message'] != null) {
            errorMsg = body['data']['message'];
          } else if (body['message'] != null) {
            errorMsg = body['message'];
          }
          return {'status': body['status'] ?? 'error', 'message': errorMsg};
        }
      } else {
        final body = jsonDecode(response.body);
        return {'status': body['status'] ?? 'error', 'message': body['message'] ?? body['detail'] ?? 'Gagal absensi'};
      }
    } catch (e) {
      return {'status': 'error', 'message': 'Gagal terhubung ke server: $e'};
    }
  }
}
