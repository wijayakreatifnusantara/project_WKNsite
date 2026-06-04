import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TimesheetService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  final _secureStorage = const FlutterSecureStorage();

  Future<void> submitTimesheet(String taskDescription, double hoursWorked) async {
    try {
      final token = await _secureStorage.read(key: 'authToken');
      final dateIso = DateTime.now().toIso8601String();

      final response = await http.post(
        Uri.parse('$baseUrl/submissions/timesheet'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'date': dateIso,
          'task_description': taskDescription,
          'hours_worked': hoursWorked,
        }),
      );

      final body = jsonDecode(response.body);
      if (response.statusCode != 200 || body['status'] == 'error') {
        throw Exception(body['message'] ?? 'Gagal menyimpan timesheet');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan server: $e');
    }
  }
}
