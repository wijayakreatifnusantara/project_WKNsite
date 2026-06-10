import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/payslip_service.dart';
import '../data/payslip_model.dart';

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

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Rincian Gaji', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
        : _salaryData == null
            ? _buildEmptyState()
            : RefreshIndicator(
                onRefresh: _fetchData,
                color: AppConstants.primaryColor,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Summary THP
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppConstants.primaryColor,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 8))],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Take Home Pay (THP)', style: TextStyle(color: context.surfaceColor.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.bold)),
                            SizedBox(height: 8),
                            Text(_formatCurrency(netSalary), style: TextStyle(color: context.surfaceColor, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: -1)),
                            const SizedBox(height: 16),
                            const Divider(color: Colors.white24, height: 1),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Total Penerimaan', style: TextStyle(color: context.surfaceColor.withValues(alpha: 0.7), fontSize: 11, fontWeight: FontWeight.bold)),
                                      Text(_formatCurrency(totalEarnings), style: TextStyle(color: context.surfaceColor, fontSize: 16, fontWeight: FontWeight.w800)),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Total Potongan', style: TextStyle(color: context.surfaceColor.withValues(alpha: 0.7), fontSize: 11, fontWeight: FontWeight.bold)),
                                      Text(_formatCurrency(totalDeductions), style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 16, fontWeight: FontWeight.w800)),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Grade
                      _buildCard([_buildInputRow('Grade / Golongan', _salaryData!.grade)]),

                      // Fixed Allowance
                      _buildSectionTitle('FIXED ALLOWANCE', Icons.account_balance_wallet_outlined),
                      _buildCard([
                        _buildInputRow('1. Gaji Pokok (Basic Salary)', _formatCurrency(_salaryData!.basicSalary)),
                        _buildInputRow('2. Tunjangan Posisi', _formatCurrency(_salaryData!.positionAllowance)),
                        _buildInputRow('3. Tunjangan Keahlian', _formatCurrency(_salaryData!.skillAllowance)),
                        _buildInputRow('4. Tunjangan Komunikasi', _formatCurrency(_salaryData!.communicationAllowance)),
                        _buildInputRow('5. BPJS TK JKK', _formatCurrency(_salaryData!.bpjsTkJkk)),
                        _buildInputRow('6. BPJS TK JKM', _formatCurrency(_salaryData!.bpjsTkJkm)),
                        _buildInputRow('7. BPJS TK JHT', _formatCurrency(_salaryData!.bpjsTkJht)),
                        _buildInputRow('8. BPJS TK Pensiun', _formatCurrency(_salaryData!.bpjsTkPensiun)),
                        _buildInputRow('9. BPJS Kesehatan', _formatCurrency(_salaryData!.bpjsKesehatan)),
                        _buildInputRow('10. Tunjangan Pajak', _formatCurrency(_salaryData!.taxAllowance)),
                        const Divider(height: 24),
                        _buildTotalRow('Total Fixed Allowance', _formatCurrency(fixedTotal), Colors.green),
                      ]),

                      // Variable Allowance
                      _buildSectionTitle('VARIABLE ALLOWANCE', Icons.trending_up),
                      _buildCard([
                        _buildInputRow('1. Tunjangan Work Order', _formatCurrency(_salaryData!.workOrderAllowance)),
                        _buildInputRow('2. Tunjangan Makan', _formatCurrency(_salaryData!.mealsAllowance)),
                        _buildInputRow('3. Tunjangan Transport', _formatCurrency(_salaryData!.transportAllowance)),
                        _buildInputRow('4. Tunjangan Lembur', _formatCurrency(_salaryData!.overtimeAllowance)),
                        const Divider(height: 24),
                        _buildTotalRow('Total Variable Allowance', _formatCurrency(variableTotal), Colors.green),
                      ]),

                      // Non Wage
                      _buildSectionTitle('NON-WAGE INCOME', Icons.card_giftcard),
                      _buildCard([
                        _buildInputRow('1. THR', _formatCurrency(_salaryData!.thr)),
                        _buildInputRow('2. Bonus', _formatCurrency(_salaryData!.bonus)),
                        _buildInputRow('3. Insentif', _formatCurrency(_salaryData!.incentive)),
                        _buildInputRow('4. Penerimaan Lain-lain', _formatCurrency(_salaryData!.miscEarnings)),
                        const Divider(height: 24),
                        _buildTotalRow('Total Non-Wage Income', _formatCurrency(nonWageTotal), Colors.green),
                      ]),

                      // Deductions
                      _buildSectionTitle('DEDUCTIONS / POTONGAN', Icons.remove_circle_outline),
                      _buildCard([
                        _buildInputRow('1. PPh 21', _formatCurrency(_salaryData!.pph21)),
                        _buildInputRow('2. BPJS TK JHT', _formatCurrency(_salaryData!.deductionJht)),
                        _buildInputRow('3. BPJS TK Pensiun', _formatCurrency(_salaryData!.deductionPensiun)),
                        _buildInputRow('4. BPJS Kesehatan', _formatCurrency(_salaryData!.deductionKesehatan)),
                        _buildInputRow('5. Pinjaman / Loan', _formatCurrency(_salaryData!.loan)),
                        _buildInputRow('6. Potongan Lain-lain', _formatCurrency(_salaryData!.miscDeductions)),
                        const Divider(height: 24),
                        _buildTotalRow('Total Potongan', _formatCurrency(totalDeductions), Colors.red),
                      ]),

                      // Correction Button
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            context.push('/salary-correction');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 5,
                          ),
                          icon: Icon(Icons.warning_amber_rounded, color: context.surfaceColor),
                          label: Text('AJUKAN KOREKSI GAJI', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        ),
                      ),
                      SizedBox(height: 20),
                      Text(
                        'Ini adalah rincian gaji resmi Anda yang diinput oleh HR/Admin. Karyawan tidak dapat mengubah rincian ini. Jika ada ketidaksesuaian nominal, segera ajukan form koreksi gaji.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 11, color: context.textSecondary, height: 1.5),
                      ),
                      const SizedBox(height: 40),
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
            Icon(Icons.document_scanner, size: 64, color: Colors.grey),
            SizedBox(height: 20),
            Text('Data Gaji Belum Tersedia', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: context.textPrimary)),
            SizedBox(height: 10),
            Text('Admin belum menginput data gaji Anda ke dalam sistem.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: context.textSecondary)),
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

  Widget _buildSectionTitle(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppConstants.primaryColor),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppConstants.primaryColor, letterSpacing: 1)),
        ],
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildInputRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: context.textPrimary))),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: context.textPrimary)),
          )
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, String value, Color valueColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: context.textPrimary)),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: valueColor)),
      ],
    );
  }
}
