import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/utils/constants.dart';
import 'overtime_model.dart';

class OvertimeService {
  final _supabase = Supabase.instance.client;

  Future<List<OvertimeRequest>> getMyRequests(String employeeId) async {
    try {
      final data = await _supabase
          .from('overtime_requests')
          .select('*')
          .eq('employee_id', employeeId)
          .order('date', ascending: false);
      
      return (data as List<dynamic>).map((e) => OvertimeRequest.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Gagal mengambil data lembur: $e');
    }
  }

  Future<void> submitOvertimeRequest(Map<String, dynamic> payload) async {
    try {
      final token = _supabase.auth.currentSession?.accessToken;
      final response = await http.post(
        Uri.parse('${AppConstants.apiUrl}/overtime/request'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        final body = jsonDecode(response.body);
        throw Exception(body['message'] ?? 'Gagal mengajukan lembur');
      }
    } catch (e) {
      throw Exception('Gagal mengajukan lembur: $e');
    }
  }

  RealtimeChannel subscribeToMyRequests(String employeeId, void Function() onUpdate) {
    return _supabase
        .channel('public:overtime_requests:$employeeId')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'overtime_requests',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'employee_id',
            value: employeeId,
          ),
          callback: (payload) {
            onUpdate();
          },
        )
        .subscribe();
  }
}
