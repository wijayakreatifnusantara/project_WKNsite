import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../data/profile_service.dart';
import '../../../widgets/ios_card.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final ProfileService _profileService = ProfileService();
  
  final TextEditingController _currentPassCtrl = TextEditingController();
  final TextEditingController _newPassCtrl = TextEditingController();
  final TextEditingController _confirmPassCtrl = TextEditingController();
  
  bool _showCurrent = false;
  bool _showNew = false;
  bool _showConfirm = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _currentPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleUpdatePassword() async {
    final currentPass = _currentPassCtrl.text;
    final newPass = _newPassCtrl.text;
    final confirmPass = _confirmPassCtrl.text;

    if (currentPass.isEmpty || newPass.isEmpty || confirmPass.isEmpty) {
      _showError('Harap lengkapi semua kolom password.');
      return;
    }

    if (newPass != confirmPass) {
      _showError('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    if (newPass.length < 5) {
      _showError('Password baru minimal 5 karakter.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _profileService.changePassword(currentPass, newPass);
      if (mounted) {
        showCupertinoDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => CupertinoAlertDialog(
            title: const Text('Sukses'),
            content: const Text('Password berhasil diubah. Harap ingat password baru Anda untuk login selanjutnya.'),
            actions: [
              CupertinoDialogAction(
                isDefaultAction: true,
                onPressed: () {
                  Navigator.pop(context);
                  context.pop();
                },
                child: const Text('Tutup'),
              )
            ],
          )
        );
      }
    } catch (e) {
      _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: CupertinoColors.destructiveRed));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Ubah Sandi'),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Column(
            children: [
              Container(
                width: 70, height: 70,
                decoration: BoxDecoration(color: CupertinoColors.activeOrange.withValues(alpha: 0.1), shape: BoxShape.circle),
                child: const Icon(CupertinoIcons.lock_shield, size: 36, color: CupertinoColors.activeOrange),
              ),
              const SizedBox(height: 20),
              Text('Ubah Kata Sandi', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
              const SizedBox(height: 10),
              const Text('Gunakan kombinasi yang mudah Anda ingat namun sulit ditebak orang lain.', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: CupertinoColors.systemGrey, height: 1.5)),
              const SizedBox(height: 40),

              IosCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPasswordField('PASSWORD SAAT INI', _currentPassCtrl, _showCurrent, (val) => setState(() => _showCurrent = val), CupertinoIcons.lock_fill, isDark),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
                    _buildPasswordField('PASSWORD BARU', _newPassCtrl, _showNew, (val) => setState(() => _showNew = val), CupertinoIcons.lock_fill, isDark, iconColor: CupertinoColors.activeOrange),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
                    _buildPasswordField('KONFIRMASI PASSWORD BARU', _confirmPassCtrl, _showConfirm, (val) => setState(() => _showConfirm = val), CupertinoIcons.checkmark_seal_fill, isDark, iconColor: CupertinoColors.activeGreen),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              SizedBox(
                width: double.infinity,
                child: CupertinoButton.filled(
                  onPressed: _isLoading ? null : _handleUpdatePassword,
                  child: _isLoading 
                    ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                    : const Text('SIMPAN PASSWORD', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordField(String label, TextEditingController controller, bool showPass, ValueChanged<bool> onToggle, IconData prefixIcon, bool isDark, {Color iconColor = CupertinoColors.systemGrey}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
        const SizedBox(height: 8),
        CupertinoTextField(
          controller: controller,
          obscureText: !showPass,
          prefix: Padding(
            padding: const EdgeInsets.only(left: 12),
            child: Icon(prefixIcon, color: iconColor, size: 20),
          ),
          suffix: CupertinoButton(
            padding: EdgeInsets.zero,
            onPressed: () => onToggle(!showPass),
            child: Icon(showPass ? CupertinoIcons.eye_slash_fill : CupertinoIcons.eye_solid, color: CupertinoColors.systemGrey, size: 20),
          ),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
          decoration: BoxDecoration(
            color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
          ),
        ),
      ],
    );
  }
}
