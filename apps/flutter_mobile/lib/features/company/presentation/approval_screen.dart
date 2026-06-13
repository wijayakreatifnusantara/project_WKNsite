import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/notification_service.dart';

class ApprovalScreen extends StatefulWidget {
  const ApprovalScreen({super.key});

  @override
  State<ApprovalScreen> createState() => _ApprovalScreenState();
}

class _ApprovalScreenState extends State<ApprovalScreen> {
  final List<Map<String, dynamic>> _pendingApprovals = [
    {
      'id': '1', 'type': 'Cuti', 'name': 'Ahmad Fauzi', 'date': '12 - 14 Jun 2026', 'desc': 'Cuti Tahunan (Acara Keluarga)', 'avatar': 'A'
    },
    {
      'id': '2', 'type': 'Lembur', 'name': 'Rina Kusuma', 'date': '02 Jun 2026', 'desc': 'Lembur penyelesaian laporan akhir bulan (3 Jam)', 'avatar': 'R'
    },
    {
      'id': '3', 'type': 'Reimburse', 'name': 'Budi Santoso', 'date': '01 Jun 2026', 'desc': 'Klaim transportasi dinas ke klien (Rp 150.000)', 'avatar': 'B'
    },
  ];

  void _handleApprove(int index, bool isApproved) {
    final item = _pendingApprovals[index];
    setState(() {
      _pendingApprovals.removeAt(index);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${item['type']} dari ${item['name']} telah ${isApproved ? 'Disetujui' : 'Ditolak'}.'),
        backgroundColor: isApproved ? Colors.green : Colors.red,
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Persetujuan Tim', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Notifikasi tes akan muncul dalam 3 detik. Silakan tutup aplikasi/kembali ke Home.')),
          );
          await Future.delayed(const Duration(seconds: 3));
          await NotificationService().showApprovalNotification(
            'Pengajuan Cuti: Ahmad Fauzi', 
            'Cuti Tahunan (Acara Keluarga) - 12 Jun s.d 14 Jun 2026', 
            'approval_1'
          );
        },
        icon: const Icon(Icons.notification_add, color: Colors.white),
        label: const Text('Test Notif', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.blue,
      ),
      body: _pendingApprovals.isEmpty
        ? _buildEmptyState()
        : ListView.builder(
            padding: const EdgeInsets.all(16).copyWith(bottom: 80),
            itemCount: _pendingApprovals.length,
            itemBuilder: (context, index) {
              final item = _pendingApprovals[index];
              return Dismissible(
                key: Key(item['id']),
                background: _buildSwipeBackground(Colors.green, Icons.check, Alignment.centerLeft, 'Setujui'),
                secondaryBackground: _buildSwipeBackground(Colors.red, Icons.close, Alignment.centerRight, 'Tolak'),
                onDismissed: (direction) {
                  _handleApprove(index, direction == DismissDirection.startToEnd);
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), border: Border.all(color: context.borderColor)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: item['type'] == 'Cuti' ? Colors.orange.withValues(alpha: 0.1) : (item['type'] == 'Lembur' ? Colors.blue.withValues(alpha: 0.1) : Colors.purple.shade50),
                              borderRadius: BorderRadius.circular(6)
                            ),
                            child: Text(item['type'], style: TextStyle(
                              fontSize: 10, fontWeight: FontWeight.bold,
                              color: item['type'] == 'Cuti' ? Colors.orange : (item['type'] == 'Lembur' ? Colors.blue : Colors.purple)
                            )),
                          ),
                          const Text('Menunggu Review', style: TextStyle(fontSize: 10, color: Colors.orange, fontWeight: FontWeight.bold))
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          CircleAvatar(radius: 20, backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest, child: Text(item['avatar'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['name'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textPrimary)),
                                const SizedBox(height: 2),
                                Text(item['date'], style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(item['desc'], style: TextStyle(fontSize: 12, color: context.textSecondary)),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _handleApprove(index, false),
                              style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                              child: const Text('Tolak'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => _handleApprove(index, true),
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: context.surfaceColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                              child: const Text('Setujui'),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              );
            },
          ),
    );
  }

  Widget _buildSwipeBackground(Color color, IconData icon, Alignment alignment, String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
      alignment: alignment,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: context.surfaceColor, size: 32),
          SizedBox(height: 4),
          Text(text, style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.done_all, size: 64, color: Colors.green),
          SizedBox(height: 16),
          Text('Semua pengajuan telah direview!', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }
}
