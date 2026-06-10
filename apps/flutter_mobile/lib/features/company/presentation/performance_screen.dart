import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class PerformanceScreen extends StatelessWidget {
  const PerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Kinerja & KPI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Score Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [AppConstants.primaryColor, Colors.blue.shade800]),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))]
              ),
              child: Column(
                children: [
                  const Text('SKOR KPI BULAN INI', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text('92', style: TextStyle(color: context.surfaceColor, fontSize: 48, fontWeight: FontWeight.w900)),
                      Text('/100', style: TextStyle(color: Colors.white70, fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  SizedBox(height: 16),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: context.surfaceColor.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
                    child: Text('Kinerja Sangat Baik (A)', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, fontSize: 12)),
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            const Text('TARGET & PENCAPAIAN (OKR)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
            const SizedBox(height: 12),
            
            _buildTargetItem(context, title: 'Penyelesaian Proyek Migrasi Aplikasi', target: '100%', achieved: '100%', progress: 1.0, color: Colors.green),
            _buildTargetItem(context, title: 'Zero Critical Bugs di Produksi', target: '0 Bugs', achieved: '2 Bugs', progress: 0.8, color: Colors.orange),
            _buildTargetItem(context, title: 'Pencapaian Kehadiran Bulanan', target: '95%', achieved: '98%', progress: 0.98, color: AppConstants.primaryColor),
            
            const SizedBox(height: 24),
            const Text('CATATAN MANAJER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), border: Border.all(color: context.borderColor)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(radius: 16, backgroundColor: context.borderColor, child: const Icon(Icons.person, size: 16, color: Colors.grey)),
                      const SizedBox(width: 12),
                      Text('Budi Santoso (VP Engineering)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text('"Kerja bagus dalam menyelesaikan migrasi React Native ke Flutter tepat waktu. Pertahankan kecepatan dan teliti ulang beberapa bug kecil yang tersisa."', style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: context.textSecondary, height: 1.5)),
                ],
              ),
            ),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildTargetItem(BuildContext context, {required String title, required String target, required String achieved, required double progress, required Color color}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: Offset(0, 2))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: context.textPrimary)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Target: $target', style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
              Text('Tercapai: $achieved', style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 6,
            decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(3)),
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
