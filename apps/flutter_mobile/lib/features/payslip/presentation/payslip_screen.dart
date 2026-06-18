import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/payslip_service.dart';
import '../data/payslip_model.dart';
import '../../../widgets/ios_card.dart';

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

    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Slip Gaji Digital'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => context.push('/salary-details'),
          child: const Icon(CupertinoIcons.doc_text_search),
        ),
      ),
      child: SafeArea(
        child: _isLoading 
          ? Center(child: CupertinoActivityIndicator(radius: 16, color: themeColor))
          : _salaryData == null
              ? _buildEmptyState(isDark)
              : CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    CupertinoSliverRefreshControl(
                      onRefresh: _fetchData,
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          // Summary Card
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: themeColor,
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(color: themeColor.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10)),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Total Gaji Bersih (Take Home Pay)', style: TextStyle(color: CupertinoColors.white.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Text(_formatCurrency(netSalary), style: const TextStyle(color: CupertinoColors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -1)),
                                const SizedBox(height: 20),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(color: CupertinoColors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                                  child: Text(_selectedMonth, style: const TextStyle(color: CupertinoColors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                )
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Earnings
                          const Text('PENERIMAAN / EARNINGS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, color: CupertinoColors.systemGrey)),
                          const SizedBox(height: 8),
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: Column(
                              children: [
                                ...earnings.asMap().entries.map((entry) {
                                  int idx = entry.key;
                                  var e = entry.value;
                                  return _buildDetailRow(e['label'], _formatCurrency(e['value']), isDark ? CupertinoColors.white : CupertinoColors.black, isLast: idx == earnings.length - 1);
                                }),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildTotalRow('Total Penerimaan Bruto', _formatCurrency(totalEarnings), CupertinoColors.activeGreen),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Deductions
                          const Text('POTONGAN / DEDUCTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, color: CupertinoColors.systemGrey)),
                          const SizedBox(height: 8),
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: Column(
                              children: [
                                ...deductions.asMap().entries.map((entry) {
                                  int idx = entry.key;
                                  var d = entry.value;
                                  return _buildDetailRow(d['label'], '- ${_formatCurrency(d['value'])}', CupertinoColors.destructiveRed, isLast: idx == deductions.length - 1);
                                }),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildTotalRow('Total Potongan', _formatCurrency(totalDeductions), CupertinoColors.destructiveRed),
                              ],
                            ),
                          ),
                          const SizedBox(height: 32),

                          // Download Btn
                          SizedBox(
                            width: double.infinity,
                            child: CupertinoButton.filled(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur unduh PDF menggunakan package printing (segera ditambahkan)')));
                              },
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(CupertinoIcons.arrow_down_doc_fill, size: 20),
                                  SizedBox(width: 8),
                                  Text('UNDUH PDF (E-PAYSLIP)', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'Dokumen ini dihasilkan secara otomatis oleh sistem WKNsite dan merupakan bukti pembayaran gaji yang sah sesuai dengan regulasi perusahaan.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 10, color: CupertinoColors.systemGrey, height: 1.5),
                          ),
                          const SizedBox(height: 50),
                        ]),
                      ),
                    ),
                  ],
                ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(CupertinoIcons.doc_text_search, size: 64, color: CupertinoColors.systemGrey),
            const SizedBox(height: 20),
            Text('Slip Gaji Belum Tersedia', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
            const SizedBox(height: 10),
            const Text('Admin belum mempublikasikan gaji Anda.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: CupertinoColors.systemGrey)),
            const SizedBox(height: 24),
            CupertinoButton.filled(
              onPressed: _fetchData,
              child: const Text('Coba Lagi'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, Color valueColor, {bool isLast = false}) {
    final isDark = context.isDarkMode;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: TextStyle(fontSize: 14, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
              Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: valueColor)),
            ],
          ),
        ),
        if (!isLast) const Divider(height: 1, indent: 16, color: CupertinoColors.systemGrey4),
      ],
    );
  }

  Widget _buildTotalRow(String label, String value, Color valueColor) {
    final isDark = context.isDarkMode;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: valueColor)),
        ],
      ),
    );
  }
}
