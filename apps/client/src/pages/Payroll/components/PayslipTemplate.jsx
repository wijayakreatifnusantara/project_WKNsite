import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#E31E24',
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31E24',
  },
  payslipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#f1f5f9',
  },
  colDesc: { flex: 3 },
  colAmount: { flex: 1, textAlign: 'right' },
  totalSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    padding: 4,
  },
  netPayLabel: {
    flex: 3,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
  },
  netPayValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#E31E24',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

const PayslipTemplate = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>PT WIJAYA KARYA NYATA</Text>
          <Text>Corporate Management System</Text>
        </View>
        <View>
          <Text style={styles.payslipTitle}>OFFICIAL PAYSLIP</Text>
          <Text style={{ textAlign: 'right' }}>Period: {data.period}</Text>
        </View>
      </View>

      {/* Employee Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Employee Name</Text>
          <Text style={styles.infoValue}>{data.employee_name}</Text>
          <Text style={[styles.infoLabel, { marginTop: 10 }]}>Employee ID</Text>
          <Text style={styles.infoValue}>{data.employee_id}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Tax Category</Text>
          <Text style={styles.infoValue}>Category {data.tax_category}</Text>
          <Text style={[styles.infoLabel, { marginTop: 10 }]}>Payment Status</Text>
          <Text style={[styles.infoValue, { color: '#10b981' }]}>PAID</Text>
        </View>
      </View>

      {/* Earnings Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>EARNINGS</Text>
          <Text style={styles.colAmount}>AMOUNT</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>Base Salary</Text>
          <Text style={styles.colAmount}>{formatCurrency(data.base_salary)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>Allowances (Position, Meal, Comm, Trans)</Text>
          <Text style={styles.colAmount}>{formatCurrency(data.allowances_total)}</Text>
        </View>
      </View>

      {/* Deductions Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>DEDUCTIONS</Text>
          <Text style={styles.colAmount}>AMOUNT</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>Income Tax (PPh 21 TER)</Text>
          <Text style={styles.colAmount}>- {formatCurrency(data.tax_deduction)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>BPJS Kesehatan (Employee Share)</Text>
          <Text style={styles.colAmount}>- {formatCurrency(data.bpjs_health_employee)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>BPJS Ketenagakerjaan (Employee Share)</Text>
          <Text style={styles.colAmount}>- {formatCurrency(data.bpjs_employment_employee)}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={{ flex: 3, textAlign: 'right', paddingRight: 10 }}>Total Gross Earnings:</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>{formatCurrency(data.gross_salary)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={{ flex: 3, textAlign: 'right', paddingRight: 10 }}>Total Deductions:</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>- {formatCurrency(data.tax_deduction + data.bpjs_health_employee + data.bpjs_employment_employee)}</Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 10 }]}>
          <Text style={styles.netPayLabel}>TAKE HOME PAY (NET):</Text>
          <Text style={styles.netPayValue}>{formatCurrency(data.net_salary)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>This is a computer generated document. No signature is required.</Text>
        <Text>© 2026 PT WIJAYA KARYA NYATA - Corporate Intelligence Engine</Text>
      </View>
    </Page>
  </Document>
);

export default PayslipTemplate;
