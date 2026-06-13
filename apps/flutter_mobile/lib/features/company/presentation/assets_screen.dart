import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class AssetsScreen extends StatelessWidget {
  const AssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Aset Perusahaan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        actions: [
          IconButton(icon: const Icon(Icons.qr_code_scanner, color: AppConstants.primaryColor), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.blue.shade100)),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.blue),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('Berikut adalah daftar aset perusahaan yang dipinjamkan atau menjadi tanggung jawab Anda saat ini.', style: TextStyle(fontSize: 12, color: Colors.blue))),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            const Text('ASET AKTIF', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
            const SizedBox(height: 12),
            
            _buildAssetItem(
              context,
              name: 'MacBook Pro M2 14"',
              assetCode: 'WKN-AST-IT-0012',
              dateAssigned: '15 Jan 2024',
              status: 'Kondisi Baik',
              icon: Icons.laptop_mac
            ),
            _buildAssetItem(
              context,
              name: 'Monitor LG 27"',
              assetCode: 'WKN-AST-IT-0089',
              dateAssigned: '15 Jan 2024',
              status: 'Kondisi Baik',
              icon: Icons.monitor
            ),
            _buildAssetItem(
              context,
              name: 'ID Card & Access Key',
              assetCode: 'WKN-AST-HR-0442',
              dateAssigned: '10 Jan 2024',
              status: 'Kondisi Baik',
              icon: Icons.badge_outlined
            ),
            
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.report_problem_outlined, color: Colors.red),
                label: const Text('LAPORKAN MASALAH ASET', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildAssetItem(BuildContext context, {required String name, required String assetCode, required String dateAssigned, required String status, required IconData icon}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))]),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: Colors.grey.shade700, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textPrimary)),
                const SizedBox(height: 4),
                Text(assetCode, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Diterima: $dateAssigned', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                      child: Text(status, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.green)),
                    )
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
