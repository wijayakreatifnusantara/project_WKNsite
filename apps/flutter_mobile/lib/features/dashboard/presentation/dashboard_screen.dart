import 'package:flutter/cupertino.dart';
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
import '../../../core/widgets/animated_tap_button.dart';
import '../../../core/theme/theme_provider.dart';
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
import 'package:geocoding/geocoding.dart' as geocoding;

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Master list of all available actions
  final List<Map<String, dynamic>> _allActions = [
    {'id': 'leave', 'icon': Icons.calendar_month, 'label': 'Izin', 'route': '/leave'},
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
  String _humidity = '--';
  String? _clockInTime;
  String? _clockOutTime;
  String? _workDuration;
  String? _clockInNotes;
  String _locationName = 'Memuat Lokasi...';
  String _locationDetail = 'Mencari sinyal GPS...';
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

    // Weather & Location
    try {
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.whileInUse || perm == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        
        // 1. Weather
        final url = Uri.parse('https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current=temperature_2m,relative_humidity_2m,weather_code');
        http.get(url).then((res) {
          if (res.statusCode == 200) {
            final data = jsonDecode(res.body);
            final current = data['current'];
            if (mounted) {
              setState(() {
                _weatherTemp = "${current['temperature_2m']}°C";
                _humidity = "${current['relative_humidity_2m']}%";
                _weatherCondition = _getWeatherDesc(current['weather_code']);
                _weatherCode = current['weather_code'];
              });
            }
          }
        });

        // 2. Geofence & Location Name
        try {
          final settingsRes = await AttendanceService().getAttendanceSettings();
          bool insideZone = false;
          String zoneName = '';
          
          if (settingsRes['status'] == 'success') {
            final data = settingsRes['data'];
            final userData = context.read<AuthProvider>().userData;
            final allowFreeGlobal = data['allow_free_attendance'] == true;
            final isFieldTeam = userData?['is_field_team'] == true;
            
            if (allowFreeGlobal || isFieldTeam) {
              insideZone = true;
              zoneName = allowFreeGlobal ? 'Bebas Absen Global' : 'Lokasi Lapangan Bebas';
            } else {
               final workingLocName = userData?['working_location'];
               final locations = (data['working_locations'] as List<dynamic>?) ?? [];
               Map<String, dynamic>? matchedLoc;
               for (var loc in locations) {
                 if (loc['name'] == workingLocName) { matchedLoc = loc; break; }
               }
               
               if (matchedLoc == null) {
                  matchedLoc = data['hq_location'] ?? {'name': 'WKN HQ', 'lat': -6.2088, 'lon': 106.8456, 'radius': 100};
               }
               
               double dist = Geolocator.distanceBetween(
                 pos.latitude, pos.longitude,
                 (matchedLoc!['lat'] ?? 0).toDouble(), (matchedLoc['lon'] ?? 0).toDouble()
               );
               
               if (dist <= (matchedLoc['radius'] ?? 100).toDouble()) {
                 insideZone = true;
                 zoneName = matchedLoc['name'];
               }
            }
          }

          if (insideZone && zoneName.isNotEmpty) {
             if (mounted) setState(() {
                _locationName = zoneName;
                _locationDetail = 'Sesuai dengan titik koordinat terdaftar';
             });
          } else {
             // Fallback to Reverse Geocoding
             List<geocoding.Placemark> placemarks = await geocoding.placemarkFromCoordinates(pos.latitude, pos.longitude);
             if (placemarks.isNotEmpty) {
               final place = placemarks.first;
               if (mounted) setState(() {
                  _locationName = place.name ?? place.street ?? 'Lokasi Tidak Dikenal';
                  _locationDetail = '${place.subLocality ?? place.locality ?? ''}, ${place.subAdministrativeArea ?? place.administrativeArea ?? ''}';
               });
             }
          }
        } catch(e) {
             if (mounted) setState(() {
                _locationName = 'Lokasi GPS';
                _locationDetail = '${pos.latitude.toStringAsFixed(4)}, ${pos.longitude.toStringAsFixed(4)}';
             });
        }
      }
    } catch (e) {
      if (mounted) setState(() { 
        _weatherTemp = '--'; 
        _weatherCondition = 'Gagal memuat'; 
        _locationName = 'Gagal memuat lokasi';
        _locationDetail = 'Pastikan GPS menyala';
      });
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
      final resList = await Supabase.instance.client
          .from('attendance')
          .select('status, clock_in, clock_out, date, notes')
          .eq('employee_id', user['id'])
          .order('date', ascending: false)
          .limit(1);
          
      if (mounted) {
        setState(() {
          if (resList.isEmpty) {
            _todayStatus = 'Belum Absen';
            _hasClockedIn = false;
            _clockInTime = null;
            _clockOutTime = null;
            _workDuration = null;
            _clockInNotes = null;
            return;
          }

          final res = resList.first;
          final isToday = res['date'] == today;
          final isPendingNightShift = !isToday && res['clock_out'] == null;

          if (!isToday && !isPendingNightShift) {
            // Catatan terakhir adalah hari sebelumnya dan sudah selesai
            _todayStatus = 'Belum Absen';
            _hasClockedIn = false;
            _clockInTime = null;
            _clockOutTime = null;
            _workDuration = null;
            _clockInNotes = null;
          } else {
            if (res['clock_out'] != null) {
              _todayStatus = 'Selesai (Pulang)';
            } else {
              _todayStatus = res['status'] ?? 'Sudah Absen';
            }
            _hasClockedIn = true;
            _clockInNotes = res['notes'];
            
            final inTime = _parseTime(res['clock_in']?.toString(), isPendingNightShift);
            final outTime = _parseTime(res['clock_out']?.toString(), false);
            
            if (inTime != null) {
              _clockInTime = "${inTime.hour.toString().padLeft(2, '0')}:${inTime.minute.toString().padLeft(2, '0')}";
              if (outTime != null) {
                _clockOutTime = "${outTime.hour.toString().padLeft(2, '0')}:${outTime.minute.toString().padLeft(2, '0')}";
                Duration diff = outTime.difference(inTime);
                if (diff.isNegative) diff += const Duration(hours: 24);
                _workDuration = "${diff.inHours}j ${diff.inMinutes % 60}m";
              } else {
                Duration diff = DateTime.now().difference(inTime);
                if (diff.isNegative) diff += const Duration(hours: 24);
                _workDuration = "${diff.inHours}j ${diff.inMinutes % 60}m";
              }
            }
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

  DateTime? _parseTime(String? timeStr, bool isYesterday) {
    if (timeStr == null) return null;
    try {
      if (timeStr.contains('T')) {
        return DateTime.parse(timeStr).toLocal();
      } else {
        DateTime base = DateTime.now();
        if (isYesterday) {
          base = base.subtract(const Duration(days: 1));
        }
        final parts = timeStr.split(':');
        return DateTime(base.year, base.month, base.day, int.parse(parts[0]), int.parse(parts[1]));
      }
    } catch(e) { return null; }
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

    showCupertinoModalPopup(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SafeArea(
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
                            decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(8)),
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
                      child: AnimatedTapButton(
                        onTap: tempSelected.isNotEmpty && tempSelected.length <= 7 
                          ? () {
                              final hapticEnabled = context.read<ThemeProvider>().hapticEnabled;
                              if (hapticEnabled) HapticFeedback.lightImpact();
                              _savePreferences(tempSelected);
                              Navigator.pop(context);
                            }
                          : () {},
                        scaleDown: 0.95,
                        child: Container(
                          width: double.infinity,
                          height: 50,
                          decoration: BoxDecoration(
                            color: tempSelected.isNotEmpty && tempSelected.length <= 7 ? AppConstants.primaryColor : CupertinoColors.systemGrey,
                            borderRadius: BorderRadius.circular(12)
                          ),
                          alignment: Alignment.center,
                          child: Text('SIMPAN PERUBAHAN', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, color: context.surfaceColor)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
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
        return CupertinoPageScaffold(
          backgroundColor: context.backgroundColor,
          child: SafeArea(
          child: Shimmer.fromColors(
            baseColor: context.isDarkMode ? Colors.grey.shade800 : Colors.grey.shade300,
            highlightColor: context.isDarkMode ? Colors.grey.shade700 : Colors.grey.shade100,
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

      return CupertinoPageScaffold(
        backgroundColor: context.backgroundColor,
        child: CustomScrollView(
        physics: const NeverScrollableScrollPhysics(),
        slivers: [
          // Dynamic Header with Scroll Transition
          SliverAppBar(
            expandedHeight: 175.0,
            floating: false,
            pinned: true,
            backgroundColor: context.surfaceColor,
            elevation: 0,
            iconTheme: IconThemeData(color: context.textPrimary),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
              side: BorderSide(color: context.borderColor, width: 1),
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
                          child: AnimatedTapButton(
                            onTap: () {
                              final hapticEnabled = context.read<ThemeProvider>().hapticEnabled;
                              if (hapticEnabled) HapticFeedback.selectionClick();
                              context.push('/id-card');
                            },
                            scaleDown: 0.9,
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
                              decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(12), border: Border.all(color: context.borderColor)),
                              child: Icon(Icons.notifications_outlined, color: context.textPrimary, size: 24),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Premium Glassmorphism Widget: Clock + Sensor
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: context.borderColor),
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
                                  SizedBox(height: 2),
                                  Row(
                                    children: [
                                      Icon(Icons.water_drop_outlined, color: Colors.blue, size: 10),
                                      SizedBox(width: 4),
                                      Text('Kelembapan: $_humidity', style: TextStyle(color: context.textSecondary, fontSize: 10)),
                                    ],
                                  ),
                                  SizedBox(height: 6),
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
                          color: Colors.orange.withValues(alpha: 0.1),
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
                            AnimatedTapButton(
                              onTap: _isSyncing ? () {} : () {
                                final hapticEnabled = context.read<ThemeProvider>().hapticEnabled;
                                if (hapticEnabled) HapticFeedback.mediumImpact();
                                _syncOfflineData(isSilent: false);
                              },
                              scaleDown: 0.95,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: CupertinoColors.activeOrange,
                                  borderRadius: BorderRadius.circular(8)
                                ),
                                child: _isSyncing 
                                  ? SizedBox(width: 16, height: 16, child: CupertinoActivityIndicator(color: context.surfaceColor))
                                  : Text('Sync', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold)),
                              ),
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
                          AnimatedTapButton(
                            onTap: () {
                              final hapticEnabled = context.read<ThemeProvider>().hapticEnabled;
                              if (hapticEnabled) HapticFeedback.selectionClick();
                              _showCustomizeModal();
                            },
                            scaleDown: 0.95,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(20)),
                              child: Row(
                                children: [
                                  Icon(Icons.edit, size: 12, color: context.textPrimary),
                                  const SizedBox(width: 4),
                                  Text('Atur Pintasan', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.textPrimary)),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                    _buildCleanQuickActions(context),
                    
                    const SizedBox(height: 16), // Fab spacing removed, minimal padding
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
        border: Border.all(color: context.borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: context.isDarkMode ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05),
            offset: const Offset(4, 4), blurRadius: 10, spreadRadius: 1,
          ),
          BoxShadow(
            color: context.isDarkMode ? Colors.white.withValues(alpha: 0.02) : Colors.white.withValues(alpha: 0.9),
            offset: const Offset(-4, -4), blurRadius: 10, spreadRadius: 1,
          ),
        ],
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
                    decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.location_on, color: Colors.blue, size: 20),
                  ),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.5,
                        child: Text(_locationName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.5,
                        child: Text(_locationDetail, style: TextStyle(fontSize: 10, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: _hasClockedIn ? Colors.green.withValues(alpha: 0.1) : Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                child: Text(_todayStatus, style: TextStyle(color: _hasClockedIn ? Colors.green : Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.borderColor),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildTimeSummary(context, 'Masuk', _clockInTime ?? '--:--', Icons.login),
                    Container(height: 30, width: 1, color: AppConstants.slate300),
                    _buildTimeSummary(context, 'Pulang', _clockOutTime ?? '--:--', Icons.logout),
                    Container(height: 30, width: 1, color: AppConstants.slate300),
                    _buildTimeSummary(context, 'Durasi', _workDuration ?? '--', Icons.timer),
                  ],
                ),
                if (_clockInNotes != null && _clockInNotes!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.notes, size: 12, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text('Catatan: $_clockInNotes', style: const TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic)),
                      ),
                    ],
                  )
                ]
              ],
            ),
          ),
          const SizedBox(height: 12),
          AnimatedTapButton(
            onTap: () {
              if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.heavyImpact();
              final type = _hasClockedIn ? "OUT" : "IN";
              context.push('/attendance-form?type=$type');
            },
            enableHaptic: false,
            scaleDown: 0.95,
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: Container(
                decoration: BoxDecoration(
                  color: context.textPrimary,
                  borderRadius: BorderRadius.circular(16)
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
          ),
        ],
      ),
    );
  }

  Widget _buildTimeSummary(BuildContext context, String label, String value, IconData icon) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: Colors.grey),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: context.textPrimary)),
      ],
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
        childAspectRatio: 0.85,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemBuilder: (context, index) {
        final action = displayActions[index];
        final isAllButton = action['id'] == 'all';

        return AnimatedCard(
          onTap: () {
            final hapticEnabled = context.read<ThemeProvider>().hapticEnabled;
            if (hapticEnabled) HapticFeedback.selectionClick();
            if (action['route'] != null) context.push(action['route'] as String);
          },
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 50, height: 50,
                decoration: BoxDecoration(
                  color: isAllButton ? AppConstants.primaryColor.withValues(alpha: 0.05) : context.surfaceColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isAllButton ? AppConstants.primaryColor.withValues(alpha: 0.2) : context.borderColor, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: context.isDarkMode ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.03),
                      offset: const Offset(2, 2), blurRadius: 6, spreadRadius: 0,
                    ),
                    BoxShadow(
                      color: context.isDarkMode ? Colors.white.withValues(alpha: 0.01) : Colors.white.withValues(alpha: 0.8),
                      offset: const Offset(-2, -2), blurRadius: 6, spreadRadius: 0,
                    ),
                  ],
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
