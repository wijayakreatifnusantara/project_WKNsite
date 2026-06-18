import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/notification_service.dart';
import '../../../widgets/ios_card.dart';

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
        backgroundColor: isApproved ? CupertinoColors.activeGreen : CupertinoColors.destructiveRed,
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Persetujuan Tim'),
        previousPageTitle: 'Kembali',
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
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
          child: const Icon(CupertinoIcons.bell_fill),
        ),
      ),
      child: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                await Future.delayed(const Duration(seconds: 1)); // Mock refresh
                setState(() {}); // Trigger rebuild
              },
            ),
            if (_pendingApprovals.isEmpty)
              SliverFillRemaining(
                child: _buildEmptyState(isDark),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = _pendingApprovals[index];
                      return Dismissible(
                        key: Key(item['id']),
                        background: _buildSwipeBackground(CupertinoColors.activeGreen, CupertinoIcons.check_mark, Alignment.centerLeft, 'Setujui', isDark),
                        secondaryBackground: _buildSwipeBackground(CupertinoColors.destructiveRed, CupertinoIcons.clear, Alignment.centerRight, 'Tolak', isDark),
                        onDismissed: (direction) {
                          _handleApprove(index, direction == DismissDirection.startToEnd);
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: IosCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: item['type'] == 'Cuti' ? CupertinoColors.systemOrange.withValues(alpha: 0.1) : (item['type'] == 'Lembur' ? CupertinoColors.activeBlue.withValues(alpha: 0.1) : CupertinoColors.systemPurple.withValues(alpha: 0.1)),
                                        borderRadius: BorderRadius.circular(6)
                                      ),
                                      child: Text(item['type'], style: TextStyle(
                                        fontSize: 10, fontWeight: FontWeight.bold,
                                        color: item['type'] == 'Cuti' ? CupertinoColors.systemOrange : (item['type'] == 'Lembur' ? CupertinoColors.activeBlue : CupertinoColors.systemPurple)
                                      )),
                                    ),
                                    const Text('Menunggu Review', style: TextStyle(fontSize: 10, color: CupertinoColors.systemOrange, fontWeight: FontWeight.bold))
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Container(
                                      width: 40, height: 40,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6,
                                      ),
                                      child: Center(child: Text(item['avatar'], style: const TextStyle(fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey))),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(item['name'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                          const SizedBox(height: 2),
                                          Text(item['date'], style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                    )
                                  ],
                                ),
                                  const SizedBox(height: 12),
                                  Text(item['desc'], style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                                  const SizedBox(height: 16),
                                  Row(
                                  children: [
                                    Expanded(
                                      child: CupertinoButton(
                                        padding: EdgeInsets.zero,
                                        color: CupertinoColors.destructiveRed.withValues(alpha: 0.1),
                                        onPressed: () => _handleApprove(index, false),
                                        child: const Text('Tolak', style: TextStyle(color: CupertinoColors.destructiveRed, fontWeight: FontWeight.bold, fontSize: 14)),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: CupertinoButton(
                                        padding: EdgeInsets.zero,
                                        color: CupertinoColors.activeGreen,
                                        onPressed: () => _handleApprove(index, true),
                                        child: const Text('Setujui', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                    childCount: _pendingApprovals.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwipeBackground(Color color, IconData icon, Alignment alignment, String text, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
      alignment: alignment,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: CupertinoColors.white, size: 28),
          const SizedBox(height: 4),
          Text(text, style: const TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(CupertinoIcons.checkmark_seal_fill, size: 64, color: CupertinoColors.activeGreen),
          const SizedBox(height: 16),
          Text('Semua pengajuan telah direview!', style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
        ],
      ),
    );
  }
}
