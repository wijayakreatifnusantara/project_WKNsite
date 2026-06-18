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

class SalaryDetailsScreen extends StatefulWidget {
  const SalaryDetailsScreen({super.key});

  @override
  State<SalaryDetailsScreen> createState() => _SalaryDetailsScreenState();
}

class _SalaryDetailsScreenState extends State<SalaryDetailsScreen> {
  final PayslipService _payslipService = PayslipService();
  bool _isLoading = true;
  SalaryData? _salaryData;

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
        final data = await _payslipService.getSalaryDetailsSupabase(user['id']);
        if (mounted) {
          setState(() {
            _salaryData = data;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching salary details: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatCurrency(double amount) {
    return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    double fixedTotal = 0;
    double variableTotal = 0;
    double nonWageTotal = 0;
    double totalEarnings = 0;
    double totalDeductions = 0;
    double netSalary = 0;

    if (_salaryData != null) {
      fixedTotal = _salaryData!.basicSalary + _salaryData!.positionAllowance + _salaryData!.skillAllowance + _salaryData!.communicationAllowance + _salaryData!.bpjsTkJkk + _salaryData!.bpjsTkJkm + _salaryData!.bpjsTkJht + _salaryData!.bpjsTkPensiun + _salaryData!.bpjsKesehatan + _salaryData!.taxAllowance;
      variableTotal = _salaryData!.workOrderAllowance + _salaryData!.mealsAllowance + _salaryData!.transportAllowance + _salaryData!.overtimeAllowance;
      nonWageTotal = _salaryData!.thr + _salaryData!.bonus + _salaryData!.incentive + _salaryData!.miscEarnings;
      totalEarnings = fixedTotal + variableTotal + nonWageTotal;
      totalDeductions = _salaryData!.pph21 + _salaryData!.deductionJht + _salaryData!.deductionPensiun + _salaryData!.deductionKesehatan + _salaryData!.loan + _salaryData!.miscDeductions;
      netSalary = totalEarnings - totalDeductions;
    }

    if (_isLoading) {
      return CupertinoPageScaffold(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
        navigationBar: CupertinoNavigationBar(
          backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
          middle: const Text('Rincian Gaji'),
        ),
        child: const Center(child: CupertinoActivityIndicator(radius: 16)),
      );
    }

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Rincian Gaji'),
        previousPageTitle: 'Gaji',
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _fetchData,
          child: const Icon(CupertinoIcons.refresh),
        ),
      ),
      child: SafeArea(
        child: _salaryData == null
            ? _buildEmptyState(isDark)
            : CustomScrollView(
                slivers: [
                  CupertinoSliverRefreshControl(
                    onRefresh: _fetchData,
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Summary THP
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppConstants.primaryColor,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 8))],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Take Home Pay (THP)', style: TextStyle(color: CupertinoColors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Text(_formatCurrency(netSalary), style: const TextStyle(color: CupertinoColors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -1)),
                                const SizedBox(height: 20),
                                const Divider(color: Colors.white30, height: 1),
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('Total Penerimaan', style: TextStyle(color: CupertinoColors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 4),
                                          Text(_formatCurrency(totalEarnings), style: const TextStyle(color: CupertinoColors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('Total Potongan', style: TextStyle(color: CupertinoColors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 4),
                                          Text(_formatCurrency(totalDeductions), style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 15, fontWeight: FontWeight.w800)),
                                        ],
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Grade
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: _buildInputRow('Grade / Golongan', _salaryData!.grade, isDark),
                          ),
                          const SizedBox(height: 24),

                          // Fixed Allowance
                          _buildSectionTitle('FIXED ALLOWANCE', CupertinoIcons.money_dollar_circle),
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: Column(
                              children: [
                                _buildInputRow('1. Gaji Pokok (Basic Salary)', _formatCurrency(_salaryData!.basicSalary), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('2. Tunjangan Posisi', _formatCurrency(_salaryData!.positionAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('3. Tunjangan Keahlian', _formatCurrency(_salaryData!.skillAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('4. Tunj. Komunikasi', _formatCurrency(_salaryData!.communicationAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('5. BPJS TK JKK', _formatCurrency(_salaryData!.bpjsTkJkk), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('6. BPJS TK JKM', _formatCurrency(_salaryData!.bpjsTkJkm), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('7. BPJS TK JHT', _formatCurrency(_salaryData!.bpjsTkJht), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('8. BPJS TK Pensiun', _formatCurrency(_salaryData!.bpjsTkPensiun), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('9. BPJS Kesehatan', _formatCurrency(_salaryData!.bpjsKesehatan), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('10. Tunjangan Pajak', _formatCurrency(_salaryData!.taxAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildTotalRow('Total Fixed Allowance', _formatCurrency(fixedTotal), CupertinoColors.activeGreen, isDark),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Variable Allowance
                          _buildSectionTitle('VARIABLE ALLOWANCE', CupertinoIcons.chart_bar_alt_fill),
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: Column(
                              children: [
                                _buildInputRow('1. Tunjangan Work Order', _formatCurrency(_salaryData!.workOrderAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('2. Tunjangan Makan', _formatCurrency(_salaryData!.mealsAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('3. Tunjangan Transport', _formatCurrency(_salaryData!.transportAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('4. Tunjangan Lembur', _formatCurrency(_salaryData!.overtimeAllowance), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildTotalRow('Total Variable Allowance', _formatCurrency(variableTotal), CupertinoColors.activeGreen, isDark),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Non Wage
                          _buildSectionTitle('NON-WAGE INCOME', CupertinoIcons.gift_fill),
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: Column(
                              children: [
                                _buildInputRow('1. THR', _formatCurrency(_salaryData!.thr), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('2. Bonus', _formatCurrency(_salaryData!.bonus), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('3. Insentif', _formatCurrency(_salaryData!.incentive), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('4. Penerimaan Lain', _formatCurrency(_salaryData!.miscEarnings), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildTotalRow('Total Non-Wage Income', _formatCurrency(nonWageTotal), CupertinoColors.activeGreen, isDark),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Deductions
                          _buildSectionTitle('DEDUCTIONS / POTONGAN', CupertinoIcons.minus_circle_fill),
                          IosCard(
                            padding: EdgeInsets.zero,
                            child: Column(
                              children: [
                                _buildInputRow('1. PPh 21', _formatCurrency(_salaryData!.pph21), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('2. BPJS TK JHT', _formatCurrency(_salaryData!.deductionJht), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('3. BPJS TK Pensiun', _formatCurrency(_salaryData!.deductionPensiun), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('4. BPJS Kesehatan', _formatCurrency(_salaryData!.deductionKesehatan), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('5. Pinjaman / Loan', _formatCurrency(_salaryData!.loan), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildInputRow('6. Potongan Lain-lain', _formatCurrency(_salaryData!.miscDeductions), isDark),
                                const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                _buildTotalRow('Total Potongan', _formatCurrency(totalDeductions), CupertinoColors.destructiveRed, isDark),
                              ],
                            ),
                          ),
                          const SizedBox(height: 32),

                          // Correction Button
                          SizedBox(
                            width: double.infinity,
                            child: CupertinoButton(
                              color: CupertinoColors.destructiveRed.withValues(alpha: 0.1),
                              onPressed: () => context.push('/salary-correction'),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(CupertinoIcons.exclamationmark_triangle_fill, color: CupertinoColors.destructiveRed, size: 20),
                                  SizedBox(width: 8),
                                  Text('AJUKAN KOREKSI GAJI', style: TextStyle(color: CupertinoColors.destructiveRed, fontWeight: FontWeight.bold, fontSize: 14)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Ini adalah rincian gaji resmi Anda yang diinput oleh HR/Admin. Karyawan tidak dapat mengubah rincian ini. Jika ada ketidaksesuaian nominal, segera ajukan form koreksi gaji.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, height: 1.5),
                          ),
                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  )
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
            Text('Data Gaji Belum Tersedia', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
            const SizedBox(height: 10),
            const Text('Admin belum menginput data gaji Anda ke dalam sistem.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: CupertinoColors.systemGrey)),
            const SizedBox(height: 20),
            CupertinoButton.filled(
              onPressed: _fetchData,
              child: const Text('Coba Lagi'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 16),
      child: Row(
        children: [
          Icon(icon, size: 16, color: CupertinoColors.systemGrey),
          const SizedBox(width: 6),
          Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
        ],
      ),
    );
  }

  Widget _buildInputRow(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 5,
            child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? CupertinoColors.systemGrey2 : CupertinoColors.systemGrey)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 4,
            child: Text(value, textAlign: TextAlign.right, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
          )
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, String value, Color valueColor, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16))
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
          Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: valueColor)),
        ],
      ),
    );
  }
}
