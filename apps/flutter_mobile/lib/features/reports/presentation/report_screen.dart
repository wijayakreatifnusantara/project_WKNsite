import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter/services.dart';
import '../../../core/utils/constants.dart';
import '../data/attendance_provider.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTimeRange _dateRange = DateTimeRange(
    start: DateTime.now().subtract(const Duration(days: 7)),
    end: DateTime.now(),
  );

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    // Fetch data initial
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AttendanceProvider>().fetchAttendanceData(_dateRange.start, _dateRange.end);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _pickDateRange() async {
    HapticFeedback.lightImpact();
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
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        title: Text('Pusat Laporan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: Column(
        children: [
          // Global Filter Section
          Container(
            color: context.surfaceColor,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              children: [
                InkWell(
                  onTap: _pickDateRange,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: context.borderColor),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_month, color: AppConstants.primaryColor, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Filter Tanggal (Global)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                              SizedBox(height: 2),
                              Text(_formattedDateRange, style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary, fontSize: 13)),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_drop_down, color: Colors.grey),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  height: 42,
                  decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(10)),
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(color: context.textPrimary, borderRadius: BorderRadius.circular(8)),
                    labelColor: context.surfaceColor,
                    unselectedLabelColor: Colors.grey.shade600,
                    labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    onTap: (_) => HapticFeedback.selectionClick(),
                    tabs: const [
                      Tab(text: 'Absensi'),
                      Tab(text: 'Lembur'),
                      Tab(text: 'Cuti'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Tab Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildAttendanceReport(),
                _buildUnderConstruction('Laporan Lembur'),
                _buildUnderConstruction('Laporan Cuti & Izin'),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildAttendanceReport() {
    return Consumer<AttendanceProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return _buildShimmerLoading();
        }

        final stats = provider.statistics;
        final logs = provider.attendanceLogs;

        if (logs.isEmpty) {
          return _buildUnderConstruction('Laporan Absensi');
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stat Cards
              Row(
                children: [
                  _buildStatCard('Hadir', stats['hadir'].toString(), Colors.green, Icons.check_circle_outline),
                  const SizedBox(width: 12),
                  _buildStatCard('Telat', stats['telat'].toString(), Colors.orange, Icons.timer_outlined),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildStatCard('Sakit', stats['sakit'].toString(), Colors.blue, Icons.local_hospital_outlined),
                  const SizedBox(width: 12),
                  _buildStatCard('Alpa', stats['alpa'].toString(), Colors.red, Icons.cancel_outlined),
                ],
              ),
              
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('DETAIL RIWAYAT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                  TextButton.icon(
                    onPressed: () => HapticFeedback.heavyImpact(), 
                    icon: const Icon(Icons.download, size: 16), 
                    label: const Text('Export', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))
                  )
                ],
              ),
              const SizedBox(height: 8),

              // Log Table
              Container(
                decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), border: Border.all(color: context.borderColor)),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: logs.length,
                  separatorBuilder: (context, index) => Divider(height: 1, color: Colors.grey.shade100),
                  itemBuilder: (context, index) {
                    final log = logs[index];
                    final date = DateTime.parse(log['date']);
                    final isLate = log['status'] == 'Terlambat';
                    
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      leading: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(color: isLate ? Colors.orange.shade50 : Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                        child: Center(child: Text(DateFormat('dd').format(date), style: TextStyle(fontWeight: FontWeight.bold, color: isLate ? Colors.orange : Colors.green))),
                      ),
                      title: Text(DateFormat('EEEE, MMM yyyy').format(date), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: context.textPrimary)),
                      subtitle: Text('In: ${log['in']}  •  Out: ${log['out']}', style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: isLate ? Colors.orange.shade50 : Colors.green.shade50, borderRadius: BorderRadius.circular(4)),
                        child: Text(log['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isLate ? Colors.orange : Colors.green)),
                      ),
                    );
                  },
                ),
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildShimmerLoading() {
    return Shimmer.fromColors(
      baseColor: context.borderColor,
      highlightColor: context.surfaceColor,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16)))),
                const SizedBox(width: 12),
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16)))),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16)))),
                const SizedBox(width: 12),
                Expanded(child: Container(height: 80, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16)))),
              ],
            ),
            const SizedBox(height: 32),
            Container(width: 120, height: 16, color: context.surfaceColor),
            const SizedBox(height: 16),
            Container(height: 300, decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16))),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), border: Border.all(color: context.borderColor), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 8, offset: const Offset(0, 2))]),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Icon(icon, color: color, size: 16)),
                Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: context.textPrimary)),
              ],
            ),
            const SizedBox(height: 12),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
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
          Icon(Icons.construction, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text('$title Belum Tersedia', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          const Text('Data pada rentang tanggal ini kosong.', style: TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }
}
