import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import '../../../core/theme/theme_provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isBiometric = true;
  bool _isNotification = true;
  bool _is2faEnabled = false;
  bool _isDarkMode = false;
  String _selectedLanguage = 'Bahasa Indonesia';
  String _gpsAccuracy = '--';
  String _deviceName = 'Memuat perangkat...';
  String _osVersion = '';

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadDeviceInfo();
  }

  Future<void> _loadDeviceInfo() async {
    final deviceInfoPlugin = DeviceInfoPlugin();
    try {
      if (Platform.isAndroid) {
        final androidInfo = await deviceInfoPlugin.androidInfo;
        if (mounted) {
          setState(() {
          _deviceName = '${androidInfo.brand} ${androidInfo.model}'.toUpperCase();
          _osVersion = 'Android ${androidInfo.version.release}';
        });
        }
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfoPlugin.iosInfo;
        if (mounted) {
          setState(() {
          _deviceName = iosInfo.name;
          _osVersion = '${iosInfo.systemName} ${iosInfo.systemVersion}';
        });
        }
      } else {
        if (mounted) {
          setState(() {
          _deviceName = 'Perangkat Lain';
          _osVersion = Platform.operatingSystem;
        });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _deviceName = 'Perangkat Saat Ini');
    }
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isBiometric = prefs.getBool('appLockEnabled') ?? true;
      _isNotification = prefs.getBool('notifEnabled') ?? true;
      _is2faEnabled = prefs.getBool('twoFactorAuth') ?? false;
      _isDarkMode = prefs.getBool('darkMode') ?? false;
      _selectedLanguage = prefs.getString('language') ?? 'Bahasa Indonesia';
    });
  }

  Future<void> _saveBoolSetting(String key, bool value, Function(bool) updater) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    setState(() => updater(value));
  }

  Future<void> _checkGpsAccuracy() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }
      
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      setState(() {
        _gpsAccuracy = '${position.accuracy.toStringAsFixed(1)} m';
      });
    } catch (e) {
      setState(() => _gpsAccuracy = 'Gagal');
    }
  }

  Future<void> _handleLogout() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.logout(); 
    if (mounted) context.go('/login');
  }

  Future<void> _clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    final userSession = prefs.getString('userSession');
    
    // Save needed preferences
    final isBiometric = prefs.getBool('appLockEnabled') ?? true;
    final isNotification = prefs.getBool('notifEnabled') ?? true;
    final is2faEnabled = prefs.getBool('twoFactorAuth') ?? false;
    final isDarkMode = prefs.getBool('darkMode') ?? false;
    final language = prefs.getString('language') ?? 'Bahasa Indonesia';

    await prefs.clear();
    
    // Restore session and critical prefs
    if (userSession != null) await prefs.setString('userSession', userSession);
    await prefs.setBool('appLockEnabled', isBiometric);
    await prefs.setBool('notifEnabled', isNotification);
    await prefs.setBool('twoFactorAuth', is2faEnabled);
    await prefs.setBool('darkMode', isDarkMode);
    await prefs.setString('language', language);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cache sementara telah dibersihkan!')));
    }
  }

  void _showDevicesModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Perangkat Terhubung', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
              const SizedBox(height: 8),
              const Text('Kelola perangkat yang mengakses akun Anda.', style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 24),
              _buildDeviceItem(_deviceName, 'Perangkat Ini ($_osVersion)', Platform.isIOS ? Icons.phone_iphone : Icons.phone_android, true),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.pop(),
                  style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  child: Text('Tutup', style: TextStyle(color: context.textPrimary)),
                ),
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildDeviceItem(String name, String detail, IconData icon, bool isCurrent) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: context.textPrimary, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  if (isCurrent) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                      child: const Text('Aktif', style: TextStyle(fontSize: 9, color: Colors.green, fontWeight: FontWeight.bold)),
                    )
                  ]
                ],
              ),
              const SizedBox(height: 4),
              Text(detail, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
        ),
        if (!isCurrent)
          TextButton(
            onPressed: () {},
            child: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
          )
      ],
    );
  }

  void _showLanguageModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Pilih Bahasa', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Bahasa Indonesia', style: TextStyle(fontWeight: FontWeight.w600)),
                trailing: _selectedLanguage == 'Bahasa Indonesia' ? const Icon(Icons.check_circle, color: AppConstants.primaryColor) : null,
                onTap: () async {
                  await _saveBoolSetting('temp', false, (v){}); // dummy await
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setString('language', 'Bahasa Indonesia');
                  setState(() => _selectedLanguage = 'Bahasa Indonesia');
                  if(context.mounted) context.pop();
                },
              ),
              ListTile(
                title: const Text('English (US)', style: TextStyle(fontWeight: FontWeight.w600)),
                trailing: _selectedLanguage == 'English (US)' ? const Icon(Icons.check_circle, color: AppConstants.primaryColor) : null,
                onTap: () async {
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setString('language', 'English (US)');
                  setState(() => _selectedLanguage = 'English (US)');
                  if(context.mounted) context.pop();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showQrCodeModal(Map<String, dynamic>? user) {
    if (user == null || user['id'] == null) return;
    
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: context.surfaceColor,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 10))
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'KARTU IDENTITAS KARYAWAN',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: QrImageView(
                    data: user['id'].toString(),
                    version: QrVersions.auto,
                    size: 200.0,
                    backgroundColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  user['name'] ?? 'User Name',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: context.textPrimary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  user['job_position'] ?? 'Staff',
                  style: TextStyle(fontSize: 14, color: context.textSecondary, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'Gunakan QR Code ini untuk scan peminjaman aset atau absensi manual.',
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: Text('TUTUP', style: TextStyle(color: context.textPrimary, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().userData;

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Pengaturan & Profil', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        automaticallyImplyLeading: false, 
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ID Card - Enterprise Refined
            Container(
              padding: const EdgeInsets.all(20),
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 15, offset: const Offset(0, 5))],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: AppConstants.primaryColor, borderRadius: BorderRadius.circular(6)),
                            child: Text('WKN', style: TextStyle(color: context.surfaceColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                          ),
                          const SizedBox(width: 10),
                          const Text('MOBILE IDENTITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)),
                        ],
                      ),
                      InkWell(
                        onTap: () => _showQrCodeModal(user),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppConstants.primaryColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8)
                          ),
                          child: const Icon(Icons.qr_code, size: 24, color: AppConstants.primaryColor)
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Container(
                        width: 64, height: 64,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [AppConstants.primaryColor.withValues(alpha: 0.2), AppConstants.primaryColor.withValues(alpha: 0.05)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                          borderRadius: BorderRadius.circular(20), 
                          border: Border.all(color: AppConstants.primaryColor.withValues(alpha: 0.3))
                        ),
                        child: Center(
                          child: Text((user?['name']?.isNotEmpty == true) ? user!['name'].substring(0, 1).toUpperCase() : 'A', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppConstants.primaryColor)),
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(user?['name'] ?? 'User Name', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: context.textPrimary)),
                            SizedBox(height: 4),
                            Text(user?['job_position'] ?? 'Staff', style: TextStyle(fontSize: 13, color: context.textSecondary, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('SYSTEM ID', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1)),
                              SizedBox(height: 2),
                              Text(user?['employee_code'] ?? (((user?['id']?.toString().length ?? 0) > 8) ? user!['id'].toString().substring(0, 8).toUpperCase() : (user?['id']?.toString().toUpperCase() ?? 'WKN-0000')), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: context.textPrimary)),
                            ],
                          ),
                        ),
                        Container(width: 1, height: 24, color: Colors.grey.shade300),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(left: 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('UNIT/DIVISI', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1)),
                                SizedBox(height: 2),
                                Text(user?['division_name'] ?? 'WKN Corp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: context.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),

            // Profil Dasar
            const Text('PROFIL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            _buildSectionContainer([
              _buildSettingItem(Icons.person_outline, 'Informasi Pribadi & Rekening', onTap: () => context.push('/personal-data-auth')),
            ]),
            const SizedBox(height: 24),

            // Keamanan
            const Text('KEAMANAN (SECURITY)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            _buildSectionContainer([
              _buildSettingSwitch(Icons.fingerprint, 'Biometric / Face ID Login', _isBiometric, (v) => _saveBoolSetting('appLockEnabled', v, (val) => _isBiometric = val)),
              _buildDivider(),
              _buildSettingSwitch(Icons.security, 'Autentikasi 2 Langkah (2FA)', _is2faEnabled, (v) => _saveBoolSetting('twoFactorAuth', v, (val) => _is2faEnabled = val)),
              _buildDivider(),
              _buildSettingItem(Icons.devices, 'Manajemen Perangkat', value: '1 Aktif', onTap: _showDevicesModal),
              _buildDivider(),
              _buildSettingItem(Icons.lock_outline, 'Ubah Kata Sandi', onTap: () => context.push('/change-password')),
            ]),
            const SizedBox(height: 24),

            // Preferensi UI
            const Text('PREFERENSI APLIKASI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            _buildSectionContainer([
              _buildSettingItem(Icons.language, 'Bahasa (Language)', value: _selectedLanguage, onTap: _showLanguageModal),
              _buildDivider(),
              _buildSettingSwitch(Icons.dark_mode_outlined, 'Mode Gelap (Dark Theme)', _isDarkMode, (v) async {
                await _saveBoolSetting('darkMode', v, (val) => _isDarkMode = val);
                if (context.mounted) {
                  Provider.of<ThemeProvider>(context, listen: false).toggleTheme(v);
                }
              }),
              _buildDivider(),
              _buildSettingSwitch(Icons.notifications_none, 'Notifikasi Sistem', _isNotification, (v) => _saveBoolSetting('notifEnabled', v, (val) => _isNotification = val)),
            ]),
            const SizedBox(height: 24),

            // Diagnostik
            const Text('TEKNIS & DIAGNOSTIK', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            _buildSectionContainer([
              _buildSettingItem(Icons.location_on_outlined, 'Akurasi GPS (Absensi)', value: _gpsAccuracy, onTap: _checkGpsAccuracy),
              _buildDivider(),
              _buildSettingItem(Icons.cleaning_services_outlined, 'Bersihkan Cache Lokal', onTap: _clearCache),
            ]),
            const SizedBox(height: 36),

            // Logout
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _handleLogout,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.withValues(alpha: 0.1),
                  foregroundColor: Colors.red,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: const Icon(Icons.logout),
                label: const Text('Keluar dari Sesi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ),
            ),
            const SizedBox(height: 140), // Increased to prevent bottom nav bar overlap
          ],
        ),
      ),
    );
  }

  Widget _buildSectionContainer(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: context.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 8, offset: const Offset(0, 2))]
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingItem(IconData icon, String title, {String? value, VoidCallback? onTap}) {
    return ListTile(
      leading: Container(
        padding: EdgeInsets.all(8),
        decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(8), border: Border.all(color: Theme.of(context).colorScheme.surfaceContainerHighest)),
        child: Icon(icon, color: AppConstants.primaryColor, size: 20),
      ),
      title: Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: context.textPrimary)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (value != null) Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
          if (value != null) const SizedBox(width: 4),
          const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
        ],
      ),
      onTap: onTap,
    );
  }

  Widget _buildSettingSwitch(IconData icon, String title, bool value, ValueChanged<bool> onChanged) {
    return ListTile(
      leading: Container(
        padding: EdgeInsets.all(8),
        decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(8), border: Border.all(color: Theme.of(context).colorScheme.surfaceContainerHighest)),
        child: Icon(icon, color: AppConstants.primaryColor, size: 20),
      ),
      title: Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: context.textPrimary)),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeTrackColor: AppConstants.primaryColor,
      ),
    );
  }

  Widget _buildDivider() => Divider(height: 1, indent: 56, endIndent: 16, color: context.borderColor);
}
