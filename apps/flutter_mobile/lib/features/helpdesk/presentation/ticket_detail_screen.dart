import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import '../../../core/utils/constants.dart';

class TicketDetailScreen extends StatelessWidget {
  final Map<String, dynamic> ticket;

  const TicketDetailScreen({super.key, required this.ticket});

  Color _getStatusColor(String status) {
    if (status == 'SELESAI') return Colors.green;
    if (status == 'DIPROSES') return Colors.orange;
    return Colors.red;
  }

  String _getStatusDesc(String status) {
    if (status == 'SELESAI') return 'Tiket Anda telah diselesaikan oleh tim kami.';
    if (status == 'DIPROSES') return 'Tim kami sedang memeriksa dan mengerjakan keluhan Anda.';
    return 'Tiket Anda telah diterima dan mengantri untuk diproses oleh tim kami.';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Detail Tiket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))
                ]
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('No. Tiket', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                      Text(ticket['date'], style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(ticket['id'], style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                  const Divider(height: 32),
                  
                  const Text('Subjek Kendala', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  Text(ticket['subject'], style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: context.textPrimary)),
                  
                  const SizedBox(height: 20),
                  const Text('Kategori', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  Text(ticket['category'], style: TextStyle(fontSize: 14, color: context.textPrimary)),
                  
                  const SizedBox(height: 20),
                  const Text('Status Terkini', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _getStatusColor(ticket['status']).withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _getStatusColor(ticket['status']).withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          ticket['status'] == 'SELESAI' ? Icons.check_circle : (ticket['status'] == 'DIPROSES' ? Icons.hourglass_top : Icons.pending_actions),
                          color: _getStatusColor(ticket['status']),
                          size: 32,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(ticket['status'], style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _getStatusColor(ticket['status']))),
                              const SizedBox(height: 4),
                              Text(_getStatusDesc(ticket['status']), style: TextStyle(fontSize: 12, color: context.textSecondary)),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
