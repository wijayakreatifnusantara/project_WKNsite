const fs = require('fs');
const content = fs.readFileSync('e:/project_website_database_gaji/js/main.js', 'utf8');
let balance = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = (line.match(/{/g) || []).length;
    const close = (line.match(/}/g) || []).length;
    balance += (open - close);
    console.log(`Line ${i + 1}: ${balance}`);
}
