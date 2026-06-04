import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ProfileService {
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Ganti sesuai ENV saat deploy
  final _supabase = Supabase.instance.client;
  final _secureStorage = const FlutterSecureStorage();

  // Ambil data detail karyawan dari Supabase
  Future<Map<String, dynamic>?> getEmployeeData(String employeeId) async {
    try {
      final data = await _supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .maybeSingle();
      return data;
    } catch (e) {
      throw Exception('Gagal memuat data karyawan: $e');
    }
  }

  // Update data rekening bank di Supabase
  Future<void> updateBankAccount(String employeeId, String bankName, String bankAccount, String bankAccountHolder) async {
    try {
      await _supabase.from('employees').update({
        'bank_name': bankName,
        'bank_account': bankAccount,
        'bank_account_holder': bankAccountHolder,
      }).eq('id', employeeId);
    } catch (e) {
      throw Exception('Gagal memperbarui rekening: $e');
    }
  }

  // Helper untuk hashing SHA256 (Persis seperti CryptoJS.SHA256 di RN)
  String _hashPassword(String password) {
    final bytes = utf8.encode(password);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Verifikasi Password (untuk membuka Personal Data)
  Future<bool> verifyPassword(String email, String password) async {
    try {
      final token = await _secureStorage.read(key: 'authToken');
      final hashedPass = _hashPassword(password);
      
      final response = await http.post(
        Uri.parse('$baseUrl/auth/employee/verify-password'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'email': email,
          'password': hashedPass,
        }),
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['status'] != 'error') {
        return true;
      } else {
        throw Exception(body['message'] ?? 'Password salah');
      }
    } catch (e) {
      throw Exception('Kesalahan verifikasi: $e');
    }
  }

  // Ubah Password via API Backend
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      final token = await _secureStorage.read(key: 'authToken');
      final hashedCurrent = _hashPassword(currentPassword);
      final hashedNew = _hashPassword(newPassword);

      final response = await http.post(
        Uri.parse('$baseUrl/auth/employee/change-password'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'current_password': hashedCurrent,
          'new_password': hashedNew,
        }),
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['status'] != 'error') {
        // Update password yang tersimpan di storage (jika biometrik aktif)
        final savedStr = await _secureStorage.read(key: 'savedCredentials');
        if (savedStr != null) {
          final saved = jsonDecode(savedStr);
          saved['password'] = hashedNew;
          await _secureStorage.write(key: 'savedCredentials', value: jsonEncode(saved));
        }
      } else {
        throw Exception(body['message'] ?? 'Gagal mengubah password');
      }
    } catch (e) {
      throw Exception('Kesalahan server: $e');
    }
  }
}
