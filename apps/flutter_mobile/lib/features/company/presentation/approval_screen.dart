import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

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
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Persetujuan Tim', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: _pendingApprovals.isEmpty
        ? _buildEmptyState()
        : ListView.builder(
            padding: const EdgeInsets.all(16),
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
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: item['type'] == 'Cuti' ? Colors.orange.shade50 : (item['type'] == 'Lembur' ? Colors.blue.shade50 : Colors.purple.shade50),
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
                          CircleAvatar(radius: 20, backgroundColor: Colors.grey.shade100, child: Text(item['avatar'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppConstants.textPrimary)),
                                const SizedBox(height: 2),
                                Text(item['date'], style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(item['desc'], style: const TextStyle(fontSize: 12, color: AppConstants.textSecondary)),
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
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
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
          Icon(icon, color: Colors.white, size: 32),
          const SizedBox(height: 4),
          Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
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
