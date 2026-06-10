import os
import re

TARGET_DIR = r"d:\project_WKNsite\apps\flutter_mobile\lib\features"

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Add import if we need to replace
    needs_import = False
    
    # 1. Colors.white -> context.surfaceColor
    if re.search(r'Colors\.white\b', content) and 'context' in content:
        content = re.sub(r'Colors\.white\b', 'context.surfaceColor', content)
        needs_import = True

    # 2. AppConstants.backgroundColor -> context.backgroundColor
    if re.search(r'AppConstants\.backgroundColor\b', content) and 'context' in content:
        content = re.sub(r'AppConstants\.backgroundColor\b', 'context.backgroundColor', content)
        needs_import = True

    # 3. AppConstants.textPrimary -> context.textPrimary
    if re.search(r'AppConstants\.textPrimary\b', content) and 'context' in content:
        content = re.sub(r'AppConstants\.textPrimary\b', 'context.textPrimary', content)
        needs_import = True

    # 4. AppConstants.textSecondary -> context.textSecondary
    if re.search(r'AppConstants\.textSecondary\b', content) and 'context' in content:
        content = re.sub(r'AppConstants\.textSecondary\b', 'context.textSecondary', content)
        needs_import = True

    # 5. Colors.grey.shade200 or AppConstants.slate200 -> context.borderColor
    if re.search(r'Colors\.grey\.shade200\b', content) and 'context' in content:
        content = re.sub(r'Colors\.grey\.shade200\b', 'context.borderColor', content)
        needs_import = True

    if needs_import and original_content != content:
        # Determine relative path to core/theme/theme_extension.dart
        parts = filepath.replace('\\', '/').split('/lib/')
        if len(parts) > 1:
            depth = len(parts[1].split('/')) - 1
            import_prefix = '../' * depth
            import_stmt = f"import '{import_prefix}core/theme/theme_extension.dart';"
            if "import 'package:flutter/material.dart';" in content:
                content = content.replace("import 'package:flutter/material.dart';", f"import 'package:flutter/material.dart';\n{import_stmt}")
            else:
                content = f"{import_stmt}\n{content}"
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored {filepath}")

for root, _, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith('.dart'):
            refactor_file(os.path.join(root, file))

print("Refactoring complete.")
