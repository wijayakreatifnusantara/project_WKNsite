import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import '../../../core/utils/constants.dart';

class AuthProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  final _secureStorage = const FlutterSecureStorage();
  
  Map<String, dynamic>? _userData;
  bool _isLoading = false;
  bool _isInitialized = false;

  Map<String, dynamic>? get userData => _userData;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  bool get isAuthenticated => _userData != null;

  AuthProvider() {
    _checkUserSession();
  }

  Future<void> _checkUserSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionStr = prefs.getString('userSession');
      final loginTime = prefs.getString('loginTimestamp');

      if (sessionStr != null && loginTime != null) {
        final elapsed = DateTime.now().millisecondsSinceEpoch - int.parse(loginTime);
        const tenHoursMs = 10 * 60 * 60 * 1000;
        
        if (elapsed < tenHoursMs) {
          _userData = jsonDecode(sessionStr);
          
          // Sinkronisasi FCM Token jika sesi aktif
          try {
            String? authToken = await _secureStorage.read(key: 'authToken');
            if (authToken != null) {
              String? fcmToken = await FirebaseMessaging.instance.getToken();
              if (fcmToken != null) {
                 await http.put(
                   Uri.parse('${AppConstants.apiUrl}/employees/fcm-token'),
                   headers: {
                     'Content-Type': 'application/json',
                     'Authorization': 'Bearer $authToken',
                   },
                   body: jsonEncode({'token': fcmToken}),
                 );
              }
            }
          } catch(e) {
             debugPrint('Gagal sync FCM Token saat resume: $e');
          }
        } else {
          await logout();
        }
      }
    } catch (e) {
      debugPrint('Error loading session: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  // Fungsi hash untuk legacy support
  String _hashPassword(String password) {
    final bytes = utf8.encode(password);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  Future<String?> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      AuthResponse? response;
      try {
        // Coba login dengan password biasa
        response = await _supabase.auth.signInWithPassword(
          email: email,
          password: password,
        );
      } catch (e) {
        // Jika gagal, coba gunakan password yang sudah di-hash (untuk dukungan akun lama)
        final hashedPass = _hashPassword(password);
        response = await _supabase.auth.signInWithPassword(
          email: email,
          password: hashedPass,
        );
      }

      if (response.user != null) {
        // Ambil data karyawan dari Supabase
        final employeeData = await _supabase
            .from('employees')
            .select()
            .eq('email', email)
            .maybeSingle();

        _userData = employeeData ?? {
          'id': response.user!.id,
          'email': response.user!.email,
          'name': 'Employee', 
        };
        
        // Simpan sesi
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userSession', jsonEncode(_userData));
        await prefs.setString('loginTimestamp', DateTime.now().millisecondsSinceEpoch.toString());

        // Simpan kredensial biometrik (Opsi A: tersimpan terus untuk fast login)
        await _secureStorage.write(key: 'saved_email', value: email);
        await _secureStorage.write(key: 'saved_password', value: password);

        if (response.session != null) {
          await _secureStorage.write(key: 'authToken', value: response.session!.accessToken);
          
          // Sinkronisasi FCM Token ke Backend (Run asynchronously to prevent blocking login)
          () async {
            try {
              String? fcmToken = await FirebaseMessaging.instance.getToken();
              if (fcmToken != null) {
                 await http.put(
                   Uri.parse('${AppConstants.apiUrl}/employees/fcm-token'),
                   headers: {
                     'Content-Type': 'application/json',
                     'Authorization': 'Bearer ${response!.session!.accessToken}',
                   },
                   body: jsonEncode({'token': fcmToken}),
                 );
              }
            } catch(e) {
               debugPrint('Gagal sync FCM Token: $e');
            }
          }();
        }

        _isLoading = false;
        notifyListeners();
        return null;
      } else {
        _isLoading = false;
        notifyListeners();
        return 'Gagal login, periksa kembali email dan kata sandi Anda.';
      }
    } on AuthException catch (e) {
      _isLoading = false;
      notifyListeners();
      if (e.message.contains('Invalid login credentials')) {
        return 'Email atau kata sandi salah.';
      }
      return e.message;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return 'Terjadi kesalahan sistem: $e';
    }
  }

  Future<void> logout() async {
    try {
      await _supabase.auth.signOut();
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userSession');
    await prefs.remove('loginTimestamp');
    await _secureStorage.delete(key: 'authToken');
    _userData = null;
    notifyListeners();
  }

  Future<bool> hasSavedCredentials() async {
    final email = await _secureStorage.read(key: 'saved_email');
    final password = await _secureStorage.read(key: 'saved_password');
    return email != null && email.isNotEmpty && password != null && password.isNotEmpty;
  }

  Future<String?> biometricLogin() async {
    final email = await _secureStorage.read(key: 'saved_email');
    final password = await _secureStorage.read(key: 'saved_password');
    if (email != null && password != null) {
      return await login(email, password);
    }
    return 'Kredensial tidak ditemukan. Silakan login manual terlebih dahulu.';
  }
}
