import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:local_auth/local_auth.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/profile_service.dart';
import '../../../widgets/ios_card.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Masukkan password Anda'), backgroundColor: CupertinoColors.destructiveRed));
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
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: CupertinoColors.destructiveRed));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Keamanan'),
        previousPageTitle: 'Profil',
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 20),
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(color: CupertinoColors.activeGreen.withValues(alpha: 0.1), shape: BoxShape.circle),
                child: const Icon(CupertinoIcons.shield_lefthalf_fill, size: 40, color: CupertinoColors.activeGreen),
              ),
              const SizedBox(height: 24),
              Text('Verifikasi Akses', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
              const SizedBox(height: 12),
              const Text(
                'Sesuai standar keamanan, masukkan password Anda untuk melihat atau mengubah Data Pribadi & Rekening.', 
                textAlign: TextAlign.center, 
                style: TextStyle(fontSize: 13, color: CupertinoColors.systemGrey, height: 1.5)
              ),
              const SizedBox(height: 40),

              IosCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: CupertinoTextField(
                  controller: _passwordCtrl,
                  obscureText: true,
                  autofocus: true,
                  placeholder: 'Password Aplikasi',
                  prefix: const Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Icon(CupertinoIcons.lock_fill, color: CupertinoColors.systemGrey, size: 20),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                  decoration: const BoxDecoration(color: CupertinoColors.transparent),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: CupertinoButton.filled(
                  onPressed: _isLoading ? null : _handleVerify,
                  child: _isLoading 
                    ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                    : const Text('VERIFIKASI', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                ),
              ),

              if (_isBiometricAvailable) ...[
                const SizedBox(height: 24),
                const Row(
                  children: [
                    Expanded(child: Divider(color: CupertinoColors.systemGrey4)),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text('ATAU', style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    Expanded(child: Divider(color: CupertinoColors.systemGrey4)),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: CupertinoButton(
                    onPressed: _handleBiometric,
                    color: CupertinoColors.activeBlue.withValues(alpha: 0.1),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(CupertinoIcons.viewfinder, color: CupertinoColors.activeBlue),
                        SizedBox(width: 8),
                        Text('Gunakan Face ID / Touch ID', style: TextStyle(color: CupertinoColors.activeBlue, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}
