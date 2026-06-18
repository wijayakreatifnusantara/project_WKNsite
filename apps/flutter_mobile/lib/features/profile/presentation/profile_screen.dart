import 'package:flutter/cupertino.dart';
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
import '../../../widgets/ios_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isBiometric = true;
  bool _isNotification = true;
  bool _isHapticEnabled = true;
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
      _isHapticEnabled = prefs.getBool('hapticEnabled') ?? true;
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
    
    final isBiometric = prefs.getBool('appLockEnabled') ?? true;
    final isNotification = prefs.getBool('notifEnabled') ?? true;
    final is2faEnabled = prefs.getBool('twoFactorAuth') ?? false;
    final isDarkMode = prefs.getBool('darkMode') ?? false;
    final language = prefs.getString('language') ?? 'Bahasa Indonesia';

    await prefs.clear();
    
    if (userSession != null) await prefs.setString('userSession', userSession);
    await prefs.setBool('appLockEnabled', isBiometric);
    await prefs.setBool('notifEnabled', isNotification);
    await prefs.setBool('twoFactorAuth', is2faEnabled);
    await prefs.setBool('darkMode', isDarkMode);
    await prefs.setString('language', language);
  }

  void _showDevicesModal() {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) => CupertinoActionSheet(
        title: const Text('Perangkat Terhubung'),
        message: Text('Kelola perangkat yang mengakses akun Anda.\n\nPerangkat Saat Ini:\n$_deviceName ($_osVersion)'),
        actions: <CupertinoActionSheetAction>[
          CupertinoActionSheetAction(
            isDestructiveAction: true,
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Logout dari Perangkat Lain'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('Tutup'),
        ),
      ),
    );
  }

  void _showLanguageModal() {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) => CupertinoActionSheet(
        title: const Text('Pilih Bahasa'),
        actions: <CupertinoActionSheetAction>[
          CupertinoActionSheetAction(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Bahasa Indonesia'),
                if (_selectedLanguage == 'Bahasa Indonesia') const SizedBox(width: 8),
                if (_selectedLanguage == 'Bahasa Indonesia') const Icon(CupertinoIcons.check_mark, size: 18),
              ],
            ),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setString('language', 'Bahasa Indonesia');
              setState(() => _selectedLanguage = 'Bahasa Indonesia');
              if(context.mounted) Navigator.pop(context);
            },
          ),
          CupertinoActionSheetAction(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('English (US)'),
                if (_selectedLanguage == 'English (US)') const SizedBox(width: 8),
                if (_selectedLanguage == 'English (US)') const Icon(CupertinoIcons.check_mark, size: 18),
              ],
            ),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setString('language', 'English (US)');
              setState(() => _selectedLanguage = 'English (US)');
              if(context.mounted) Navigator.pop(context);
            },
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () => Navigator.pop(context),
          child: const Text('Batal'),
        ),
      ),
    );
  }

  void _showQrCodeModal(Map<String, dynamic>? user) {
    if (user == null || user['id'] == null) return;
    
    showCupertinoDialog(
      context: context,
      builder: (context) {
        return CupertinoAlertDialog(
          title: const Text('KARTU IDENTITAS'),
          content: Column(
            children: [
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: CupertinoColors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: QrImageView(
                  data: user['id'].toString(),
                  version: QrVersions.auto,
                  size: 180.0,
                  backgroundColor: CupertinoColors.white,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                user['name'] ?? 'User Name',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                user['job_position'] ?? 'Staff',
                style: const TextStyle(fontSize: 13, color: CupertinoColors.systemGrey),
              ),
              const SizedBox(height: 8),
              const Text(
                'Gunakan QR Code ini untuk absensi manual atau peminjaman aset.',
                style: TextStyle(fontSize: 11, color: CupertinoColors.systemGrey2),
              ),
            ],
          ),
          actions: [
            CupertinoDialogAction(
              child: const Text('Tutup'),
              onPressed: () => Navigator.pop(context),
            )
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().userData;
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark 
          ? CupertinoColors.black 
          : CupertinoColors.systemGroupedBackground,
      child: CustomScrollView(
        slivers: [
          const CupertinoSliverNavigationBar(
            largeTitle: Text('Profil'),
            border: null,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ID Card - Enterprise Refined in iOS Style
                  IosCard(
                    padding: const EdgeInsets.all(20),
                    margin: const EdgeInsets.only(bottom: 24),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: CupertinoColors.activeBlue, borderRadius: BorderRadius.circular(6)),
                                  child: const Text('WKN', style: TextStyle(color: CupertinoColors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                ),
                                const SizedBox(width: 10),
                                const Text('MOBILE IDENTITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: CupertinoColors.systemGrey, letterSpacing: 1.5)),
                              ],
                            ),
                            GestureDetector(
                              onTap: () => _showQrCodeModal(user),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: CupertinoColors.activeBlue.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8)
                                ),
                                child: const Icon(CupertinoIcons.qrcode, size: 24, color: CupertinoColors.activeBlue)
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
                                color: CupertinoColors.activeBlue.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20), 
                              ),
                              child: Center(
                                child: Text((user?['name']?.isNotEmpty == true) ? user!['name'].substring(0, 1).toUpperCase() : 'A', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: CupertinoColors.activeBlue)),
                              ),
                            ),
                            const SizedBox(width: 20),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(user?['name'] ?? 'User Name', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                  const SizedBox(height: 4),
                                  Text(user?['job_position'] ?? 'Staff', style: const TextStyle(fontSize: 13, color: CupertinoColors.systemGrey)),
                                ],
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground, borderRadius: BorderRadius.circular(12)),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('SYSTEM ID', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                                    const SizedBox(height: 2),
                                    Text(user?['employee_code'] ?? (((user?['id']?.toString().length ?? 0) > 8) ? user!['id'].toString().substring(0, 8).toUpperCase() : (user?['id']?.toString().toUpperCase() ?? 'WKN-0000')), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                  ],
                                ),
                              ),
                              Container(width: 1, height: 24, color: CupertinoColors.systemGrey4),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(left: 12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('UNIT/DIVISI', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                                      const SizedBox(height: 2),
                                      Text(user?['division_name'] ?? 'WKN Corp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black), maxLines: 1, overflow: TextOverflow.ellipsis),
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
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, bottom: 8.0),
                    child: Text('PROFIL', style: TextStyle(fontSize: 13, color: CupertinoColors.systemGrey, fontWeight: FontWeight.w600)),
                  ),
                  _buildCupertinoList(context, [
                    _buildListItem(CupertinoIcons.person, 'Informasi Pribadi', isDark, onTap: () => context.push('/personal-data-auth'), isLast: true),
                  ]),
                  const SizedBox(height: 24),

                  // Keamanan
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, bottom: 8.0),
                    child: Text('KEAMANAN (SECURITY)', style: TextStyle(fontSize: 13, color: CupertinoColors.systemGrey, fontWeight: FontWeight.w600)),
                  ),
                  _buildCupertinoList(context, [
                    _buildSwitchItem(CupertinoIcons.lock_shield, 'Face ID / Biometric', isDark, _isBiometric, (v) => _saveBoolSetting('appLockEnabled', v, (val) => _isBiometric = val)),
                    _buildSwitchItem(CupertinoIcons.shield_lefthalf_fill, 'Autentikasi 2 Langkah', isDark, _is2faEnabled, (v) => _saveBoolSetting('twoFactorAuth', v, (val) => _is2faEnabled = val)),
                    _buildListItem(CupertinoIcons.device_phone_portrait, 'Manajemen Perangkat', isDark, value: '1 Aktif', onTap: _showDevicesModal),
                    _buildListItem(CupertinoIcons.padlock, 'Ubah Kata Sandi', isDark, onTap: () => context.push('/change-password'), isLast: true),
                  ]),
                  const SizedBox(height: 24),

                  // Preferensi UI
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, bottom: 8.0),
                    child: Text('PREFERENSI APLIKASI', style: TextStyle(fontSize: 13, color: CupertinoColors.systemGrey, fontWeight: FontWeight.w600)),
                  ),
                  _buildCupertinoList(context, [
                    _buildListItem(CupertinoIcons.globe, 'Bahasa (Language)', isDark, value: _selectedLanguage, onTap: _showLanguageModal),
                    _buildSwitchItem(CupertinoIcons.moon, 'Mode Gelap (Dark Theme)', isDark, _isDarkMode, (v) async {
                      await _saveBoolSetting('darkMode', v, (val) => _isDarkMode = val);
                      if (context.mounted) {
                        Provider.of<ThemeProvider>(context, listen: false).toggleTheme(v);
                      }
                    }),
                    _buildSwitchItem(CupertinoIcons.bell, 'Notifikasi Sistem', isDark, _isNotification, (v) => _saveBoolSetting('notifEnabled', v, (val) => _isNotification = val)),
                    _buildSwitchItem(CupertinoIcons.hand_draw, 'Getaran Interaksi (Haptics)', isDark, _isHapticEnabled, (v) {
                      _saveBoolSetting('hapticEnabled', v, (val) => _isHapticEnabled = val);
                      context.read<ThemeProvider>().toggleHaptic(v);
                    }, isLast: true),
                  ]),
                  const SizedBox(height: 24),

                  // Diagnostik
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, bottom: 8.0),
                    child: Text('TEKNIS & DIAGNOSTIK', style: TextStyle(fontSize: 13, color: CupertinoColors.systemGrey, fontWeight: FontWeight.w600)),
                  ),
                  _buildCupertinoList(context, [
                    _buildListItem(CupertinoIcons.location, 'Akurasi GPS (Absensi)', isDark, value: _gpsAccuracy, onTap: _checkGpsAccuracy),
                    _buildListItem(CupertinoIcons.trash, 'Bersihkan Cache Lokal', isDark, onTap: _clearCache, isLast: true),
                  ]),
                  const SizedBox(height: 36),

                  // Logout
                  SizedBox(
                    width: double.infinity,
                    child: CupertinoButton(
                      color: CupertinoColors.systemRed.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      onPressed: _handleLogout,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(CupertinoIcons.power, color: CupertinoColors.systemRed, size: 20),
                          SizedBox(width: 8),
                          Text('Keluar dari Sesi', style: TextStyle(color: CupertinoColors.systemRed, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 140),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCupertinoList(BuildContext context, List<Widget> children) {
    final isDark = context.isDarkMode;
    final bgColor = isDark 
        ? CupertinoColors.systemGrey6.darkColor 
        : CupertinoColors.white;

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildListItem(IconData icon, String title, bool isDark, {String? value, VoidCallback? onTap, bool isLast = false}) {
    return Column(
      children: [
        CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: CupertinoColors.activeBlue,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: CupertinoColors.white, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: isDark ? CupertinoColors.white : CupertinoColors.black,
                      fontSize: 16,
                    ),
                  ),
                ),
                if (value != null) ...[
                  Text(
                    value,
                    style: const TextStyle(
                      color: CupertinoColors.systemGrey,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                const Icon(
                  CupertinoIcons.chevron_right,
                  color: CupertinoColors.systemGrey3,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
        if (!isLast)
          Padding(
            padding: const EdgeInsets.only(left: 52.0),
            child: Container(
              height: 0.5,
              color: isDark ? CupertinoColors.systemGrey4.darkColor : CupertinoColors.systemGrey4,
            ),
          ),
      ],
    );
  }

  Widget _buildSwitchItem(IconData icon, String title, bool isDark, bool value, ValueChanged<bool> onChanged, {bool isLast = false}) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: CupertinoColors.activeBlue,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: CupertinoColors.white, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: isDark ? CupertinoColors.white : CupertinoColors.black,
                    fontSize: 16,
                  ),
                ),
              ),
              CupertinoSwitch(
                value: value,
                activeColor: CupertinoColors.activeGreen,
                onChanged: onChanged,
              ),
            ],
          ),
        ),
        if (!isLast)
          Padding(
            padding: const EdgeInsets.only(left: 52.0),
            child: Container(
              height: 0.5,
              color: isDark ? CupertinoColors.systemGrey4.darkColor : CupertinoColors.systemGrey4,
            ),
          ),
      ],
    );
  }
}
