import re

file_path = r'E:\project_WKNsite\apps\client\src\features\Employees\pages\EmployeeForm.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert RupiahInput
rupiah_input_code = """
const RupiahInput = ({ value, onChange, name, disabled, className, placeholder }) => {
  const formatRupiah = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const numberString = val.toString().replace(/[^,\\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? `Rp ${rupiah}` : '';
  };

  const [displayValue, setDisplayValue] = React.useState(formatRupiah(value));

  React.useEffect(() => {
    setDisplayValue(formatRupiah(value));
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^,\\d]/g, '');
    setDisplayValue(formatRupiah(rawValue));
    if (onChange) {
      onChange({ target: { name, value: rawValue ? parseInt(rawValue, 10) : 0, type: 'number', tagName: 'INPUT' } });
    }
  };

  return (
    <input type="text" name={name} value={displayValue} onChange={handleChange} className={className} disabled={disabled} placeholder={placeholder || "Rp 0"} />
  );
};
"""

if "const RupiahInput =" not in content:
    content = content.replace("const EmployeeForm = () => {", rupiah_input_code + "\nconst EmployeeForm = () => {")

# 2. Replace all salary inputs
lines = content.split('\n')
in_financial_tab = False
for i, line in enumerate(lines):
    if "const renderFinancialTab = () => (" in line:
        in_financial_tab = True
    if in_financial_tab and "<input type=\"number\"" in line:
        lines[i] = line.replace("<input type=\"number\"", "<RupiahInput")
    if in_financial_tab and "Komponen Gaji - Fixed Income" in line:
        # Just to ensure we're targeting the right section
        pass

content = '\n'.join(lines)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced successfully!")
