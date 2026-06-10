import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class AcademyScreen extends StatelessWidget {
  const AcademyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppConstants.primaryColor,
        elevation: 0,
        title: Text('WKN Academy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.surfaceColor)),
        leading: IconButton(icon: Icon(Icons.arrow_back, color: context.surfaceColor), onPressed: () => context.pop()),
      ),
      body: SingleChildScrollView(
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
                  Text('Tingkatkan Keterampilan Anda', style: TextStyle(color: context.surfaceColor, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Ikuti modul pelatihan dan sertifikasi internal secara mandiri.', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 24),
                  // Progress Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16)),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 60, height: 60,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              CircularProgressIndicator(value: 0.4, backgroundColor: context.borderColor, color: Colors.orange, strokeWidth: 6),
                              const Center(child: Text('40%', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Progress Belajar Bulan Ini', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
                              SizedBox(height: 4),
                              Text('2 dari 5 Modul Selesai', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: context.textPrimary)),
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
                  const Text('MODUL WAJIB (OJT)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                  const SizedBox(height: 12),
                  _buildCourseCard(
                    context,
                    title: 'Orientasi Karyawan Baru', 
                    duration: '45 Menit', 
                    progress: 1.0, 
                    isCompleted: true, 
                    icon: Icons.business_center
                  ),
                  _buildCourseCard(
                    context,
                    title: 'K3 Dasar Perusahaan', 
                    duration: '60 Menit', 
                    progress: 0.0, 
                    isCompleted: false, 
                    icon: Icons.health_and_safety
                  ),

                  const SizedBox(height: 24),
                  const Text('PENGEMBANGAN DIRI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                  const SizedBox(height: 12),
                  _buildCourseCard(
                    context,
                    title: 'Effective Communication', 
                    duration: '2 Jam', 
                    progress: 0.3, 
                    isCompleted: false, 
                    icon: Icons.record_voice_over
                  ),
                  _buildCourseCard(
                    context,
                    title: 'Dasar-Dasar Manajemen Proyek', 
                    duration: '3 Jam', 
                    progress: 0.0, 
                    isCompleted: false, 
                    icon: Icons.account_tree
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCourseCard(BuildContext context, {required String title, required String duration, required double progress, required bool isCompleted, required IconData icon}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))]
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: isCompleted ? Colors.green.shade50 : Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: isCompleted ? Colors.green : Colors.blue),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 12, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(duration, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 6,
                        decoration: BoxDecoration(color: context.borderColor, borderRadius: BorderRadius.circular(3)),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: progress,
                          child: Container(decoration: BoxDecoration(color: isCompleted ? Colors.green : Colors.orange, borderRadius: BorderRadius.circular(3))),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('${(progress * 100).toInt()}%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isCompleted ? Colors.green : Colors.orange))
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
