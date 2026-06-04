import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import '../../auth/data/auth_provider.dart';
import '../../../core/utils/constants.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../attendance/data/attendance_service.dart';
import '../../attendance/data/offline_attendance_service.dart';

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
  ];

  // Default active actions if user hasn't customized
  List<String> _activeActionIds = ['leave', 'overtime', 'payslip', 'reimburse', 'documents', 'performance', 'reports'];
  bool _isLoading = true;
  String _todayStatus = 'Memuat...';
  bool _hasClockedIn = false;
  
  final OfflineAttendanceService _offlineService = OfflineAttendanceService();
  int _pendingOfflineCount = 0;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchTodayAttendance();
      _checkOfflineData();
    });
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

  Future<void> _syncOfflineData() async {
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
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: Colors.grey.shade200))
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Kustomisasi Pintasan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
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
                      color: Colors.white,
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
                            foregroundColor: Colors.white,
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
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Dynamic Header with Scroll Transition
          SliverAppBar(
            expandedHeight: 240.0,
            floating: false,
            pinned: true,
            backgroundColor: AppConstants.primaryColor,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
              title: LayoutBuilder(
                builder: (context, constraints) {
                  final settings = context.dependOnInheritedWidgetOfExactType<FlexibleSpaceBarSettings>();
                  final deltaExtent = settings!.maxExtent - settings.minExtent;
                  final t = (1.0 - (settings.currentExtent - settings.minExtent) / deltaExtent).clamp(0.0, 1.0);
                  
                  return Opacity(
                    opacity: t, 
                    child: Row(
                      children: [
                        const Text('WKN Mobile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                        const Spacer(),
                        Padding(
                          padding: const EdgeInsets.only(right: 16.0),
                          child: InkWell(
                            onTap: () => context.push('/id-card'),
                            child: CircleAvatar(
                              radius: 14,
                              backgroundColor: Colors.white24,
                              child: Text(user?['name']?.substring(0, 1).toUpperCase() ?? 'A', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
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
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppConstants.primaryColor,
                      AppConstants.primaryColor.withValues(alpha: 0.8),
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Selamat Pagi,', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
                                const SizedBox(height: 4),
                                Text(user?['name'] ?? 'Karyawan', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 24),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('WAKTU SAAT INI', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    const Text('08:15', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                                    const SizedBox(width: 4),
                                    Text('WIB', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const Text('Senin, 30 Mei 2026', style: TextStyle(color: Colors.white, fontSize: 12)),
                              ],
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(color: Colors.green.shade400, borderRadius: BorderRadius.circular(20)),
                              child: Row(
                                children: const [
                                  Icon(Icons.wifi, color: Colors.white, size: 12),
                                  SizedBox(width: 6),
                                  Text('ONLINE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                                ],
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          
          // Body Content
          SliverToBoxAdapter(
            child: Transform.translate(
              offset: const Offset(0, -30), // Floating overlapping effect
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFloatingAttendanceCard(context),
                    const SizedBox(height: 24),
                    
                    if (_pendingOfflineCount > 0)
                      Container(
                        margin: const EdgeInsets.only(bottom: 24),
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
                              onPressed: _isSyncing ? null : _syncOfflineData,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                foregroundColor: Colors.white,
                              ),
                              child: _isSyncing 
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Sync'),
                            ),
                          ],
                        ),
                      ),
                      
                    Padding(
                      padding: const EdgeInsets.only(left: 8.0, bottom: 16.0, top: 16.0, right: 8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Layanan Mandiri', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1)),
                          InkWell(
                            onTap: _showCustomizeModal,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(20)),
                              child: const Row(
                                children: [
                                  Icon(Icons.edit, size: 12, color: AppConstants.textPrimary),
                                  SizedBox(width: 4),
                                  Text('Atur Pintasan', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
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
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppConstants.textPrimary,
        onPressed: () => context.push('/assistant'),
        elevation: 4,
        child: const Icon(Icons.auto_awesome, color: Colors.white),
      ),
    );
  }

  Widget _buildFloatingAttendanceCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.15), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      padding: const EdgeInsets.all(20),
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
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('WKN Office Tower', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppConstants.textPrimary)),
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
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.heavyImpact();
                context.push('/camera?type=${_hasClockedIn ? 'OUT' : 'IN'}');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.textPrimary,
                foregroundColor: Colors.white,
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
        childAspectRatio: 0.85,
        crossAxisSpacing: 12,
        mainAxisSpacing: 16,
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
                width: 58, height: 58,
                decoration: BoxDecoration(
                  color: isAllButton ? AppConstants.primaryColor.withValues(alpha: 0.1) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isAllButton ? Colors.transparent : Colors.grey.shade100),
                  boxShadow: isAllButton ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 10, offset: const Offset(0, 4))],
                ),
                child: Icon(
                  action['icon'] as IconData,
                  color: isAllButton ? AppConstants.primaryColor : AppConstants.textPrimary,
                  size: 26,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                action['label'] as String,
                style: TextStyle(
                  fontSize: 11, 
                  fontWeight: FontWeight.bold, 
                  color: isAllButton ? AppConstants.primaryColor : AppConstants.textPrimary
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
