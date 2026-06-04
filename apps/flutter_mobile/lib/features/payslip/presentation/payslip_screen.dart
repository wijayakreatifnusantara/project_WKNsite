import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/payslip_service.dart';
import '../data/payslip_model.dart';

class PayslipScreen extends StatefulWidget {
  const PayslipScreen({super.key});

  @override
  State<PayslipScreen> createState() => _PayslipScreenState();
}

class _PayslipScreenState extends State<PayslipScreen> {
  final PayslipService _payslipService = PayslipService();
  bool _isLoading = true;
  final String _selectedMonth = 'April 2026';
  
  SalaryData? _salaryData;
  CompanyTemplate? _template;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchData();
    });
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final user = context.read<AuthProvider>().userData;
      if (user != null) {
        final result = await _payslipService.getMySalaryApi();
        if (mounted) {
          setState(() {
            _salaryData = result['salary'];
            _template = result['template'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching payslip: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatCurrency(double amount) {
    return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(amount);
  }

  @override
  Widget build(BuildContext context) {
    double totalEarnings = 0;
    double totalDeductions = 0;
    double netSalary = 0;
    
    List<Map<String, dynamic>> earnings = [];
    List<Map<String, dynamic>> deductions = [];

    if (_salaryData != null) {
      void addEarning(String label, double value) {
        if (value > 0) earnings.add({'label': label, 'value': value});
      }
      void addDeduction(String label, double value) {
        if (value > 0) deductions.add({'label': label, 'value': value});
      }

      addEarning('Gaji Pokok', _salaryData!.basicSalary);
      addEarning('Tunjangan Posisi', _salaryData!.positionAllowance);
      addEarning('Tunjangan Keahlian', _salaryData!.skillAllowance);
      addEarning('Tunjangan Komunikasi', _salaryData!.communicationAllowance);
      addEarning('Tunjangan Work Order', _salaryData!.workOrderAllowance);
      addEarning('Tunjangan Makan', _salaryData!.mealsAllowance);
      addEarning('Tunjangan Transport', _salaryData!.transportAllowance);
      addEarning('Tunjangan Lembur', _salaryData!.overtimeAllowance);
      addEarning('Tunjangan Pajak', _salaryData!.taxAllowance);
      addEarning('THR', _salaryData!.thr);
      addEarning('Bonus', _salaryData!.bonus);
      addEarning('Insentif', _salaryData!.incentive);
      addEarning('Lain-lain', _salaryData!.miscEarnings);

      addDeduction('PPh 21', _salaryData!.pph21);
      addDeduction('BPJS TK JHT', _salaryData!.deductionJht);
      addDeduction('BPJS TK Pensiun', _salaryData!.deductionPensiun);
      addDeduction('BPJS Kesehatan', _salaryData!.deductionKesehatan);
      addDeduction('Pinjaman', _salaryData!.loan);
      addDeduction('Potongan Lainnya', _salaryData!.miscDeductions);

      totalEarnings = earnings.fold(0.0, (sum, item) => sum + item['value']);
      totalDeductions = deductions.fold(0.0, (sum, item) => sum + item['value']);
      netSalary = totalEarnings - totalDeductions;
    }

    final Color themeColor = _template?.primaryColor != null 
        ? Color(int.parse(_template!.primaryColor.replaceFirst('#', '0xff')))
        : AppConstants.primaryColor;

    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Slip Gaji Digital', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppConstants.textPrimary),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.document_scanner_outlined, color: AppConstants.textPrimary),
            onPressed: () {
              context.push('/salary-details');
            },
          ),
        ],
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator(color: themeColor))
        : _salaryData == null
            ? _buildEmptyState()
            : RefreshIndicator(
                onRefresh: _fetchData,
                color: themeColor,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Summary Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(30),
                        decoration: BoxDecoration(
                          color: themeColor,
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(color: themeColor.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Total Gaji Bersih (Take Home Pay)', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text(_formatCurrency(netSalary), style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1)),
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                              child: Text(_selectedMonth, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(height: 25),
                      
                      // Earnings
                      const Text('PENERIMAAN / EARNINGS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, color: AppConstants.textSecondary)),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 2))]),
                        child: Column(
                          children: [
                            ...earnings.map((e) => _buildDetailRow(e['label'], _formatCurrency(e['value']), AppConstants.textPrimary)),
                            const Divider(height: 10),
                            _buildTotalRow('Total Penerimaan Bruto', _formatCurrency(totalEarnings), Colors.green),
                          ],
                        ),
                      ),
                      const SizedBox(height: 25),

                      // Deductions
                      const Text('POTONGAN / DEDUCTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, color: AppConstants.textSecondary)),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 2))]),
                        child: Column(
                          children: [
                            ...deductions.map((d) => _buildDetailRow(d['label'], '- ${_formatCurrency(d['value'])}', Colors.red)),
                            const Divider(height: 10),
                            _buildTotalRow('Total Potongan', _formatCurrency(totalDeductions), Colors.red),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Download Btn
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur unduh PDF menggunakan package printing (segera ditambahkan)')));
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E293B),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            elevation: 5,
                          ),
                          icon: const Icon(Icons.download, color: Colors.white),
                          label: const Text('UNDUH PDF (E-PAYSLIP)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        ),
                      ),
                      const SizedBox(height: 25),
                      const Text(
                        'Dokumen ini dihasilkan secara otomatis oleh sistem WKNsite dan merupakan bukti pembayaran gaji yang sah sesuai dengan regulasi perusahaan.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 10, color: AppConstants.textSecondary, height: 1.5),
                      ),
                      const SizedBox(height: 50),
                    ],
                  ),
                ),
              ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.document_scanner, size: 64, color: Colors.grey),
            const SizedBox(height: 20),
            const Text('Slip Gaji Belum Tersedia', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
            const SizedBox(height: 10),
            const Text('Admin belum mempublikasikan gaji Anda.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: AppConstants.textSecondary)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchData,
              child: const Text('Coba Lagi'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, Color valueColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppConstants.textPrimary)),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: valueColor)),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, String value, Color valueColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: valueColor)),
        ],
      ),
    );
  }
}
