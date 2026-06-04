import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/utils/constants.dart';
import 'payslip_model.dart';

class PayslipService {
  static String baseUrl = AppConstants.apiUrl;
  final _supabase = Supabase.instance.client;

  Future<Map<String, dynamic>> getMySalaryApi() async {
    try {
      final token = _supabase.auth.currentSession?.accessToken;
      final response = await http.get(
        Uri.parse('$baseUrl/payroll/my-salary'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        }
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['status'] == 'success') {
          return {
            'salary': SalaryData.fromJson(body['data']['salary'] ?? {}),
            'template': CompanyTemplate.fromJson(body['data']['template'] ?? {})
          };
        }
      }
      throw Exception('Format respons API tidak valid');
    } catch (e) {
      throw Exception('Gagal memuat slip gaji dari API: $e');
    }
  }

  Future<SalaryData?> getSalaryDetailsSupabase(String employeeId) async {
    try {
      final data = await _supabase
          .from('employee_salaries')
          .select('*')
          .eq('employee_id', employeeId)
          .maybeSingle();
      
      if (data != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('cached_salary', jsonEncode(data));
        return SalaryData.fromJson(data);
      }
      return null;
    } catch (e) {
      // Fallback to cache
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('cached_salary');
      if (cached != null) {
        return SalaryData.fromJson(jsonDecode(cached));
      }
      return null;
    }
  }

  Future<Map<String, dynamic>> submitSalaryCorrection(String period, String reason) async {
    try {
      final token = _supabase.auth.currentSession?.accessToken;
      final response = await http.post(
        Uri.parse('$baseUrl/submissions/salary-correction'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'period': period,
          'reason': reason,
        }),
      );
      
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['status'] == 'success') {
        return {'status': 'success'};
      } else {
        return {'status': 'error', 'message': body['message'] ?? 'Gagal mengirim pengajuan'};
      }
    } catch (e) {
      return {'status': 'error', 'message': 'Kesalahan jaringan: $e'};
    }
  }
}
