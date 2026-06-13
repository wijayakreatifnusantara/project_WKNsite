import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class TicketHistoryScreen extends StatefulWidget {
  const TicketHistoryScreen({super.key});

  @override
  State<TicketHistoryScreen> createState() => _TicketHistoryScreenState();
}

class _TicketHistoryScreenState extends State<TicketHistoryScreen> {
  // Dummy Data for UI
  final List<Map<String, dynamic>> _tickets = [
    {
      'id': 'TKT-20260601-01',
      'subject': 'Laptop Sering Blue Screen',
      'category': 'IT Support',
      'status': 'SELESAI',
      'date': '01 Jun 2026',
    },
    {
      'id': 'TKT-20260610-02',
      'subject': 'Request Akses VPN',
      'category': 'IT Support',
      'status': 'DIPROSES',
      'date': '10 Jun 2026',
    },
    {
      'id': 'TKT-20260613-03',
      'subject': 'Tanya Jatah Cuti Tahunan',
      'category': 'HR & Kepegawaian',
      'status': 'BELUM DIPROSES',
      'date': '13 Jun 2026',
    },
  ];

  Color _getStatusColor(String status) {
    if (status == 'SELESAI') return Colors.green;
    if (status == 'DIPROSES') return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Riwayat Tiket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _tickets.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final ticket = _tickets[index];
          return InkWell(
            onTap: () {
              // Pass the ticket data through route state
              context.push('/helpdesk-detail', extra: ticket);
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.borderColor),
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
                      Text(ticket['id'], style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                      Text(ticket['date'], style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(ticket['subject'], style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: context.textPrimary)),
                  const SizedBox(height: 4),
                  Text(ticket['category'], style: TextStyle(fontSize: 13, color: context.textSecondary)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(ticket['status']).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      ticket['status'],
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _getStatusColor(ticket['status'])),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
