import 'package:flutter/services.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import '../../../widgets/ios_card.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:geocoding/geocoding.dart' as geocoding;

class IosHomeScreen extends StatefulWidget {
  const IosHomeScreen({super.key});

  @override
  State<IosHomeScreen> createState() => _IosHomeScreenState();
}

class _IosHomeScreenState extends State<IosHomeScreen> {
  // Master list of all available actions
  final List<Map<String, dynamic>> _allActions = [
    {'id': 'leave', 'icon': CupertinoIcons.calendar, 'label': 'Izin', 'route': '/leave'},
    {'id': 'overtime', 'icon': CupertinoIcons.timer, 'label': 'Lembur', 'route': '/overtime'},
    {'id': 'payslip', 'icon': CupertinoIcons.doc_text, 'label': 'Slip Gaji', 'route': '/payslip'},
    {'id': 'reimburse', 'icon': CupertinoIcons.money_dollar_circle, 'label': 'Reimburse', 'route': '/reimburse'},
    {'id': 'documents', 'icon': CupertinoIcons.doc, 'label': 'Dokumen', 'route': '/documents'},
    {'id': 'directory', 'icon': CupertinoIcons.person_2, 'label': 'Direktori', 'route': '/directory'},
    {'id': 'approval', 'icon': CupertinoIcons.check_mark_circled, 'label': 'Persetujuan', 'route': '/approval'},
    {'id': 'assets', 'icon': CupertinoIcons.briefcase, 'label': 'Asset', 'route': '/assets'},
    {'id': 'performance', 'icon': CupertinoIcons.chart_bar, 'label': 'KPI', 'route': '/performance'},
    {'id': 'timesheet', 'icon': CupertinoIcons.clock, 'label': 'Timesheet', 'route': '/timesheet'},
    {'id': 'reports', 'icon': CupertinoIcons.graph_square, 'label': 'Laporan', 'route': '/reports'},
    {'id': 'announcements', 'icon': CupertinoIcons.speaker_2, 'label': 'Pengumuman', 'route': '/announcements'},
    {'id': 'academy', 'icon': CupertinoIcons.book, 'label': 'Academy', 'route': '/academy'},
    {'id': 'helpdesk', 'icon': CupertinoIcons.question_circle, 'label': 'Helpdesk', 'route': '/helpdesk'},
    {'id': 'assistant', 'icon': CupertinoIcons.sparkles, 'label': 'AI HR', 'route': '/assistant'},
    {'id': 'leaderboard', 'icon': CupertinoIcons.rosette, 'label': 'Peringkat', 'route': '/leaderboard'},
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
    if (code == null) return CupertinoIcons.cloud;
    if (code == 0) return CupertinoIcons.sun_max;
    if (code <= 3) return CupertinoIcons.cloud;
    if (code <= 48) return CupertinoIcons.cloud_fog;
    if (code <= 67) return CupertinoIcons.cloud_drizzle;
    if (code <= 77) return CupertinoIcons.snow;
    if (code <= 82) return CupertinoIcons.cloud_heavyrain;
    if (code <= 86) return CupertinoIcons.snow;
    if (code <= 99) return CupertinoIcons.cloud_bolt;
    return CupertinoIcons.cloud;
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
    } catch (e) {
      // Failed silently in iOS style or handle with Cupertino alert
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
      } catch (e) {}
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().userData;

