try {
    const fs = require('fs');
    const code = fs.readFileSync('e:/project_website_database_gaji/js/main.js', 'utf8');
    new Function(code);
    console.log("Syntax OK");
} catch (e) {
    console.log("Syntax ERROR:");
    console.log(e.message);
    console.log(e.stack);
}
