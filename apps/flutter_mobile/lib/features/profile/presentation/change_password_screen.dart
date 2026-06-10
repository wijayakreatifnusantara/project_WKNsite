import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../data/profile_service.dart';

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
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Sukses'),
            content: const Text('Password berhasil diubah. Harap ingat password baru Anda untuk login selanjutnya.'),
            actions: [
              TextButton(
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
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: Colors.red));
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
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        child: Column(
          children: [
            Container(
              width: 70, height: 70,
              decoration: BoxDecoration(color: Colors.orange.shade50, shape: BoxShape.circle),
              child: Icon(Icons.vpn_key_outlined, size: 36, color: Colors.orange),
            ),
            SizedBox(height: 20),
            Text('Ubah Kata Sandi', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: context.textPrimary)),
            SizedBox(height: 10),
            Text('Gunakan kombinasi yang mudah Anda ingat namun sulit ditebak orang lain.', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: context.textSecondary, height: 1.5)),
            const SizedBox(height: 40),

            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPasswordField('PASSWORD SAAT INI', _currentPassCtrl, _showCurrent, (val) => setState(() => _showCurrent = val), Icons.lock_outline),
                  const Divider(height: 30, color: Color(0xFFF1F5F9)),
                  _buildPasswordField('PASSWORD BARU', _newPassCtrl, _showNew, (val) => setState(() => _showNew = val), Icons.key_outlined, iconColor: Colors.orange),
                  const SizedBox(height: 20),
                  _buildPasswordField('KONFIRMASI PASSWORD BARU', _confirmPassCtrl, _showConfirm, (val) => setState(() => _showConfirm = val), Icons.check_circle_outline, iconColor: Colors.green),
                ],
              ),
            ),
            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleUpdatePassword,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                ),
                child: _isLoading 
                  ? CircularProgressIndicator(color: context.surfaceColor)
                  : Text('SIMPAN PASSWORD', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordField(String label, TextEditingController controller, bool showPass, ValueChanged<bool> onToggle, IconData prefixIcon, {Color iconColor = Colors.grey}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: !showPass,
          decoration: InputDecoration(
            prefixIcon: Icon(prefixIcon, color: iconColor),
            suffixIcon: IconButton(
              icon: Icon(showPass ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
              onPressed: () => onToggle(!showPass),
            ),
            filled: true,
            fillColor: const Color(0xFFF8F9FB),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppConstants.primaryColor)),
          ),
        ),
      ],
    );
  }
}
