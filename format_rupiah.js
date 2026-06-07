const fs = require('fs');

const filePath = 'E:/project_WKNsite/apps/client/src/features/Employees/pages/EmployeeForm.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Insert RupiahInput
const rupiahInputCode = `
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
    return rupiah ? \`Rp \${rupiah}\` : '';
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
`;

if (!content.includes('const RupiahInput =')) {
    content = content.replace('const EmployeeForm = () => {', rupiahInputCode + '\nconst EmployeeForm = () => {');
}

// 2. Replace all salary inputs
const lines = content.split('\n');
let inFinancialTab = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const renderFinancialTab = () => (')) {
        inFinancialTab = true;
    }
    if (inFinancialTab && lines[i].includes('<input type="number"')) {
        lines[i] = lines[i].replace('<input type="number"', '<RupiahInput');
    }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
console.log("Replaced successfully!");
