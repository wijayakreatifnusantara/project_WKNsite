import 'dart:convert';
import 'package:http/http.dart' as http;

class ReimburseService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  Future<Map<String, dynamic>> submitReimburse(Map<String, dynamic> payload) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/submissions/reimburse'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
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