    return CupertinoPageScaffold(
      backgroundColor: context.isDarkMode 
          ? CupertinoColors.black 
          : CupertinoColors.systemGroupedBackground,
      child: CustomScrollView(
        slivers: [
          CupertinoSliverNavigationBar(
            largeTitle: Text('Halo, ${user?['name']?.split(' ')[0] ?? 'Karyawan'}'),
            border: null,
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GestureDetector(
                  onTap: () {}, // Add notification logic here later
                  child: const Icon(CupertinoIcons.bell, size: 24, color: CupertinoColors.systemGrey),
                ),
                const SizedBox(width: 16),
                GestureDetector(
                  onTap: () => context.push('/id-card'),
                  child: CachedAvatar(
                    imageUrl: user?['avatar_url'],
                    name: user?['name'] ?? 'User',
                    radius: 16,
                    fontSize: 12,
                    backgroundColor: AppConstants.slate100,
                  ),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_pendingOfflineCount > 0) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemOrange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(CupertinoIcons.cloud_upload, color: CupertinoColors.systemOrange),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              '$_pendingOfflineCount absen tertunda. Akan diunggah otomatis saat online.',
                              style: const TextStyle(fontSize: 13, color: CupertinoColors.systemOrange),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  _buildWeatherTimeCard(context),
                  const SizedBox(height: 16),
                  IosCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Kehadiran Hari Ini',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _hasClockedIn 
                                  ? CupertinoColors.activeGreen.withValues(alpha: 0.1) 
                                  : CupertinoColors.systemGrey.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _todayStatus,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: _hasClockedIn ? CupertinoColors.activeGreen : CupertinoColors.systemGrey,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildInfoColumn('Clock In', _clockInTime ?? '--:--', CupertinoColors.activeBlue),
                            _buildInfoColumn('Clock Out', _clockOutTime ?? '--:--', CupertinoColors.systemRed),
                            _buildInfoColumn('Durasi', _workDuration ?? '-', CupertinoColors.systemGreen),
                          ],
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: AnimatedTapButton(
                            onTap: () {
                              if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.lightImpact();
                              if (!_hasClockedIn || _clockOutTime == null) {
                                context.push('/attendance-form?type=${_hasClockedIn ? "OUT" : "IN"}');
                              }
                            },
                            hapticType: HapticType.medium,
                            enableHaptic: false, // already handled above
                            child: CupertinoButton.filled(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              onPressed: null,
                              child: Text(
                                _hasClockedIn && _clockOutTime == null ? 'Clock Out Sekarang' : 'Clock In Sekarang',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, bottom: 8.0),
                    child: Text(
                      'PINTASAN UTAMA',
                      style: TextStyle(
                        fontSize: 13,
                        color: CupertinoColors.systemGrey,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  _buildCupertinoList(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeatherTimeCard(BuildContext context) {
    return IosCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, fontFeatures: [FontFeature.tabularFigures()])
                  ),
                  const SizedBox(width: 4),
                  const Text('WIB', style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              Text(_currentDate.isNotEmpty ? _currentDate : 'Memuat...', style: const TextStyle(color: CupertinoColors.systemGrey, fontSize: 12)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  Icon(_getWeatherIcon(_weatherCode), color: CupertinoColors.activeBlue, size: 16),
                  const SizedBox(width: 6),
                  Text(_weatherTemp, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 2),
              Text(_weatherCondition, style: const TextStyle(color: CupertinoColors.systemGrey, fontSize: 12)),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text('${_compassHeading?.toStringAsFixed(0) ?? '--'}°', style: const TextStyle(color: CupertinoColors.systemGrey, fontSize: 10)),
                  const SizedBox(width: 4),
                  Transform.rotate(
                    angle: ((_compassHeading ?? 0) * (math.pi / 180) * -1),
                    child: const Icon(CupertinoIcons.location_north, color: CupertinoColors.systemRed, size: 12),
                  )
                ],
              )
            ],
          )
        ],
      ),
    );
  }

  Widget _buildInfoColumn(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: CupertinoColors.systemGrey,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildCupertinoList(BuildContext context) {
    final isDark = context.isDarkMode;
    final bgColor = isDark 
        ? CupertinoColors.systemGrey6.darkColor 
        : CupertinoColors.white;

    // Filter active actions
    final activeItems = _allActions.where((a) => _activeActionIds.contains(a['id'])).toList();

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: activeItems.asMap().entries.map((entry) {
          final int idx = entry.key;
          final Map<String, dynamic> item = entry.value;
          final bool isLast = idx == activeItems.length - 1;
          
          return FadeSlideIn(
            delay: Duration(milliseconds: 50 * idx),
            child: Column(
              children: [
                _buildListItem(item['icon'] as IconData, item['label'] as String, item['route'] as String, isDark),
                if (!isLast) _buildDivider(isDark),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildListItem(IconData icon, String title, String route, bool isDark) {
    return AnimatedTapButton(
      onTap: () {
        if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.lightImpact();
        context.push(route);
      },
      enableHaptic: false,
      scaleDown: 0.97,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: CupertinoColors.activeBlue, size: 24),
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
            const Icon(
              CupertinoIcons.chevron_right,
              color: CupertinoColors.systemGrey3,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(left: 52.0),
      child: Container(
        height: 0.5,
        color: isDark ? CupertinoColors.systemGrey4.darkColor : CupertinoColors.systemGrey4,
      ),
    );
  }
}
