import 'package:flutter/services.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'dart:ui';
import '../../../core/theme/theme_extension.dart';
import '../../../core/theme/theme_provider.dart';
import 'package:provider/provider.dart';
import '../data/auth_provider.dart';
import '../../../core/utils/biometric_helper.dart';
import '../../../widgets/ios_card.dart';
import '../../../core/utils/constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _canUseBiometric = false;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );
    _fadeController.forward();
    _checkBiometric();
  }

  Future<void> _checkBiometric() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final hasBio = await BiometricHelper().hasBiometrics();
    final hasCreds = await auth.hasSavedCredentials();
    if (mounted) {
      setState(() {
        _canUseBiometric = hasBio && hasCreds;
      });
    }
  }

  void _handleBiometricLogin() async {
    final success = await BiometricHelper().authenticate();
    if (success) {
      if (!mounted) return;
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final error = await auth.biometricLogin();
      if (error != null && mounted) {
        _showErrorSnackBar(error);
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: CupertinoColors.destructiveRed),
    );
  }

  void _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showErrorSnackBar('Email dan kata sandi harus diisi');
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final error = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (error != null) {
      if (mounted) {
        _showErrorSnackBar(error);
      }
    }
    // Note: If no error, the GoRouter refreshListenable (AuthProvider) 
    // will automatically trigger the authGuard and redirect to /main.
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      child: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Center(
            child: SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(maxWidth: 420),
                    decoration: BoxDecoration(
                      color: isDark ? CupertinoColors.darkBackgroundGray.withValues(alpha: 0.6) : CupertinoColors.white.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: isDark ? CupertinoColors.systemGrey4.withValues(alpha: 0.5) : CupertinoColors.white.withValues(alpha: 0.5)),
                      boxShadow: [
                        BoxShadow(
                          color: CupertinoColors.black.withValues(alpha: 0.05),
                          offset: const Offset(0, 10),
                          blurRadius: 30,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                    // Logo and Header
                    Image.asset(
                      'assets/wkn_logo.png',
                      width: 80,
                      height: 80,
                      fit: BoxFit.contain,
                    ),
                    const SizedBox(height: 2),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: 'WKN',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: isDark ? CupertinoColors.white : CupertinoColors.black,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const TextSpan(
                            text: 'site',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFE31E24),
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'CORPORATE MANAGEMENT SYSTEM',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: CupertinoColors.systemGrey,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Email Field
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 4, bottom: 8),
                          child: Text(
                            'EMAIL ADDRESS',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: CupertinoColors.systemGrey,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        CupertinoTextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          placeholder: 'name@company.com',
                          onChanged: (val) {
                            if (context.read<ThemeProvider>().hapticEnabled) {
                              HapticFeedback.selectionClick();
                            }
                          },
                          placeholderStyle: const TextStyle(color: CupertinoColors.systemGrey2),
                          prefix: const Padding(
                            padding: EdgeInsets.only(left: 16.0),
                            child: Icon(CupertinoIcons.mail, color: CupertinoColors.systemGrey2, size: 20),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                          decoration: BoxDecoration(
                            color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5),
                          ),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isDark ? CupertinoColors.white : CupertinoColors.black,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Password Field
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 4, bottom: 8),
                          child: Text(
                            'PASSWORD',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: CupertinoColors.systemGrey,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        CupertinoTextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          placeholder: '••••••••',
                          onChanged: (val) {
                            if (context.read<ThemeProvider>().hapticEnabled) {
                              HapticFeedback.selectionClick();
                            }
                          },
                          placeholderStyle: const TextStyle(color: CupertinoColors.systemGrey2),
                          prefix: const Padding(
                            padding: EdgeInsets.only(left: 16.0),
                            child: Icon(CupertinoIcons.lock, color: CupertinoColors.systemGrey2, size: 20),
                          ),
                          suffix: CupertinoButton(
                            padding: const EdgeInsets.only(right: 16.0),
                            minSize: 0,
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                            child: Icon(
                              _obscurePassword ? CupertinoIcons.eye_slash : CupertinoIcons.eye,
                              color: CupertinoColors.systemGrey2,
                              size: 20,
                            ),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                          decoration: BoxDecoration(
                            color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5),
                          ),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isDark ? CupertinoColors.white : CupertinoColors.black,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Login Button
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFF4B4B), Color(0xFFE31E24)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFE31E24).withValues(alpha: 0.3),
                            offset: const Offset(0, 8),
                            blurRadius: 16,
                          ),
                        ],
                      ),
                      child: CupertinoButton(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        color: null,
                        borderRadius: BorderRadius.circular(12),
                        onPressed: isLoading ? null : _handleLogin,
                        child: isLoading
                            ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                            : const Text(
                                'SIGN IN',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 2.0,
                                  color: CupertinoColors.white,
                                ),
                              ),
                      ),
                    ),
                    
                    if (_canUseBiometric) ...[
                      const SizedBox(height: 24),
                      Center(
                        child: GestureDetector(
                          onTap: isLoading ? null : _handleBiometricLogin,
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: CupertinoColors.black.withValues(alpha: 0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                              border: Border.all(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5, width: 2),
                            ),
                            child: const Icon(CupertinoIcons.lock_shield, size: 40, color: Color(0xFFE31E24)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Fast Login',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey),
                      ),
                    ],

                    const SizedBox(height: 32),

                    // Footer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(CupertinoIcons.shield, color: CupertinoColors.systemGrey, size: 14),
                        const SizedBox(width: 4),
                        const Text(
                          'SECURE SSL',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: CupertinoColors.systemGrey, letterSpacing: 1.0),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8.0),
                          child: Text('•', style: TextStyle(color: CupertinoColors.systemGrey)),
                        ),
                        Icon(CupertinoIcons.check_mark_circled, color: CupertinoColors.activeGreen.withValues(alpha: 0.8), size: 14),
                        const SizedBox(width: 4),
                        const Text(
                          'ENCRYPTED',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: CupertinoColors.systemGrey, letterSpacing: 1.0),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      '© 2026 WIJAYA KREATIF NUSANTARA',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: CupertinoColors.systemGrey, letterSpacing: 1.0),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5),
                      ),
                      child: const Text(
                        'IMS VERSION 1.2.0 • OPTIMIZED FOR MOBILE',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: CupertinoColors.systemGrey, letterSpacing: 1.0),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        ),
      ),
      ),
    );
  }
}
