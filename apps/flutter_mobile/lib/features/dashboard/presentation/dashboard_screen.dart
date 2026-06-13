import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import '../../auth/data/auth_provider.dart';
import '../../../core/utils/constants.dart';
import '../../../core/widgets/cached_avatar.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../attendance/data/attendance_service.dart';
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter_compass/flutter_compass.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../../attendance/data/offline_attendance_service.dart';
import 'package:text_scroll/text_scroll.dart';
import 'package:shimmer/shimmer.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Master list of all available actions
  final List<Map<String, dynamic>> _allActions = [
    {'id': 'leave', 'icon': Icons.calendar_month, 'label': 'Cuti', 'route': '/leave'},
    {'id': 'overtime', 'icon': Icons.timer, 'label': 'Lembur', 'route': '/overtime'},
    {'id': 'payslip', 'icon': Icons.receipt_long, 'label': 'Slip Gaji', 'route': '/payslip'},
    {'id': 'reimburse', 'icon': Icons.attach_money, 'label': 'Reimburse', 'route': '/reimburse'},
    {'id': 'documents', 'icon': Icons.description_outlined, 'label': 'Dokumen', 'route': '/documents'},
    {'id': 'directory', 'icon': Icons.people_outline, 'label': 'Direktori', 'route': '/directory'},
    {'id': 'approval', 'icon': Icons.fact_check_outlined, 'label': 'Persetujuan', 'route': '/approval'},
    {'id': 'assets', 'icon': Icons.work_outline, 'label': 'Asset', 'route': '/assets'},
    {'id': 'performance', 'icon': Icons.trending_up, 'label': 'KPI', 'route': '/performance'},
    {'id': 'timesheet', 'icon': Icons.access_time_outlined, 'label': 'Timesheet', 'route': '/timesheet'},
    {'id': 'reports', 'icon': Icons.analytics_outlined, 'label': 'Laporan', 'route': '/reports'},
    {'id': 'announcements', 'icon': Icons.campaign, 'label': 'Pengumuman', 'route': '/announcements'},
    {'id': 'academy', 'icon': Icons.school_outlined, 'label': 'Academy', 'route': '/academy'},
    {'id': 'helpdesk', 'icon': Icons.help_outline, 'label': 'Helpdesk', 'route': '/helpdesk'},
    {'id': 'assistant', 'icon': Icons.auto_awesome, 'label': 'AI HR', 'route': '/assistant'},
    {'id': 'leaderboard', 'icon': Icons.emoji_events, 'label': 'Peringkat', 'route': '/leaderboard'},
  ];

  // Default active actions if user hasn't customized
  List<String> _activeActionIds = ['leave', 'overtime', 'payslip', 'reimburse', 'leaderboard', 'performance', 'assistant'];
  bool _isLoading = true;
  String _todayStatus = 'Memuat...';
  bool _hasClockedIn = false;
  
  final OfflineAttendanceService _offlineService = OfflineAttendanceService();
  int _pendingOfflineCount = 0;
  bool _isSyncing = false;

  Timer? _timer;
  String _currentTime = '';
  String _currentDate = '';
  String _weatherTemp = '--';
  String _weatherCondition = 'Memuat Cuaca...';
  int? _weatherCode;
  double? _compassHeading;
  StreamSubscription<CompassEvent>? _compassSubscription;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchTodayAttendance();
      _checkOfflineData();
    });
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTime());
    _initSensors();
    _initConnectivityListener();
  }

  void _initConnectivityListener() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      final isConnected = results.contains(ConnectivityResult.mobile) || results.contains(ConnectivityResult.wifi) || results.contains(ConnectivityResult.ethernet);
      if (isConnected && _pendingOfflineCount > 0 && !_isSyncing) {
        _syncOfflineData(isSilent: true);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _compassSubscription?.cancel();
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  void _updateTime() {
    final now = DateTime.now();
    final timeStr = "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}";
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    final days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    final dayStr = days[now.weekday - 1];
    final dateStr = "$dayStr, ${now.day} ${months[now.month - 1]} ${now.year}";
    
    if (mounted) {
      setState(() {
        _currentTime = timeStr;
        _currentDate = dateStr;
      });
    }
  }

  Future<void> _initSensors() async {
    // Compass
    _compassSubscription = FlutterCompass.events?.listen((event) {
      if (mounted) setState(() => _compassHeading = event.heading);
    });

    // Weather
    try {
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.whileInUse || perm == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.low);
        final url = Uri.parse('https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current_weather=true');
        final res = await http.get(url);
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          final current = data['current_weather'];
          if (mounted) {
            setState(() {
              _weatherTemp = "${current['temperature']}°C";
              _weatherCondition = _getWeatherDesc(current['weathercode']);
              _weatherCode = current['weathercode'];
            });
          }
        }
      }
    } catch (e) {
      if (mounted) setState(() { _weatherTemp = '--'; _weatherCondition = 'Gagal memuat'; });
    }
  }

  String _getWeatherDesc(int code) {
    if (code == 0) return 'Cerah';
    if (code <= 3) return 'Berawan';
    if (code <= 48) return 'Berkabut';
    if (code <= 67) return 'Hujan Ringan';
    if (code <= 77) return 'Salju Ringan';
    if (code <= 82) return 'Hujan Deras';
    if (code <= 86) return 'Salju Lebat';
    if (code <= 99) return 'Badai Petir';
    return 'Berawan';
  }

  IconData _getWeatherIcon(int? code) {
    if (code == null) return Icons.cloud;
    if (code == 0) return Icons.wb_sunny;
    if (code <= 3) return Icons.cloud;
    if (code <= 48) return Icons.foggy;
    if (code <= 67) return Icons.grain;
    if (code <= 77) return Icons.ac_unit;
    if (code <= 82) return Icons.water_drop;
    if (code <= 86) return Icons.ac_unit;
    if (code <= 99) return Icons.thunderstorm;
    return Icons.cloud;
  }

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 11) return 'Selamat Pagi,';
    if (hour < 15) return 'Selamat Siang,';
    if (hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
  }

  Future<void> _fetchTodayAttendance() async {
    try {
      final user = context.read<AuthProvider>().userData;
      if (user == null || user['id'] == null) return;
      
      final today = DateTime.now().toIso8601String().split('T')[0];
      final res = await Supabase.instance.client
          .from('attendance')
          .select('status, clock_in, clock_out')
          .eq('employee_id', user['id'])
          .eq('date', today)
          .maybeSingle();
          
      if (mounted) {
        setState(() {
          if (res == null) {
            _todayStatus = 'Belum Absen';
            _hasClockedIn = false;
          } else {
            if (res['clock_out'] != null) {
              _todayStatus = 'Selesai (Pulang)';
            } else {
              _todayStatus = res['status'] ?? 'Sudah Absen';
            }
            _hasClockedIn = true;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _todayStatus = 'Gagal memuat status';
        });
      }
    }
  }

  Future<void> _checkOfflineData() async {
    final pending = await _offlineService.getPendingAttendances();
    if (mounted) {
      setState(() {
        _pendingOfflineCount = pending.length;
      });
    }
  }

  Future<void> _syncOfflineData({bool isSilent = false}) async {
    if (_isSyncing) return;
    setState(() => _isSyncing = true);
    
    try {
      final user = context.read<AuthProvider>().userData;
      final pending = await _offlineService.getPendingAttendances();
      if (user == null || user['id'] == null) throw Exception('No user');

      int successCount = 0;
      final AttendanceService apiService = AttendanceService();
      
      for (var record in pending) {
        final result = await apiService.submitAttendance(
          employeeId: record['employeeId'],
          latitude: record['latitude'],
          longitude: record['longitude'],
          clockType: record['clockType'],
          notes: record['notes'] + ' (Synced from Offline)',
          photoPath: record['photoPath'],
        );
        
        if (result['status'] == 'success') {
          await _offlineService.removePendingAttendance(record['id']);
          successCount++;
        }
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('✅ Berhasil sinkronisasi $successCount absen.'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal sinkronisasi: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSyncing = false);
        _checkOfflineData();
        _fetchTodayAttendance();
      }
    }
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final savedJson = prefs.getString('custom_dashboard_actions');
    if (savedJson != null) {
      try {
        final List<dynamic> decoded = jsonDecode(savedJson);
        setState(() {
          _activeActionIds = decoded.cast<String>();
        });
      } catch (e) {
        // use defaults if corrupted
      }
    }
    setState(() => _isLoading = false);
  }

  Future<void> _savePreferences(List<String> newIds) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('custom_dashboard_actions', jsonEncode(newIds));
    setState(() {
      _activeActionIds = newIds;
    });
  }

  void _showCustomizeModal() {
    List<String> tempSelected = List.from(_activeActionIds);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: context.borderColor))
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Kustomisasi Pintasan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
                            Text('Pilih maksimal 7 fitur untuk layar utama. (${tempSelected.length}/7)', style: TextStyle(fontSize: 12, color: tempSelected.length > 7 ? Colors.red : Colors.grey)),
                          ],
                        ),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context))
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _allActions.length,
                      itemBuilder: (context, index) {
                        final action = _allActions[index];
                        final isSelected = tempSelected.contains(action['id']);
                        
                        return CheckboxListTile(
                          activeColor: AppConstants.primaryColor,
                          secondary: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(8)),
                            child: Icon(action['icon'] as IconData, color: AppConstants.primaryColor, size: 20),
                          ),
                          title: Text(action['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          value: isSelected,
                          onChanged: (bool? val) {
                            setModalState(() {
                              if (val == true) {
                                if (tempSelected.length < 7) {
                                  tempSelected.add(action['id'] as String);
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Maksimal hanya 7 fitur.')));
                                }
                              } else {
                                tempSelected.remove(action['id'] as String);
                              }
                            });
                          },
                        );
                      },
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: context.surfaceColor,
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))],
                    ),
                    child: SafeArea(
                      child: SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: tempSelected.isNotEmpty && tempSelected.length <= 7 
                            ? () {
                                _savePreferences(tempSelected);
                                Navigator.pop(context);
                              }
                            : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppConstants.primaryColor,
                            foregroundColor: context.surfaceColor,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('SIMPAN PERUBAHAN', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                        ),
                      ),
                    ),
                  )
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().userData;
    
    if (_isLoading) {
      return Scaffold(
        backgroundColor: context.backgroundColor,
        body: SafeArea(
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade300,
            highlightColor: Colors.grey.shade100,
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(width: 120, height: 20, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(8))),
                      Container(width: 40, height: 40, decoration: BoxDecoration(color: context.surfaceColor, shape: BoxShape.circle)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(width: 200, height: 32, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(8))),
                  const SizedBox(height: 32),
                  Container(width: double.infinity, height: 100, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(20))),
                  const SizedBox(height: 24),
                  Container(width: double.infinity, height: 160, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(20))),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(width: 60, height: 60, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16))),
                      Container(width: 60, height: 60, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16))),
                      Container(width: 60, height: 60, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16))),
                      Container(width: 60, height: 60, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16))),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Dynamic Header with Scroll Transition
          SliverAppBar(
            expandedHeight: 210.0,
            floating: false,
            pinned: true,
            backgroundColor: context.surfaceColor,
            elevation: 0,
            iconTheme: IconThemeData(color: context.textPrimary),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
              side: BorderSide(color: AppConstants.slate200, width: 1),
            ),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 20, bottom: 12),
              title: LayoutBuilder(
                builder: (context, constraints) {
                  final settings = context.dependOnInheritedWidgetOfExactType<FlexibleSpaceBarSettings>();
                  final deltaExtent = settings!.maxExtent - settings.minExtent;
                  final t = (1.0 - (settings.currentExtent - settings.minExtent) / deltaExtent).clamp(0.0, 1.0);
                  
                  return Opacity(
                    opacity: t, 
                    child: Row(
                      children: [
                        Text('WKN Mobile', style: TextStyle(color: context.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                        const Spacer(),
                        Padding(
                          padding: const EdgeInsets.only(right: 16.0),
                          child: InkWell(
                            onTap: () => context.push('/id-card'),
                            child: CachedAvatar(
                              imageUrl: user?['avatar_url'],
                              name: user?['name'] ?? 'User',
                              radius: 14,
                              fontSize: 12,
                              backgroundColor: AppConstants.slate100,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              background: Container(
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                ),
                child: SafeArea(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final settings = context.dependOnInheritedWidgetOfExactType<FlexibleSpaceBarSettings>();
                      final t = settings == null ? 1.0 : ((settings.currentExtent - settings.minExtent) / (settings.maxExtent - settings.minExtent)).clamp(0.0, 1.0);
                      return Opacity(
                        opacity: t,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_greeting, style: TextStyle(color: context.textSecondary, fontSize: 13)),
                                  const SizedBox(height: 4),
                                  TextScroll(
                                    user?['name'] ?? 'Karyawan',
                                    mode: TextScrollMode.bouncing,
                                    velocity: Velocity(pixelsPerSecond: Offset(30, 0)),
                                    delayBefore: Duration(milliseconds: 500),
                                    pauseBetween: Duration(milliseconds: 1000),
                                    style: TextStyle(color: context.textPrimary, fontSize: 18, fontWeight: FontWeight.w900),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(width: 16),
                            Container(
                              padding: EdgeInsets.all(8),
                              decoration: BoxDecoration(color: AppConstants.slate50, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppConstants.slate200)),
                              child: Icon(Icons.notifications_outlined, color: context.textPrimary, size: 24),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Premium Glassmorphism Widget: Clock + Sensor
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppConstants.slate50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppConstants.slate200),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.baseline,
                                    textBaseline: TextBaseline.alphabetic,
                                    children: [
                                      Text(
                                        _currentTime.isNotEmpty ? '${_currentTime.split(':')[0]}:${_currentTime.split(':')[1]}' : '00:00', 
                                        style: TextStyle(color: context.textPrimary, fontSize: 26, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()])
                                      ),
                                      SizedBox(width: 4),
                                      Text(
                                        _currentTime.isNotEmpty ? ':${_currentTime.split(':')[2]}' : ':00', 
                                        style: TextStyle(color: context.textSecondary, fontSize: 16, fontWeight: FontWeight.w600)
                                      ),
                                      SizedBox(width: 6),
                                      Text('WIB', style: TextStyle(color: context.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  Text(_currentDate.isNotEmpty ? _currentDate : 'Memuat Tanggal...', style: TextStyle(color: context.textSecondary, fontSize: 10)),
                                ],
                              ),
                              // Weather & Compass Wrap
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Row(
                                    children: [
                                      Icon(_getWeatherIcon(_weatherCode), color: AppConstants.primaryColor, size: 14),
                                      SizedBox(width: 4),
                                      Text(_weatherTemp, style: TextStyle(color: context.textPrimary, fontSize: 14, fontWeight: FontWeight.bold)),
                                      SizedBox(width: 8),
                                      Text(_weatherCondition, style: TextStyle(color: context.textSecondary, fontSize: 10)),
                                    ],
                                  ),
                                  SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text('Arah: ${_compassHeading?.toStringAsFixed(0) ?? '--'}°', style: TextStyle(color: context.textSecondary, fontSize: 10)),
                                      const SizedBox(width: 8),
                                      Transform.rotate(
                                        angle: ((_compassHeading ?? 0) * (math.pi / 180) * -1),
                                        child: SizedBox(
                                          width: 24, height: 24,
                                          child: Stack(
                                            alignment: Alignment.center,
                                            children: [
                                              Icon(Icons.circle_outlined, color: AppConstants.slate300, size: 24),
                                              Positioned(top: 1, child: Text('U', style: TextStyle(fontSize: 7, color: Colors.redAccent, fontWeight: FontWeight.bold))),
                                              Positioned(bottom: 1, child: Text('S', style: TextStyle(fontSize: 7, color: context.textSecondary, fontWeight: FontWeight.bold))),
                                              Positioned(right: 2, child: Text('T', style: TextStyle(fontSize: 7, color: context.textSecondary, fontWeight: FontWeight.bold))),
                                              Positioned(left: 2, child: Text('B', style: TextStyle(fontSize: 7, color: context.textSecondary, fontWeight: FontWeight.bold))),
                                              Icon(Icons.navigation, color: context.textPrimary, size: 10),
                                            ]
                                          )
                                        ),
                                      )
                                    ],
                                  )
                                ],
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                );
            },
          ),
        ),
      ), // end Container
    ), // end FlexibleSpaceBar
  ), // end SliverAppBar
          
          // Body Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFloatingAttendanceCard(context),
                    const SizedBox(height: 8),
                    
                    if (_pendingOfflineCount > 0)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.orange.shade200),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.cloud_off, color: Colors.orange),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Ada $_pendingOfflineCount absen offline yang belum terkirim ke server.',
                                style: const TextStyle(fontSize: 12, color: Colors.orange),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: _isSyncing ? null : () => _syncOfflineData(isSilent: false),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                foregroundColor: context.surfaceColor,
                              ),
                              child: _isSyncing 
                                ? SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: context.surfaceColor, strokeWidth: 2))
                                : const Text('Sync'),
                            ),
                          ],
                        ),
                      ),
                      
                    Padding(
                      padding: const EdgeInsets.only(left: 8.0, bottom: 8.0, top: 4.0, right: 8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Layanan Mandiri', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1)),
                          InkWell(
                            onTap: _showCustomizeModal,
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(20)),
                              child: Row(
                                children: [
                                  Icon(Icons.edit, size: 12, color: context.textPrimary),
                                  SizedBox(width: 4),
                                  Text('Atur Pintasan', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.textPrimary)),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                    _buildCleanQuickActions(context),
                    
                    const SizedBox(height: 100), // Fab spacing
                  ],
                ),
              ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingAttendanceCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppConstants.slate200, width: 1),
        boxShadow: AppConstants.flatShadow,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.location_on, color: Colors.blue, size: 20),
                  ),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('WKN Office Tower', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textPrimary)),
                      Text('Sesuai dengan titik kordinat', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: _hasClockedIn ? Colors.green.shade50 : Colors.orange.shade50, borderRadius: BorderRadius.circular(20)),
                child: Text(_todayStatus, style: TextStyle(color: _hasClockedIn ? Colors.green : Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.heavyImpact();
                context.push('/attendance-form?type=${_hasClockedIn ? 'OUT' : 'IN'}');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: context.textPrimary,
                foregroundColor: context.surfaceColor,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.fingerprint, size: 24),
                  const SizedBox(width: 12),
                  Text(_hasClockedIn ? 'ABSEN PULANG SEKARANG' : 'ABSEN MASUK SEKARANG', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 1)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCleanQuickActions(BuildContext context) {
    // Generate the list based on user preferences
    List<Map<String, dynamic>> displayActions = [];
    for (String id in _activeActionIds) {
      final found = _allActions.firstWhere((element) => element['id'] == id, orElse: () => <String, dynamic>{});
      if (found.isNotEmpty) {
        displayActions.add(found);
      }
    }

    // Always add the 'Semua' (Menu) button at the end
    displayActions.add({
      'id': 'all',
      'icon': Icons.grid_view_rounded,
      'label': 'Semua',
      'route': '/menu'
    });

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: displayActions.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.95,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemBuilder: (context, index) {
        final action = displayActions[index];
        final isAllButton = action['id'] == 'all';

        return InkWell(
          onTap: () {
            if (action['route'] != null) context.push(action['route'] as String);
          },
          borderRadius: BorderRadius.circular(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 50, height: 50,
                decoration: BoxDecoration(
                  color: isAllButton ? AppConstants.primaryColor.withValues(alpha: 0.05) : AppConstants.slate50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isAllButton ? AppConstants.primaryColor.withValues(alpha: 0.2) : AppConstants.slate200, width: 1),
                ),
                child: Icon(
                  action['icon'] as IconData,
                  color: isAllButton ? AppConstants.primaryColor : context.textPrimary,
                  size: 24,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                action['label'] as String,
                style: TextStyle(
                  fontSize: 11, 
                  fontWeight: FontWeight.bold, 
                  color: isAllButton ? AppConstants.primaryColor : context.textPrimary
                ),
                textAlign: TextAlign.center,
                maxLines: 1, overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      },
    );
  }
}
