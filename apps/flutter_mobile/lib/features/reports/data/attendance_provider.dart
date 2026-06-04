import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AttendanceProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  
  bool _isLoading = false;
  List<Map<String, dynamic>> _attendanceLogs = [];
  Map<String, int> _statistics = {'hadir': 0, 'telat': 0, 'sakit': 0, 'alpa': 0};

  bool get isLoading => _isLoading;
  List<Map<String, dynamic>> get attendanceLogs => _attendanceLogs;
  Map<String, int> get statistics => _statistics;

  Future<void> fetchAttendanceData(DateTime start, DateTime end) async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionStr = prefs.getString('userSession');
      if (sessionStr == null) throw Exception('Not logged in');
      final userData = jsonDecode(sessionStr);
      final realEmployeeId = userData['id'];


      final startStr = start.toIso8601String().split('T')[0];
      final endStr = end.toIso8601String().split('T')[0];

      final res = await _supabase
          .from('attendance')
          .select()
          .eq('employee_id', realEmployeeId)
          .gte('date', startStr)
          .lte('date', endStr);
      
      _attendanceLogs = List<Map<String, dynamic>>.from(res);

      int hadir = 0;
      int telat = 0;
      int sakit = 0;
      int alpa = 0;

      for (var log in _attendanceLogs) {
        final status = (log['status'] ?? '').toString().toLowerCase();
        if (status == 'present' || status == 'hadir') {
          hadir++;
        } else if (status == 'late' || status == 'telat') {
          telat++;
        } else if (status == 'leave' || status == 'sakit' || status == 'izin') {
          sakit++;
        } else if (status == 'absent' || status == 'alpa') {
          alpa++;
        } else {
          hadir++; // Fallback
        }
      }

      _statistics = {'hadir': hadir, 'telat': telat, 'sakit': sakit, 'alpa': alpa};

    } catch (e) {
      debugPrint('Error fetching attendance: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
