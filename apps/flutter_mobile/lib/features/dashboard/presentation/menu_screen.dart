import 'package:flutter/services.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/utils/constants.dart';
import '../../../core/widgets/animated_tap_button.dart';
import '../../../core/theme/theme_provider.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final List<Map<String, dynamic>> _essItems = [
    {'title': 'Izin & Cuti', 'icon': Icons.calendar_month, 'route': '/leave'},
    {'title': 'Lembur', 'icon': Icons.access_time, 'route': '/overtime'},
    {'title': 'Slip Gaji', 'icon': Icons.receipt_long, 'route': '/payslip'},
    {'title': 'Reimburse', 'icon': Icons.attach_money, 'route': '/reimburse'},
    {'title': 'Dokumen', 'icon': Icons.description_outlined, 'route': '/documents'},
    {'title': 'Direktori', 'icon': Icons.people_outline, 'route': '/directory'},
    {'title': 'Persetujuan', 'icon': Icons.fact_check_outlined, 'route': '/approval'},
    {'title': 'Asset', 'icon': Icons.work_outline, 'route': '/assets'},
  ];

  final List<Map<String, dynamic>> _reportItems = [
    {'title': 'KPI & Kinerja', 'icon': Icons.trending_up, 'route': '/performance'},
    {'title': 'Timesheet', 'icon': Icons.access_time_outlined, 'route': '/timesheet'},
    {'title': 'Pusat Laporan', 'icon': Icons.analytics_outlined, 'route': '/reports'},
  ];

  final List<Map<String, dynamic>> _supportItems = [
    {'title': 'Pengumuman', 'icon': Icons.campaign, 'route': '/announcements'},
    {'title': 'Academy', 'icon': Icons.school_outlined, 'route': '/academy'},
    {'title': 'Helpdesk', 'icon': Icons.help_outline, 'route': '/helpdesk'},
  ];

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: context.backgroundColor,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: context.surfaceColor,
        border: null,
        middle: Container(
          decoration: const BoxDecoration(border: Border(left: BorderSide(color: AppConstants.primaryColor, width: 4))),
          padding: EdgeInsets.only(left: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Menu Eksplorasi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
              Text('Kelola pekerjaan dan informasi perusahaan', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            // Stats Panel
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(14),
                border: Border(left: const BorderSide(color: AppConstants.primaryColor, width: 4), top: BorderSide(color: context.borderColor), right: BorderSide(color: context.borderColor), bottom: BorderSide(color: context.borderColor)),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]
              ),
              child: Row(
                children: [
                  _buildStatItem('12', 'Sisa Cuti'),
                  Container(width: 1, height: 24, color: context.borderColor),
                  _buildStatItem('98%', 'Kehadiran'),
                  Container(width: 1, height: 24, color: context.borderColor),
                  _buildStatItem('4.5h', 'Lembur (Bln ini)', color: AppConstants.primaryColor),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Accordion Sections
            _buildAccordionSection('KEPEGAWAIAN & ESS', Icons.business_center_outlined, _essItems, initiallyExpanded: true),
            const SizedBox(height: 12),
            _buildAccordionSection('LAPORAN & MONITORING', Icons.insert_chart_outlined, _reportItems),
            const SizedBox(height: 12),
            _buildAccordionSection('PENGEMBANGAN & DUKUNGAN', Icons.headset_mic_outlined, _supportItems),
            
            const SizedBox(height: 24),

            // Promo Banner
            AnimatedTapButton(
              onTap: () {
                if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.lightImpact();
                context.push('/academy');
              },
              enableHaptic: false,
              scaleDown: 0.96,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppConstants.primaryColor, Color(0xFFE31E24)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))]
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('WKN Academy', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, fontSize: 16)),
                          SizedBox(height: 4),
                          Text('Pelajari modul dan sertifikasi baru secara mandiri.', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    Icon(Icons.arrow_circle_right, color: context.surfaceColor, size: 32)
                  ],
                ),
              ),
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildStatItem(String val, String label, {Color? color}) {
    return Expanded(
      child: Column(
        children: [
          Text(val, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color ?? context.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildAccordionSection(String title, IconData headerIcon, List<Map<String, dynamic>> items, {bool initiallyExpanded = false}) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 8, offset: const Offset(0, 2))]
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            initiallyExpanded: initiallyExpanded,
            iconColor: AppConstants.primaryColor,
            collapsedIconColor: Colors.grey.shade400,
            leading: Icon(headerIcon, color: context.textPrimary, size: 24),
            title: Text(
              title, 
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: context.textPrimary, letterSpacing: 0.5)
            ),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: GridView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.75
                  ),
                  itemCount: items.length,
                   itemBuilder: (context, index) {
                    final item = items[index];
                    return AnimatedTapButton(
                      onTap: () {
                        if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.lightImpact();
                        context.push(item['route']);
                      },
                      enableHaptic: false,
                      scaleDown: 0.90,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Container(
                            width: 52, height: 52,
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: context.borderColor)
                            ),
                            child: Icon(item['icon'], color: AppConstants.primaryColor, size: 24),
                          ),
                          SizedBox(height: 8),
                          Text(
                            item['title'], 
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: context.textSecondary), 
                            textAlign: TextAlign.center, 
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
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
    );
  }
}
