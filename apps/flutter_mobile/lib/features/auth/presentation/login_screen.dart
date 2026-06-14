import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import '../data/auth_provider.dart';
import '../../../core/utils/biometric_helper.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error), backgroundColor: Colors.red),
        );
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

  void _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email dan kata sandi harus diisi')),
      );
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final error = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (error != null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error), backgroundColor: Colors.red),
        );
      }
    }
    // Note: If no error, the GoRouter refreshListenable (AuthProvider) 
    // will automatically trigger the authGuard and redirect to /main.
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;
    final bgColor = context.backgroundColor;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Center(
            child: SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(maxWidth: 420),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(color: context.surfaceColor, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: context.isDarkMode ? Colors.black.withValues(alpha: 0.4) : const Color(0xFFD1D9E6),
                      offset: const Offset(12, 12),
                      blurRadius: 24,
                    ),
                    BoxShadow(
                      color: context.isDarkMode ? Colors.white.withValues(alpha: 0.02) : context.surfaceColor,
                      offset: const Offset(-12, -12),
                      blurRadius: 24,
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24.0),
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
                    const SizedBox(height: 16),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: 'WKN',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: context.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                          TextSpan(
                            text: 'site',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFE31E24),
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'CORPORATE MANAGEMENT SYSTEM',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: context.textSecondary,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Email Field
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: EdgeInsets.only(left: 4, bottom: 8),
                          child: Text(
                            'EMAIL ADDRESS',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: context.textSecondary,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: context.isDarkMode ? context.surfaceColor : const Color(0xFFE8EBF0),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: context.isDarkMode ? context.borderColor : Colors.transparent),
                          ),
                          child: TextField(
                            controller: _emailController,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: context.textPrimary,
                            ),
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              hintText: 'name@company.com',
                              hintStyle: TextStyle(color: context.textSecondary.withValues(alpha: 0.5)),
                              prefixIcon: Icon(Icons.mail_outline, color: context.textSecondary.withValues(alpha: 0.5), size: 20),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Password Field
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: EdgeInsets.only(left: 4, bottom: 8),
                          child: Text(
                            'PASSWORD',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: context.textSecondary,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: context.isDarkMode ? context.surfaceColor : const Color(0xFFE8EBF0),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: context.isDarkMode ? context.borderColor : Colors.transparent),
                          ),
                          child: TextField(
                            controller: _passwordController,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: context.textPrimary,
                            ),
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              hintText: '••••••••',
                              hintStyle: TextStyle(color: context.textSecondary.withValues(alpha: 0.5)),
                              prefixIcon: Icon(Icons.lock_outline, color: context.textSecondary.withValues(alpha: 0.5), size: 20),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                  color: context.textSecondary.withValues(alpha: 0.5),
                                  size: 20,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Login Button
                    Container(
                      width: double.infinity,
                      height: 48,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: const [
                          BoxShadow(
                            color: Color.fromRGBO(227, 30, 36, 0.3),
                            offset: Offset(5, 5),
                            blurRadius: 15,
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE31E24),
                          foregroundColor: context.surfaceColor,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: isLoading
                            ? SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(color: context.surfaceColor, strokeWidth: 2),
                              )
                            : const Text(
                                'SIGN IN',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 2.0,
                                ),
                              ),
                      ),
                    ),
                    
                    if (_canUseBiometric) ...[
                      const SizedBox(height: 24),
                      Center(
                        child: InkWell(
                          onTap: isLoading ? null : _handleBiometricLogin,
                          borderRadius: BorderRadius.circular(50),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: context.surfaceColor,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                              border: Border.all(color: const Color(0xFFE8EBF0), width: 2),
                            ),
                            child: const Icon(Icons.fingerprint, size: 40, color: Color(0xFFE31E24)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Fast Login',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black45),
                      ),
                    ],

                    const SizedBox(height: 32),

                    // Footer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shield_outlined, color: context.textSecondary.withValues(alpha: 0.5), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'SECURE SSL',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: context.textSecondary.withValues(alpha: 0.5), letterSpacing: 1.0),
                        ),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8.0),
                          child: Text('•', style: TextStyle(color: context.textSecondary.withValues(alpha: 0.5))),
                        ),
                        Icon(Icons.check_circle_outline, color: Colors.green.withValues(alpha: 0.5), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'ENCRYPTED',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: context.textSecondary.withValues(alpha: 0.5), letterSpacing: 1.0),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '© 2026 WIJAYA KREATIF NUSANTARA',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: context.textSecondary.withValues(alpha: 0.5), letterSpacing: 1.0),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: context.surfaceColor.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: context.surfaceColor),
                      ),
                      child: Text(
                        'IMS VERSION 1.2.0 • OPTIMIZED FOR MOBILE',
                        style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: context.textSecondary, letterSpacing: 1.0),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
