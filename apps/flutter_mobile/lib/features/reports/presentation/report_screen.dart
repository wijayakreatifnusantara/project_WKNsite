import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter/services.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/theme_provider.dart';
import '../data/attendance_provider.dart';
import '../../../widgets/ios_card.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  int _selectedTabIndex = 0;
  DateTimeRange _dateRange = DateTimeRange(
    start: DateTime.now().subtract(const Duration(days: 7)),
    end: DateTime.now(),
  );

  @override
  void initState() {
    super.initState();
    // Fetch data initial
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AttendanceProvider>().fetchAttendanceData(_dateRange.start, _dateRange.end);
    });
  }

  Future<void> _pickDateRange() async {
    if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.lightImpact();
    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: _dateRange,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppConstants.primaryColor,
              onPrimary: context.surfaceColor,
              onSurface: context.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && mounted) {
      setState(() {
        _dateRange = picked;
      });
      // Fetch data based on new date range
      context.read<AttendanceProvider>().fetchAttendanceData(picked.start, picked.end);
    }
  }

  String get _formattedDateRange {
    final start = DateFormat('dd MMM yyyy').format(_dateRange.start);
    final end = DateFormat('dd MMM yyyy').format(_dateRange.end);
    if (start == end) return start;
    return '$start  -  $end';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Pusat Laporan'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Global Filter Section
            Container(
              color: isDark ? CupertinoColors.black : CupertinoColors.white,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _pickDateRange,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.systemGrey6 : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey4),
                      ),
                      child: Row(
                        children: [
                          const Icon(CupertinoIcons.calendar, color: AppConstants.primaryColor, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Filter Tanggal (Global)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
                                const SizedBox(height: 2),
                                Text(_formattedDateRange, style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black, fontSize: 13)),
                              ],
                            ),
                          ),
                          const Icon(CupertinoIcons.chevron_down, color: CupertinoColors.systemGrey, size: 16),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: CupertinoSlidingSegmentedControl<int>(
                      groupValue: _selectedTabIndex,
                      onValueChanged: (int? value) {
                        if (value != null) {
                          if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.selectionClick();
                          setState(() {
                            _selectedTabIndex = value;
                          });
                        }
                      },
                      children: const {
                        0: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('Absensi', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
                        1: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('Lembur', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
                        2: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('Cuti', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
                      },
                    ),
                  ),
                ],
              ),
            ),
            
            // Tab Content
            Expanded(
              child: _buildSelectedTabContent(isDark),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSelectedTabContent(bool isDark) {
    switch (_selectedTabIndex) {
      case 0:
        return _buildAttendanceReport(isDark);
      case 1:
        return _buildUnderConstruction('Laporan Lembur');
      case 2:
        return _buildUnderConstruction('Laporan Cuti & Izin');
      default:
        return const SizedBox();
    }
  }

  Widget _buildAttendanceReport(bool isDark) {
    return Consumer<AttendanceProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return _buildShimmerLoading(isDark);
        }

        final stats = provider.statistics;
        final logs = provider.attendanceLogs;

        if (logs.isEmpty) {
          return _buildUnderConstruction('Laporan Absensi');
        }

        return CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                context.read<AttendanceProvider>().fetchAttendanceData(_dateRange.start, _dateRange.end);
                await Future.delayed(const Duration(seconds: 1));
              },
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Stat Cards
                    Row(
                      children: [
                        _buildStatCard('Hadir', stats['hadir'].toString(), CupertinoColors.activeGreen, CupertinoIcons.check_mark_circled, isDark),
                        const SizedBox(width: 12),
                        _buildStatCard('Telat', stats['telat'].toString(), CupertinoColors.systemOrange, CupertinoIcons.timer, isDark),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildStatCard('Sakit', stats['sakit'].toString(), CupertinoColors.activeBlue, CupertinoIcons.bandage, isDark),
                        const SizedBox(width: 12),
                        _buildStatCard('Alpa', stats['alpa'].toString(), CupertinoColors.destructiveRed, CupertinoIcons.xmark_circle, isDark),
                      ],
                    ),
                    
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 8),
                          child: Text('DETAIL RIWAYAT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                        ),
                        CupertinoButton(
                          padding: EdgeInsets.zero,
                          onPressed: () => HapticFeedback.heavyImpact(), 
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(CupertinoIcons.arrow_down_doc, size: 16),
                              SizedBox(width: 4),
                              Text('Export', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))
                            ],
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Log Table
                    IosCard(
                      padding: EdgeInsets.zero,
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: EdgeInsets.zero,
                        itemCount: logs.length,
                        separatorBuilder: (context, index) => const Divider(height: 1, color: CupertinoColors.systemGrey4),
                        itemBuilder: (context, index) {
                          final log = logs[index];
                          final date = DateTime.parse(log['date']);
                          final isLate = log['status'] == 'Terlambat';
                          
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(
                              children: [
                                Container(
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(color: isLate ? CupertinoColors.systemOrange.withValues(alpha: 0.1) : CupertinoColors.activeGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                  child: Center(child: Text(DateFormat('dd').format(date), style: TextStyle(fontWeight: FontWeight.bold, color: isLate ? CupertinoColors.systemOrange : CupertinoColors.activeGreen))),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(DateFormat('EEEE, MMM yyyy').format(date), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                      const SizedBox(height: 2),
                                      Text('In: ${log['in']}  •  Out: ${log['out']}', style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: isLate ? CupertinoColors.systemOrange.withValues(alpha: 0.1) : CupertinoColors.activeGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                                  child: Text(log['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isLate ? CupertinoColors.systemOrange : CupertinoColors.activeGreen)),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    )
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildShimmerLoading(bool isDark) {
    return Shimmer.fromColors(
      baseColor: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey5,
      highlightColor: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16)))),
                const SizedBox(width: 12),
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16)))),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16)))),
                const SizedBox(width: 12),
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16)))),
              ],
            ),
            const SizedBox(height: 32),
            Container(width: 120, height: 16, color: CupertinoColors.white),
            const SizedBox(height: 16),
            Container(height: 300, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16))),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5), boxShadow: [BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.01), blurRadius: 8, offset: const Offset(0, 2))]),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Icon(icon, color: color, size: 16)),
                Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
              ],
            ),
            const SizedBox(height: 12),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
          ],
        ),
      ),
    );
  }

  Widget _buildUnderConstruction(String title) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(CupertinoIcons.hammer_fill, size: 48, color: CupertinoColors.systemGrey.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('$title Belum Tersedia', style: const TextStyle(fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
          const Text('Data pada rentang tanggal ini kosong.', style: TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
        ],
      ),
    );
  }
}
