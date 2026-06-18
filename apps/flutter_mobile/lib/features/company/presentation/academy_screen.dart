import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../../../widgets/ios_card.dart';

class AcademyScreen extends StatelessWidget {
  const AcademyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: AppConstants.primaryColor,
        middle: const Text('WKN Academy', style: TextStyle(color: CupertinoColors.white)),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => context.pop(),
          child: const Icon(CupertinoIcons.back, color: CupertinoColors.white),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                await Future.delayed(const Duration(seconds: 1)); // Mock refresh
              },
            ),
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20).copyWith(bottom: 40),
                    decoration: const BoxDecoration(
                      color: AppConstants.primaryColor,
                      borderRadius: BorderRadius.only(bottomLeft: Radius.circular(30), bottomRight: Radius.circular(30))
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tingkatkan Keterampilan Anda', style: TextStyle(color: CupertinoColors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('Ikuti modul pelatihan dan sertifikasi internal secara mandiri.', style: TextStyle(color: CupertinoColors.white.withValues(alpha: 0.8), fontSize: 14)),
                        const SizedBox(height: 24),
                        // Progress Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white, borderRadius: BorderRadius.circular(16)),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 60, height: 60,
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    CircularProgressIndicator(value: 0.4, backgroundColor: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6, color: CupertinoColors.systemOrange, strokeWidth: 6),
                                    Center(child: Text('40%', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isDark ? CupertinoColors.white : CupertinoColors.black))),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Progress Belajar Bulan Ini', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: CupertinoColors.systemGrey)),
                                    const SizedBox(height: 4),
                                    Text('2 dari 5 Modul Selesai', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                  ],
                                ),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('MODUL WAJIB (OJT)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                        const SizedBox(height: 12),
                        _buildCourseCard(
                          context,
                          isDark: isDark,
                          title: 'Orientasi Karyawan Baru', 
                          duration: '45 Menit', 
                          progress: 1.0, 
                          isCompleted: true, 
                          icon: CupertinoIcons.briefcase_fill
                        ),
                        _buildCourseCard(
                          context,
                          isDark: isDark,
                          title: 'K3 Dasar Perusahaan', 
                          duration: '60 Menit', 
                          progress: 0.0, 
                          isCompleted: false, 
                          icon: CupertinoIcons.shield_fill
                        ),

                        const SizedBox(height: 24),
                        const Text('PENGEMBANGAN DIRI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                        const SizedBox(height: 12),
                        _buildCourseCard(
                          context,
                          isDark: isDark,
                          title: 'Effective Communication', 
                          duration: '2 Jam', 
                          progress: 0.3, 
                          isCompleted: false, 
                          icon: CupertinoIcons.mic_fill
                        ),
                        _buildCourseCard(
                          context,
                          isDark: isDark,
                          title: 'Dasar-Dasar Manajemen Proyek', 
                          duration: '3 Jam', 
                          progress: 0.0, 
                          isCompleted: false, 
                          icon: CupertinoIcons.flowchart_fill
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseCard(BuildContext context, {required bool isDark, required String title, required String duration, required double progress, required bool isCompleted, required IconData icon}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: IosCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: isCompleted ? CupertinoColors.activeGreen.withValues(alpha: 0.1) : CupertinoColors.activeBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: isCompleted ? CupertinoColors.activeGreen : CupertinoColors.activeBlue),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(CupertinoIcons.clock_fill, size: 12, color: CupertinoColors.systemGrey),
                      const SizedBox(width: 4),
                      Text(duration, style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 6,
                          decoration: BoxDecoration(color: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6, borderRadius: BorderRadius.circular(3)),
                          child: FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: progress,
                            child: Container(decoration: BoxDecoration(color: isCompleted ? CupertinoColors.activeGreen : CupertinoColors.systemOrange, borderRadius: BorderRadius.circular(3))),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text('${(progress * 100).toInt()}%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isCompleted ? CupertinoColors.activeGreen : CupertinoColors.systemOrange))
                    ],
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
