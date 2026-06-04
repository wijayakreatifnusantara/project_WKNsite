class SalaryData {
  final String id;
  final String employeeId;
  final String period;
  final String grade;
  
  final double basicSalary;
  final double positionAllowance;
  final double skillAllowance;
  final double communicationAllowance;
  final double workOrderAllowance;
  final double mealsAllowance;
  final double transportAllowance;
  final double overtimeAllowance;
  final double taxAllowance;
  
  final double thr;
  final double bonus;
  final double incentive;
  final double miscEarnings;

  final double pph21;
  final double deductionJht;
  final double deductionPensiun;
  final double deductionKesehatan;
  final double bpjsTkJkk;
  final double bpjsTkJkm;
  final double bpjsTkJht;
  final double bpjsTkPensiun;
  final double bpjsKesehatan;
  
  final double loan;
  final double miscDeductions;

  SalaryData({
    required this.id,
    required this.employeeId,
    required this.period,
    required this.grade,
    this.basicSalary = 0,
    this.positionAllowance = 0,
    this.skillAllowance = 0,
    this.communicationAllowance = 0,
    this.workOrderAllowance = 0,
    this.mealsAllowance = 0,
    this.transportAllowance = 0,
    this.overtimeAllowance = 0,
    this.taxAllowance = 0,
    this.thr = 0,
    this.bonus = 0,
    this.incentive = 0,
    this.miscEarnings = 0,
    this.pph21 = 0,
    this.deductionJht = 0,
    this.deductionPensiun = 0,
    this.deductionKesehatan = 0,
    this.bpjsTkJkk = 0,
    this.bpjsTkJkm = 0,
    this.bpjsTkJht = 0,
    this.bpjsTkPensiun = 0,
    this.bpjsKesehatan = 0,
    this.loan = 0,
    this.miscDeductions = 0,
  });

  factory SalaryData.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is int) return value.toDouble();
      if (value is double) return value;
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    return SalaryData(
      id: json['id']?.toString() ?? '',
      employeeId: json['employee_id']?.toString() ?? '',
      period: json['period'] ?? 'April 2026',
      grade: json['grade'] ?? '-',
      basicSalary: parseDouble(json['basic_salary']),
      positionAllowance: parseDouble(json['position_allowance']),
      skillAllowance: parseDouble(json['skill_allowance']),
      communicationAllowance: parseDouble(json['communication_allowance']),
      workOrderAllowance: parseDouble(json['work_order_allowance']),
      mealsAllowance: parseDouble(json['meals_allowance']),
      transportAllowance: parseDouble(json['transport_allowance']),
      overtimeAllowance: parseDouble(json['overtime_allowance']),
      taxAllowance: parseDouble(json['tax_allowance']),
      thr: parseDouble(json['thr']),
      bonus: parseDouble(json['bonus']),
      incentive: parseDouble(json['incentive']),
      miscEarnings: parseDouble(json['misc_earnings']),
      pph21: parseDouble(json['pph21']),
      deductionJht: parseDouble(json['deduction_jht']),
      deductionPensiun: parseDouble(json['deduction_pensiun']),
      deductionKesehatan: parseDouble(json['deduction_kesehatan']),
      bpjsTkJkk: parseDouble(json['bpjs_tk_jkk']),
      bpjsTkJkm: parseDouble(json['bpjs_tk_jkm']),
      bpjsTkJht: parseDouble(json['bpjs_tk_jht']),
      bpjsTkPensiun: parseDouble(json['bpjs_tk_pensiun']),
      bpjsKesehatan: parseDouble(json['bpjs_kesehatan']),
      loan: parseDouble(json['loan']),
      miscDeductions: parseDouble(json['misc_deductions']),
    );
  }
}

class CompanyTemplate {
  final String companyName;
  final String primaryColor;
  final bool showCompanyAddress;
  final String companyAddress;
  final bool watermarkEnabled;
  final String? headerLogoUrl;

  CompanyTemplate({
    required this.companyName,
    required this.primaryColor,
    required this.showCompanyAddress,
    required this.companyAddress,
    required this.watermarkEnabled,
    this.headerLogoUrl,
  });

  factory CompanyTemplate.fromJson(Map<String, dynamic> json) {
    return CompanyTemplate(
      companyName: json['company_name'] ?? 'PT. Wijaya Kreatif Nusantara',
      primaryColor: json['primary_color'] ?? '#F97316',
      showCompanyAddress: json['show_company_address'] ?? true,
      companyAddress: json['company_address'] ?? 'Gedung WKNsite, Jl. Sudirman Kav. 1, Jakarta 12190',
      watermarkEnabled: json['watermark_enabled'] ?? true,
      headerLogoUrl: json['header_logo_url'],
    );
  }
}
