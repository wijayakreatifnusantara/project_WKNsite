import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import '../../../core/utils/constants.dart';
import '../../../widgets/ios_card.dart';

class PerformanceScreen extends StatelessWidget {
  const PerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Kinerja & KPI'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                await Future.delayed(const Duration(seconds: 1)); // Mock refresh
              },
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Score Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [AppConstants.primaryColor, isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.activeBlue]),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))]
                      ),
                      child: Column(
                        children: [
                          const Text('SKOR KPI BULAN INI', style: TextStyle(color: CupertinoColors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                          const SizedBox(height: 8),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text('92', style: TextStyle(color: CupertinoColors.white, fontSize: 48, fontWeight: FontWeight.w900)),
                              Text('/100', style: TextStyle(color: CupertinoColors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(color: CupertinoColors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
                            child: const Text('Kinerja Sangat Baik (A)', style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                          )
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    const Padding(
                      padding: EdgeInsets.only(left: 16, bottom: 8),
                      child: Text('TARGET & PENCAPAIAN (OKR)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                    ),
                    
                    IosCard(
                      padding: EdgeInsets.zero,
                      child: Column(
                        children: [
                          _buildTargetItem(context, isDark: isDark, title: 'Penyelesaian Proyek Migrasi Aplikasi', target: '100%', achieved: '100%', progress: 1.0, color: CupertinoColors.activeGreen),
                          const Divider(height: 1, color: CupertinoColors.systemGrey4),
                          _buildTargetItem(context, isDark: isDark, title: 'Zero Critical Bugs di Produksi', target: '0 Bugs', achieved: '2 Bugs', progress: 0.8, color: CupertinoColors.systemOrange),
                          const Divider(height: 1, color: CupertinoColors.systemGrey4),
                          _buildTargetItem(context, isDark: isDark, title: 'Pencapaian Kehadiran Bulanan', target: '95%', achieved: '98%', progress: 0.98, color: AppConstants.primaryColor),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    const Padding(
                      padding: EdgeInsets.only(left: 16, bottom: 8),
                      child: Text('CATATAN MANAJER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                    ),
                    IosCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 32, height: 32,
                                decoration: BoxDecoration(shape: BoxShape.circle, color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6),
                                child: const Icon(CupertinoIcons.person_fill, size: 16, color: CupertinoColors.systemGrey),
                              ),
                              const SizedBox(width: 12),
                              Text('Budi Santoso (VP Engineering)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text('"Kerja bagus dalam menyelesaikan migrasi React Native ke Flutter tepat waktu. Pertahankan kecepatan dan teliti ulang beberapa bug kecil yang tersisa."', style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: CupertinoColors.systemGrey, height: 1.5)),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTargetItem(BuildContext context, {required bool isDark, required String title, required String target, required String achieved, required double progress, required Color color}) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Target: $target', style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
              Text('Tercapai: $achieved', style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 6,
            decoration: BoxDecoration(color: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6, borderRadius: BorderRadius.circular(3)),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: progress,
              child: Container(decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
            ),
          )
        ],
      ),
    );
  }
}
