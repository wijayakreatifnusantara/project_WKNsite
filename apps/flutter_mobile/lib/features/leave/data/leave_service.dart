import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/utils/constants.dart';
import 'leave_model.dart';

class LeaveService {
  static String baseUrl = AppConstants.apiUrl; 

  Future<List<LeaveRequest>> getMyRequests(String employeeId) async {
    try {
      final token = Supabase.instance.client.auth.currentSession?.accessToken;
      final response = await http.get(
        Uri.parse('$baseUrl/leave/my-requests'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        final List<dynamic> data = body['data'] ?? [];
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('cached_leaves', response.body);
        
        return data.map((json) => LeaveRequest.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load leaves');
      }
    } catch (e) {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('cached_leaves');
      if (cached != null) {
        List<dynamic> data = jsonDecode(cached);
        return data.map((json) => LeaveRequest.fromJson(json)).toList();
      }
      return [];
    }
  }

  Future<Map<String, dynamic>> submitLeaveRequest(Map<String, dynamic> payload) async {
    try {
      final token = Supabase.instance.client.auth.currentSession?.accessToken;
      final response = await http.post(
        Uri.parse('$baseUrl/leave/request'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'status': 'success'};
      } else {
        final body = jsonDecode(response.body);
        return {'status': 'error', 'message': body['message'] ?? 'Gagal mengajukan izin/cuti'};
      }
    } catch (e) {
      return {'status': 'error', 'message': 'Kesalahan jaringan: $e'};
    }
  }
}
