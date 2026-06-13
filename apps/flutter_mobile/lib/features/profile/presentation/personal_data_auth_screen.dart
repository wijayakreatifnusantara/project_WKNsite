import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:local_auth/local_auth.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/profile_service.dart';

class PersonalDataAuthScreen extends StatefulWidget {
  const PersonalDataAuthScreen({super.key});

  @override
  State<PersonalDataAuthScreen> createState() => _PersonalDataAuthScreenState();
}

class _PersonalDataAuthScreenState extends State<PersonalDataAuthScreen> {
  final ProfileService _profileService = ProfileService();
  final LocalAuthentication _localAuth = LocalAuthentication();
  
  final TextEditingController _passwordCtrl = TextEditingController();
  bool _isLoading = false;
  bool _isBiometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _checkBiometric();
  }

  @override
  void dispose() {
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _checkBiometric() async {
    final canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
    final canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();
    
    if (canAuthenticate) {
      setState(() => _isBiometricAvailable = true);
    }
  }

  Future<void> _handleBiometric() async {
    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Verifikasi Akses Data Pribadi',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
      
      if (authenticated && mounted) {
        context.pushReplacement('/personal-data');
      }
    } catch (e) {
      debugPrint('Biometric Error: $e');
    }
  }

  Future<void> _handleVerify() async {
    if (_passwordCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Masukkan password Anda', style: TextStyle(color: context.surfaceColor)), backgroundColor: Colors.red));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final email = context.read<AuthProvider>().userData?['email'] ?? '';
      await _profileService.verifyPassword(email, _passwordCtrl.text);
      
      if (mounted) {
        context.pushReplacement('/personal-data');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''), style: TextStyle(color: context.surfaceColor)), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: Icon(Icons.shield_outlined, size: 40, color: Colors.green),
            ),
            SizedBox(height: 20),
            Text('Verifikasi Keamanan', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: context.textPrimary)),
            SizedBox(height: 10),
            Text('Sesuai standar keamanan, masukkan password Anda untuk melihat atau mengubah Data Pribadi & Rekening.', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: context.textSecondary, height: 1.5)),
            const SizedBox(height: 40),

            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              autofocus: true,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_outline, color: Colors.grey),
                hintText: 'Password Aplikasi',
                filled: true,
                fillColor: context.surfaceColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: context.borderColor)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: context.borderColor)),
              ),
            ),
            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleVerify,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                ),
                child: _isLoading 
                  ? CircularProgressIndicator(color: context.surfaceColor)
                  : Text('VERIFIKASI', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),
            ),

            if (_isBiometricAvailable) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton.icon(
                  onPressed: _handleBiometric,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppConstants.primaryColor,
                    side: BorderSide(color: AppConstants.primaryColor.withValues(alpha: 0.3)),
                    backgroundColor: AppConstants.primaryColor.withValues(alpha: 0.05),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  icon: const Icon(Icons.fingerprint),
                  label: const Text('Gunakan Sidik Jari / Face ID', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
