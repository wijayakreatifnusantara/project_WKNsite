import 'dart:io';

void main() {
  final file = File('apps/flutter_mobile/lib/features/auth/data/auth_provider.dart');
  var content = file.readAsStringSync();

  final regex = RegExp(r'  String _hashPassword\(.*?^  }', multiLine: true, dotAll: true);
  content = content.replaceAll(regex, '');

  final loginRegex = RegExp(r'  Future<String\?> login\(String email, String password\) async \{.*?\n  \}', multiLine: true, dotAll: true);
  
  final newLogin = '''  Future<String?> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        final employeeData = await _supabase
            .from('employees')
            .select()
            .eq('id', response.user!.id)
            .maybeSingle();

        _userData = employeeData ?? {
          'id': response.user!.id,
          'email': response.user!.email ?? email,
          'name': 'Employee',
        };
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userSession', jsonEncode(_userData));
        await prefs.setString('loginTimestamp', DateTime.now().millisecondsSinceEpoch.toString());

        if (response.session != null) {
          await _secureStorage.write(key: 'authToken', value: response.session!.accessToken ?? '');
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
        return 'Email atau password salah.';
      }
      return e.message;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return 'Terjadi kesalahan sistem: \$e';
    }
  }''';

  content = content.replaceAll(loginRegex, newLogin);
  file.writeAsStringSync(content);
  print('Berhasil mengubah auth_provider.dart');
}
